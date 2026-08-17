#!/usr/bin/env bash
# Exit on error
set -o errexit

# Navigate into the backend directory
cd "$(dirname "$0")"

echo "Installing dependencies..."
pip install -r requirements.txt

echo "Collecting static files..."
python manage.py collectstatic --no-input

echo "Running database migrations..."
python manage.py migrate

echo "Creating/Updating superuser..."
python manage.py shell -c "from accounts.models import User; u = User.objects.filter(email='admin@realestate.com').first() or User(email='admin@realestate.com'); u.full_name='Prestige Admin'; u.is_agent=True; u.is_staff=True; u.is_superuser=True; u.is_active=True; u.set_password('Admin1234!'); u.save(); print('Superuser admin@realestate.com ready!')"

echo "Seeding Bangladesh luxury properties..."
python manage.py seed_bangladesh_properties || true
