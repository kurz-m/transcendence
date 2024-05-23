#!/bin/bash

set -eux

rm -f /healthy

source .venv/bin/activate

CERT_FILE="/etc/letsencrypt/live/transcendence.myprojekt.tech/fullchain.pem"

while true
do
if [ -f "$CERT_FILE" ]; then
    # stop running validation container
    # check modify date and renew if older than 24h
    modsecs=$(date --utc --reference="$CERT_FILE" +%s)
    nowsecs=$(date +%s)
    delta=$(($nowsecs-$modsecs))
    if [ $delta -lt 86400 ]; then
        certbot renew
    fi
    docker stop nginx-validation || true
    docker rm nginx-validation || true
    touch /healthy
else
    # create certificates with certbot
    until certbot certonly \
        --webroot \
        --webroot-path /var/www/certbot/ \
        --non-interactive \
        --agree-tos \
        -m flauer@student.42heilbronn.de \
        -d transcendence.myprojekt.tech \
        --cert-name transcendence.myprojekt.tech
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
