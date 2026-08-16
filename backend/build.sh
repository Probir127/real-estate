#!/usr/bin/env bash
# Exit on error
set -o errexit

echo "Installing dependencies..."
pip install -r requirements.txt

echo "Collecting static files..."
python manage.py collectstatic --no-input

echo "Running database migrations..."
python manage.py migrate

echo "Creating superuser if not exists..."
python manage.py shell -c "from accounts.models import User; u, _ = User.objects.get_or_create(email='admin@realestate.com', defaults={'full_name': 'Admin User', 'is_agent': True, 'is_staff': True, 'is_superuser': True}); u.set_password('Admin1234!'); u.is_staff=True; u.is_superuser=True; u.save(); print('Superuser admin@realestate.com ready!')"

echo "Seeding initial properties..."
python manage.py seed_data || true
