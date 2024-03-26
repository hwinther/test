FROM im2nguyen/rover:v0.3.3

# From https://github.com/Azure/azure-cli/issues/19591
RUN apk add py3-pip
RUN apk add gcc musl-dev python3-dev libffi-dev openssl-dev cargo make
RUN pip install --upgrade pip
RUN pip install azure-cli

ENTRYPOINT ["/bin/rover"]
