FROM ubuntu:noble
RUN apt update && apt upgrade -y
RUN apt install -y python3 python3-pip python3-venv
COPY entrypoint.sh /
RUN chmod a+x /entrypoint.sh
ENTRYPOINT [ "/entrypoint.sh" ]