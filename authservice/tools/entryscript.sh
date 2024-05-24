#!/bin/sh

python manage.py makemigrations && python manage.py migrate
python manage.py collectstatic --noinput
gunicorn -b :8000 usermanager.wsgi