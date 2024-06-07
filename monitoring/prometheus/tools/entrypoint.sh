#!/bin/sh

HASHED_PASSWORD=$(python3 -c "import bcrypt; print(bcrypt.hashpw('$PROMETHEUS_PASSWORD'.encode(), bcrypt.gensalt()).decode())")

web_yml_content=$(cat <<EOF
basic_auth_users:
    admin: '$HASHED_PASSWORD'
EOF
)

echo "$web_yml_content" > /etc/prometheus/web.yml

DATASOURCE_CONFIG=/etc/prometheus/data/datasource.yml

prometheus --config.file=/etc/prometheus/prometheus.yml --web.config.file=/etc/prometheus/web.yml