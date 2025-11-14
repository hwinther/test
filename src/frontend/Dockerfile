FROM node:25-alpine AS npm
WORKDIR /app
COPY package.json package-lock.json /app/
RUN npm ci

FROM npm AS build
COPY . /app/
COPY --from=npm /app/node_modules /app/node_modules
RUN npm run build

FROM nginx:alpine-otel AS final
RUN apk update && apk upgrade
COPY --from=build /app/dist/client /usr/share/nginx/html/
COPY ssl/localhost.crt /etc/ssl/certs/localhost.crt
COPY ssl/localhost.key /etc/ssl/private/localhost.key
COPY nginx/default.conf /etc/nginx/conf.d/default.conf
EXPOSE 8080 8443
CMD ["nginx", "-g", "daemon off;"]