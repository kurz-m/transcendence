#!/bin/sh

HASHED_PASSWORD=$(python3 -c "import bcrypt; print(bcrypt.hashpw('$PROMETHEUS_PASSWORD'.encode(), bcrypt.gensalt()).decode())")

web_yml_content=$(cat <<EOF
basic_auth_users:
    admin: '$HASHED_PASSWORD'
EOF
)

echo "$web_yml_content" > /etc/prometheus/web.yml

DATASOURCE_CONFIG=/etc/prometheus/data/datasource.yml

rm /prometheus/alertmanager.yml

generate_alertmanager_config=$(cat <<EOF
route:
  group_by: ['alertname']
  receiver: 'email-notifications'

receivers:
  - name: 'email-notifications'
    email_configs:
      - to: '${ALERT_RECEIVER_EMAIL}'
        from: 'alerts@myprojekt.tech'
        smarthost: '${MAILJET_HOST}'
        auth_username: '${MAILJET_API_KEY}'
        auth_password: '${MAILJET_SECRET}'
        auth_identity: ''
EOF
)
echo "$generate_alertmanager_config" > /prometheus/alertmanager.yml

prometheus --config.file=/etc/prometheus/prometheus.yml --web.config.file=/etc/prometheus/web.yml