FROM python:3.9-slim
WORKDIR /app
COPY tools/entryscript.sh /tmp
RUN chmod +x /tmp/entryscript.sh
EXPOSE 8000
ENTRYPOINT ["/tmp/entryscript.sh"]