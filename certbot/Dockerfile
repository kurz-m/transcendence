FROM ubuntu:noble
RUN apt update && apt upgrade -y
RUN apt install -y python3 python3-pip python3-venv
RUN apt-get update &&\
    apt-get install -y ca-certificates curl &&\
    install -m 0755 -d /etc/apt/keyrings &&\
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc &&\
    chmod a+r /etc/apt/keyrings/docker.asc
RUN echo \
    "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu \
    $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
    tee /etc/apt/sources.list.d/docker.list > /dev/null
RUN apt update && apt install -y docker-ce
RUN python3 -m venv .venv
RUN .venv/bin/pip install certbot certbot-nginx
COPY entrypoint.sh /
RUN chmod a+x /entrypoint.sh
ENTRYPOINT [ "/entrypoint.sh" ]