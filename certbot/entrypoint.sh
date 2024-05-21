#!/bin/bash

set -eux

rm -f /healthy

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
    until certbot certonly \
        --webroot \
        --webroot-path /var/www/certbot/ \
        --non-interactive \
        --agree-tos \
        -m flauer@student.42heilbronn.de \
        -d transcendence.myprojekt.tech \
        --cert-name transcendence.myprojekt.tech \
        --test-cert
    do
        sleep 2
    done
    docker stop nginx-validation
    docker rm nginx-validation
    touch /healthy
fi
# sleep for 10 minutes
sleep 36000
done
