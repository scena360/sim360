FROM mcr.microsoft.com/playwright:focal as base

ENV PLAYWRIGHT_BROWSERS_PATH=/ms-playwright

FROM base as configuration
WORKDIR /app
COPY package.json yarn.lock ./

FROM configuration AS dependencies
RUN yarn install

FROM dependencies AS transpiled
COPY src ./src
COPY tsconfig.json ./
RUN yarn build

FROM dependencies AS release

# COPY over build output from transpiled source code
COPY --from=transpiled /app/build ./

COPY --chmod="+x" entrypoint.sh /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]

CMD ["node","index.js"]


