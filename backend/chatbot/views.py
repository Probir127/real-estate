import os
import json
import logging
import urllib.request
import urllib.error
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from properties.models import Property

logger = logging.getLogger(__name__)

HF_ROUTER_URL = "https://router.huggingface.co/v1/chat/completions"


def format_bdt_price(price):
    if not price:
        return "N/A"
    try:
        num = float(price)
        if num >= 10000000:
            crore = num / 10000000
            return f"৳ {crore:.2f} Crore".rstrip('0').rstrip('.') if crore % 1 != 0 else f"৳ {int(crore)} Crore"
        elif num >= 100000:
            lakh = num / 100000
            return f"৳ {lakh:.2f} Lakh".rstrip('0').rstrip('.') if lakh % 1 != 0 else f"৳ {int(lakh)} Lakh"
        return f"৳ {int(num):,}"
    except Exception:
        return f"৳ {price}"


class ChatbotView(APIView):
    """
    POST /api/chat/
    Intelligent Real Estate AI Assistant powered by Hugging Face Llama 3.1 Instruct
    with grounded database context for Zennor Bangladesh.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        user_message = request.data.get('message', '').strip()
        conversation = request.data.get('messages', [])

        if not user_message and not conversation:
            return Response(
                {'error': 'A message or conversation history is required.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Build active property context from database
        try:
            active_properties = Property.objects.filter(is_published=True).order_by('-is_featured', '-created_at')[:8]
            listings_info = []
            suggested_props = []
            for p in active_properties:
                price_str = format_bdt_price(p.price)
                suffix = "/month" if p.listing_type == 'rent' else ""
                listings_info.append(
                    f"- ID {p.id}: '{p.title}' in {p.city}, {p.state} | {price_str}{suffix} | "
                    f"{p.bedrooms} bed, {p.bathrooms} bath, {p.area_sqft} sqft ({p.get_property_type_display()}, For {p.get_listing_type_display()})"
                )
                img_url = None
                first_img = getattr(p, 'primary_image', None) or (p.images.first() if p.images.exists() else None)
                if first_img:
                    if getattr(first_img, 'external_url', None):
                        img_url = first_img.external_url
                    elif getattr(first_img, 'image', None):
                        try:
                            img_url = first_img.image.url
                        except Exception:
                            img_url = None

                suggested_props.append({
                    'id': p.id,
                    'title': p.title,
                    'city': p.city,
                    'price': str(p.price),
                    'price_formatted': f"{price_str}{suffix}",
                    'bedrooms': p.bedrooms,
                    'bathrooms': p.bathrooms,
                    'area_sqft': p.area_sqft,
                    'listing_type': p.listing_type,
                    'image': img_url
                })
            context_text = "\n".join(listings_info)
        except Exception as e:
            logger.warning(f"Error fetching property context: {e}")
            context_text = "Featured properties across Gulshan, Banani, Dhanmondi, Uttara, Baridhara."
            suggested_props = []

        system_prompt = (
            "You are Zennor AI, the official and intelligent real estate advisor for Zennor "
            "(Bangladesh's premier luxury & residential real estate marketplace, formerly Prestige Realty). "
            "You provide polite, concise, expert guidance on buying, renting, pricing, mortgages, and locations in Bangladesh.\n\n"
            "Key details about Zennor:\n"
            "- Currency: Bangladesh Taka (৳, BDT) using Lakh (100,000) and Crore (10,000,000) notation.\n"
            "- Locations covered: Dhaka (Gulshan, Banani, Dhanmondi, Uttara, Baridhara, Bashundhara R/A, Mirpur), Chittagong/Chattogram, Sylhet, Cox's Bazar, Rajshahi, Khulna.\n"
            "- All listings on Zennor are verified against RAJUK and CDA regulatory papers with zero middlemen cut.\n"
            "- Currently available verified listings in the Zennor database:\n"
            f"{context_text}\n\n"
            "Guidelines:\n"
            "- Answer directly and concisely in a warm, professional, trustworthy tone.\n"
            "- When users ask for property recommendations, cite matching properties from the listed Zennor database above by name and price.\n"
            "- For home loan or mortgage questions, explain the standard terms (down payment typically 20-30%, interest rates 8.5%-10.5% with partner banks like DBH, BRAC, City Bank).\n"
            "- If users ask in Bengali (বাংলা), you can reply warmly in Bengali or English."
        )

        # Prepare messages payload
        api_messages = [{"role": "system", "content": system_prompt}]
        if conversation:
            for msg in conversation[-6:]:  # Keep recent context
                role = msg.get('role', 'user')
                content = msg.get('content', '')
                if role in ['user', 'assistant'] and content:
                    api_messages.append({"role": role, "content": content})
        if user_message:
            api_messages.append({"role": "user", "content": user_message})

        # Fetch API key and model
        hf_api_key = getattr(settings, 'HUGGINGFACE_API_KEY', '') or os.environ.get('HUGGINGFACE_API_KEY', '')
        hf_model = getattr(settings, 'HUGGINGFACE_MODEL', '') or 'meta-llama/Llama-3.1-8B-Instruct'

        bot_reply = None

        # Call Hugging Face Router
        if hf_api_key:
            try:
                payload = {
                    "model": hf_model,
                    "messages": api_messages,
                    "max_tokens": 400,
                    "temperature": 0.7,
                }
                req = urllib.request.Request(
                    HF_ROUTER_URL,
                    headers={
                        "Authorization": f"Bearer {hf_api_key}",
                        "Content-Type": "application/json",
                        "User-Agent": "Zennor-RealEstate/1.0"
                    },
                    data=json.dumps(payload).encode('utf-8')
                )
                with urllib.request.urlopen(req, timeout=12) as response:
                    res_data = json.loads(response.read().decode('utf-8'))
                    bot_reply = res_data.get('choices', [{}])[0].get('message', {}).get('content', '')
            except Exception as e:
                logger.error(f"Hugging Face router call error: {e}")

        # Resilient fallback if Hugging Face is slow or unreachable
        if not bot_reply:
            query = user_message.lower() if user_message else ""
            if "gulshan" in query or "duplex" in query:
                bot_reply = "We have luxury duplexes and apartments in Gulshan 1 & 2 ranging from ৳ 3.5 Crore to ৳ 9.25 Crore. Each listing is verified against RAJUK papers."
            elif "rent" in query:
                bot_reply = "We have verified rental flats across Dhaka starting from ৳ 28,000/month in Uttara up to ৳ 4.2 Lakh/month for commercial floors in Gulshan."
            elif "mortgage" in query or "loan" in query or "emi" in query:
                bot_reply = "Zennor provides an integrated Home Loan & EMI calculator. In Bangladesh, down payments are typically 20-30%, with partner banks (DBH, BRAC Bank, City Bank) offering rates around 9% - 10.5%."
            elif "price" in query or "crore" in query or "lakh" in query:
                bot_reply = "In Bangladesh real estate, 1 Lakh equals 100,000 BDT, and 1 Crore equals 100 Lakhs (10,000,000 BDT). Average rates in Gulshan are ~৳ 26,500/sqft, Banani ~৳ 22,000/sqft, and Uttara ~৳ 11,800/sqft."
            else:
                bot_reply = "Welcome to Zennor! I am your AI Real Estate Advisor. I can help you find verified flats and houses for sale or rent across Dhaka, Chattogram, and Sylhet, calculate mortgages, or schedule an agent tour."

        return Response({
            'success': True,
            'reply': bot_reply,
            'model': hf_model,
            'suggested_properties': suggested_props[:3]
        })
