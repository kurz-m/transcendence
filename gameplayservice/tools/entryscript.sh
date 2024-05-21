#!/bin/sh

python manage.py makemigrations && python manage.py migrate
gunicorn -b :8001 gameplay.wsgi