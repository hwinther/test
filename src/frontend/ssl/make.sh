openssl req -x509 -out localhost.crt -keyout localhost.key -newkey rsa:2048 -nodes -sha256 -subj '/CN=localhost' -extensions EXT -config cnf -days 3650 || openssl req -x509 -out localhost.crt -keyout localhost.key -newkey rsa:2048 -nodes -sha256 -subj '//CN=localhost' -extensions EXT -config cnf -days 3650
# openssl pkcs12 -export -name localhostServerCert -in localhost.crt -inkey localhost.key -out localhost.pfx
