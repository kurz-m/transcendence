#!/bin/bash

set -eux

python3 -m venv .venv
source .venv/bin/activate
pip install certbot certbot-nginx

CERT_FILE="/etc/letsencrypt/live/transcendence.myprojekt.tech/fullchain.pem"

while true
do
if [ -f "$CERT_FILE" ]; then
    # check modify date and renew if older than 24h
    modsecs=$(date --utc --reference="$CERT_FILE" +%s)
    nowsecs=$(date +%s)
    delta=$(($nowsecs-$modsecs))
    if [ $delta -lt 86400 ]; then
        certbot renew
    fi
else
    # create certificates with certbot
    certbot certonly --webroot --webroot-path /var/www/certbot/ -d transcendence.myprojekt.tech
fi
sleep 3600
done
