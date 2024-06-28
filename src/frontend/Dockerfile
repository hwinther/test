FROM node:20-alpine AS yarn
WORKDIR /app
COPY package.json yarn.lock /app/
RUN yarn install --frozen-lockfile

FROM yarn AS build
COPY . /app/
COPY --from=yarn /app/node_modules /app/node_modules
RUN yarn build

FROM nginx:alpine-otel AS final
RUN apk update && apk upgrade
COPY --from=build /app/dist/client /usr/share/nginx/html/
COPY ssl/localhost.crt /etc/ssl/certs/localhost.crt
COPY ssl/localhost.key /etc/ssl/private/localhost.key
COPY nginx/default.conf /etc/nginx/conf.d/default.conf
EXPOSE 8080 8443
CMD ["nginx", "-g", "daemon off;"]