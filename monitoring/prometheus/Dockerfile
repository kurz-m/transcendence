FROM alpine:3.19.0
RUN apk update && apk add prometheus python3 py3-bcrypt
COPY ./conf/prometheus.yml /etc/prometheus/prometheus.yml
COPY ./conf/alert.yml /etc/prometheus/alert.yml
COPY ./tools/entrypoint.sh /tmp/entrypoint.sh
RUN chmod +x /tmp/entrypoint.sh
EXPOSE 9090
CMD ["/tmp/entrypoint.sh"]