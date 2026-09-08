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

echo "Creating/Updating superuser when admin credentials are configured..."
python manage.py shell -c "import os; from accounts.models import User; email=os.environ.get('ADMIN_SETUP_EMAIL', 'admin@zennor.com'); password=os.environ.get('ADMIN_SETUP_PASSWORD'); u=User.objects.filter(email=email).first(); u=u or User(email=email); u.full_name='Zennor Admin'; u.is_agent=True; u.is_staff=True; u.is_superuser=True; u.is_active=True; u.set_password(password); u.save() if password else None; print(f'Superuser {email} ready!' if password else 'Skipped superuser bootstrap: ADMIN_SETUP_PASSWORD is not configured.')"

echo "Seeding Bangladesh luxury properties..."
python manage.py seed_bangladesh_properties
