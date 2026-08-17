"""
Management command to seed the database with Bangladesh real estate listings.
Run: python manage.py seed_bangladesh_properties
"""
import os
import django
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from properties.models import Property, PropertyImage

User = get_user_model()

PROPERTIES = [
    {
        "title": "Luxury Penthouse with City View",
        "description": "An exceptional penthouse located in the heart of Gulshan, Dhaka. This stunning 4-bedroom residence offers panoramic city views, a private rooftop terrace, premium Italian marble flooring, fully fitted modular kitchen, and 24/7 security. Walking distance to Gulshan-2 circle, top restaurants, and embassies.",
        "price": 35000000,
        "property_type": "apartment",
        "listing_type": "sale",
        "status": "active",
        "address": "Road 103, Gulshan-2",
        "city": "Dhaka",
        "state": "Dhaka Division",
        "zip_code": "1212",
        "bedrooms": 4,
        "bathrooms": 4,
        "area_sqft": 3200,
        "garage": 2,
        "year_built": 2022,
        "features": "Rooftop Terrace, City View, Italian Marble, Modular Kitchen, 24/7 Security, Backup Generator, Central AC",
        "is_featured": True,
        "is_published": True,
        "images": [
            "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&auto=format&fit=crop&q=80",
            "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&auto=format&fit=crop&q=80"
        ]
    },
    {
        "title": "Modern 3BR Apartment in Dhanmondi",
        "description": "Beautifully designed 3-bedroom apartment in Dhanmondi R/A, one of Dhaka's most sought-after residential areas. Features open-plan living, modern bathrooms, fully equipped kitchen, and private balcony. Close to schools, hospitals, and Rabindra Sarobar.",
        "price": 12500000,
        "property_type": "apartment",
        "listing_type": "sale",
        "status": "active",
        "address": "House 15, Road 27, Dhanmondi",
        "city": "Dhaka",
        "state": "Dhaka Division",
        "zip_code": "1209",
        "bedrooms": 3,
        "bathrooms": 3,
        "area_sqft": 1850,
        "garage": 1,
        "year_built": 2020,
        "features": "Balcony, Modular Kitchen, Lift, Parking, Security Guard, CCTV",
        "is_featured": True,
        "is_published": True,
        "images": [
            "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&auto=format&fit=crop&q=80",
            "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200&auto=format&fit=crop&q=80"
        ]
    },
    {
        "title": "Executive Villa in Baridhara Diplomatic Zone",
        "description": "An ultra-premium 5-bedroom detached villa in the exclusive Baridhara Diplomatic Zone. This architectural masterpiece features a private swimming pool, landscaped garden, home theater, gym room, and staff quarters. Perfect for senior executives and diplomats.",
        "price": 85000000,
        "property_type": "villa",
        "listing_type": "sale",
        "status": "active",
        "address": "Block J, Baridhara Diplomatic Zone",
        "city": "Dhaka",
        "state": "Dhaka Division",
        "zip_code": "1212",
        "bedrooms": 5,
        "bathrooms": 6,
        "area_sqft": 6500,
        "garage": 3,
        "year_built": 2021,
        "features": "Private Pool, Landscaped Garden, Home Theater, Gym, Staff Quarters, Smart Home System, Solar Power",
        "is_featured": True,
        "is_published": True,
        "images": [
            "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1200&auto=format&fit=crop&q=80",
            "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=1200&auto=format&fit=crop&q=80"
        ]
    },
    {
        "title": "Fully Furnished Studio in Bashundhara R/A",
        "description": "Brand new fully furnished studio apartment in Bashundhara Residential Area. Ideal for young professionals and couples. Includes all modern appliances, high-speed internet, and access to a rooftop common area. Very close to North South University.",
        "price": 25000,
        "property_type": "apartment",
        "listing_type": "rent",
        "status": "active",
        "address": "Block B, Road 4, Bashundhara R/A",
        "city": "Dhaka",
        "state": "Dhaka Division",
        "zip_code": "1229",
        "bedrooms": 1,
        "bathrooms": 1,
        "area_sqft": 650,
        "garage": 0,
        "year_built": 2023,
        "features": "Fully Furnished, High-Speed Internet, Rooftop Access, CCTV, 24/7 Security",
        "is_featured": False,
        "is_published": True,
        "images": [
            "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200&auto=format&fit=crop&q=80"
        ]
    },
    {
        "title": "Spacious Family Home in Uttara",
        "description": "A well-maintained 4-bedroom house in Sector 6, Uttara — Dhaka's planned residential township. Features a ground floor drawing room, dining room, separate servant quarters, and a rooftop garden. Very close to Uttara Model Town and BRT corridor.",
        "price": 18000000,
        "property_type": "house",
        "listing_type": "sale",
        "status": "active",
        "address": "House 12, Road 8, Sector 6, Uttara",
        "city": "Dhaka",
        "state": "Dhaka Division",
        "zip_code": "1230",
        "bedrooms": 4,
        "bathrooms": 3,
        "area_sqft": 2800,
        "garage": 2,
        "year_built": 2018,
        "features": "Rooftop Garden, Servant Quarters, Drawing Room, Lift, Generator, Gated Community",
        "is_featured": True,
        "is_published": True,
        "images": [
            "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1200&auto=format&fit=crop&q=80"
        ]
    },
    {
        "title": "Beachfront Apartment in Cox's Bazar",
        "description": "A rare opportunity to own a premium beachfront apartment in the world's longest natural sea beach — Cox's Bazar. Breathtaking ocean views from every room, direct beach access, resort-style amenities including a rooftop pool and restaurant. Perfect as a holiday home or investment property.",
        "price": 22000000,
        "property_type": "apartment",
        "listing_type": "sale",
        "status": "active",
        "address": "Marine Drive Road, Kolatoli",
        "city": "Cox's Bazar",
        "state": "Chittagong Division",
        "zip_code": "4700",
        "bedrooms": 3,
        "bathrooms": 3,
        "area_sqft": 2100,
        "garage": 1,
        "year_built": 2022,
        "features": "Ocean View, Rooftop Pool, Beach Access, Restaurant, Gym, Spa, Valet Parking",
        "is_featured": True,
        "is_published": True,
        "images": [
            "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=1200&auto=format&fit=crop&q=80"
        ]
    },
    {
        "title": "Commercial Office Space in Motijheel",
        "description": "Prime grade-A commercial office space in Motijheel, Dhaka's central business district. Full floor available in a modern high-rise building. Features open plan layout, false ceiling, raised flooring for cabling, central air conditioning, and 24/7 access.",
        "price": 150000,
        "property_type": "commercial",
        "listing_type": "rent",
        "status": "active",
        "address": "Dilkusha Commercial Area, Motijheel",
        "city": "Dhaka",
        "state": "Dhaka Division",
        "zip_code": "1000",
        "bedrooms": 0,
        "bathrooms": 4,
        "area_sqft": 5000,
        "garage": 5,
        "year_built": 2019,
        "features": "Central AC, Raised Flooring, False Ceiling, High-Speed Internet, 24/7 Access, Backup Power",
        "is_featured": False,
        "is_published": True,
        "images": [
            "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&auto=format&fit=crop&q=80"
        ]
    },
    {
        "title": "Garden Villa in Sylhet Upashahar",
        "description": "An elegant 4-bedroom detached villa in the prestigious Upashahar residential area of Sylhet. Set in lush greenery with a large private garden, this property combines modern architecture with traditional Bengali charm. Close to Hazrat Shah Jalal International Airport.",
        "price": 28000000,
        "property_type": "villa",
        "listing_type": "sale",
        "status": "active",
        "address": "Upashahar Housing Estate",
        "city": "Sylhet",
        "state": "Sylhet Division",
        "zip_code": "3100",
        "bedrooms": 4,
        "bathrooms": 4,
        "area_sqft": 3800,
        "garage": 2,
        "year_built": 2020,
        "features": "Private Garden, Large Terrace, Solar Power, Water Purification, Servant Quarters, Double Garage",
        "is_featured": True,
        "is_published": True,
        "images": [
            "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=1200&auto=format&fit=crop&q=80"
        ]
    },
    {
        "title": "2BR Apartment for Rent in Banani",
        "description": "Fully furnished 2-bedroom apartment in Banani, one of Dhaka's most vibrant neighborhoods. Features premium fittings, hardwood flooring, brand new kitchen appliances, and a balcony overlooking a tree-lined road. Minutes from Banani Lake and top restaurants.",
        "price": 55000,
        "property_type": "apartment",
        "listing_type": "rent",
        "status": "active",
        "address": "Road 11, Block D, Banani",
        "city": "Dhaka",
        "state": "Dhaka Division",
        "zip_code": "1213",
        "bedrooms": 2,
        "bathrooms": 2,
        "area_sqft": 1350,
        "garage": 1,
        "year_built": 2021,
        "features": "Fully Furnished, Hardwood Floors, New Appliances, Balcony, CCTV, 24/7 Security, Generator",
        "is_featured": False,
        "is_published": True,
        "images": [
            "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200&auto=format&fit=crop&q=80"
        ]
    },
    {
        "title": "Luxury Flat in Chittagong GEC Circle",
        "description": "Premium 3-bedroom apartment in the heart of Chittagong, near GEC Circle. High-rise building with stunning views of the Karnaphuli river and Chittagong hills. Features Italian tile flooring, fully fitted kitchen, and all modern amenities.",
        "price": 14500000,
        "property_type": "apartment",
        "listing_type": "sale",
        "status": "active",
        "address": "GEC Circle, Khulshi",
        "city": "Chittagong",
        "state": "Chittagong Division",
        "zip_code": "4225",
        "bedrooms": 3,
        "bathrooms": 3,
        "area_sqft": 2000,
        "garage": 1,
        "year_built": 2021,
        "features": "River View, Italian Tiles, Modular Kitchen, Lift, Parking, Security",
        "is_featured": False,
        "is_published": True,
        "images": [
            "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200&auto=format&fit=crop&q=80"
        ]
    },
    {
        "title": "Agricultural Land in Rajshahi (5 Bigha)",
        "description": "5 Bigha (3.3 acres) of fertile agricultural land in Rajshahi, the mango capital of Bangladesh. Ideal for mango orchard, cultivation, or future residential development. Legal title deed available. Close to Rajshahi-Dhaka highway.",
        "price": 8000000,
        "property_type": "land",
        "listing_type": "sale",
        "status": "active",
        "address": "Godagari Upazila",
        "city": "Rajshahi",
        "state": "Rajshahi Division",
        "zip_code": "6200",
        "bedrooms": 0,
        "bathrooms": 0,
        "area_sqft": 145200,
        "garage": 0,
        "year_built": 0,
        "features": "Fertile Soil, Highway Access, Clear Title, Irrigation Facility",
        "is_featured": False,
        "is_published": True,
        "images": [
            "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200&auto=format&fit=crop&q=80"
        ]
    },
    {
        "title": "Studio Flat in Khulna Boyra",
        "description": "Affordable studio apartment in Boyra, Khulna. Suitable for working professionals. Close to Khulna University, hospital, and major transportation hubs.",
        "price": 15000,
        "property_type": "apartment",
        "listing_type": "rent",
        "status": "active",
        "address": "Boyra Residential Area",
        "city": "Khulna",
        "state": "Khulna Division",
        "zip_code": "9000",
        "bedrooms": 1,
        "bathrooms": 1,
        "area_sqft": 500,
        "garage": 0,
        "year_built": 2019,
        "features": "Close to University, Natural Light, Tiled Floors, Security",
        "is_featured": False,
        "is_published": True,
        "images": [
            "https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=1200&auto=format&fit=crop&q=80"
        ]
    },
]


