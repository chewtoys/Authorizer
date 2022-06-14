FROM node:18 as build-deps
WORKDIR /build
COPY package.json yarn.lock ./
RUN yarn
COPY . ./
RUN yarn build

FROM node:18-alpine3.14 as base
ENV NODE_ENV=production
WORKDIR /app
COPY --from=build-deps /build/node_modules ./node_modules
COPY --from=build-deps /build/package.json ./package.json
COPY --from=build-deps /build/views ./dist/views
COPY --from=build-deps /build/public ./dist/public
COPY --from=build-deps /build/dist ./dist


EXPOSE 3000
ENTRYPOINT [ "npm", "run", "start" ]