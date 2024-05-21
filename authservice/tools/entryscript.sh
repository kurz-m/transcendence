#!/bin/sh

python manage.py makemigrations && python manage.py migrate
gunicorn -b :8000 usermanager.wsgi