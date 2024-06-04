FROM alpine:3.19.0
RUN apk update && apk add prometheus
COPY ./conf/prometheus.yml /etc/prometheus/prometheus.yml
EXPOSE 9090
CMD ["prometheus", "--config.file=/etc/prometheus/prometheus.yml"]