class Command(BaseCommand):
    help = 'Seed database with Bangladesh real estate sample properties and images'

    def handle(self, *args, **options):
        # Get or create an agent user to own the properties
        agent, created = User.objects.get_or_create(
            email='agent@prestigerealty.bd',
            defaults={
                'full_name': 'Prestige Realty Agent',
                'is_agent': True,
                'is_active': True,
            }
        )
        if created:
            agent.set_password('Agent@123')
            agent.save()
            self.stdout.write(self.style.SUCCESS(f'Created agent user: {agent.email}'))

        for prop_data in PROPERTIES:
            images_list = prop_data.pop('images', [])
            
            prop, was_created = Property.objects.get_or_create(
                title=prop_data['title'],
                city=prop_data['city'],
                defaults={'agent': agent, **prop_data}
            )

            # Ensure property has images
            if not prop.images.exists() and images_list:
                for idx, img_url in enumerate(images_list):
                    PropertyImage.objects.create(
                        property=prop,
                        external_url=img_url,
                        alt_text=f"{prop.title} view {idx + 1}",
                        is_primary=(idx == 0)
                    )
                self.stdout.write(f'  [Images Added] {prop.title[:45]}')
            elif was_created:
                self.stdout.write(f'  [Created] {prop.title[:45]}')

        self.stdout.write(self.style.SUCCESS('\nAll Bangladesh properties and images seeded successfully!'))
