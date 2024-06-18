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
COPY --from=build /app/dist /usr/share/nginx/html/
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]