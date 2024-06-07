#!/bin/sh
# cd /app
pip install -r requirements.txt
python manage.py makemigrations players
python manage.py makemigrations && python manage.py migrate
python manage.py collectstatic --noinput
gunicorn -b :8000 usermanager.wsgi