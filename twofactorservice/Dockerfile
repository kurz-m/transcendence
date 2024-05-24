FROM python:3.9-slim
WORKDIR /app
COPY twofactorauth /app
COPY tools/entryscript.sh /app
RUN chmod +x entryscript.sh
RUN pip install -r requirements.txt
EXPOSE 8000
CMD ["./entryscript.sh"]