# Stage: build assets
FROM ghcr.io/ministryofjustice/hmpps-node:24-alpine AS build

ARG BUILD_NUMBER=1_0_0
ARG GIT_REF=not-available

WORKDIR /app

RUN apk update && \
    apk add --no-cache make python3 g++

# .npmrc and .allowed-scripts.mjs ensure only allowlisted dependency install scripts are run
COPY package*.json .npmrc .allowed-scripts.mjs ./
RUN CYPRESS_INSTALL_BINARY=0 npm run setup --no-audit

COPY . .
RUN npm run build

RUN export BUILD_NUMBER=${BUILD_NUMBER} && \
    export GIT_REF=${GIT_REF} && \
    npm run record-build-info

RUN npm prune --no-audit --omit=dev

# Stage: copy production assets and dependencies onto a runtime image without npm
FROM ghcr.io/ministryofjustice/hmpps-node:24-alpine-runtime

ARG BUILD_NUMBER=1_0_0

LABEL maintainer="HMPPS Digital Studio <info@digital.justice.gov.uk>"

WORKDIR /app

# Cache breaking
ENV BUILD_NUMBER=${BUILD_NUMBER:-1_0_0}

COPY --from=build --chown=appuser:appgroup \
        /app/package.json \
        /app/package-lock.json \
        ./

COPY --from=build --chown=appuser:appgroup \
        /app/build-info.json ./dist/build-info.json

COPY --from=build --chown=appuser:appgroup \
        /app/assets ./assets

COPY --from=build --chown=appuser:appgroup \
        /app/dist ./dist

COPY --from=build --chown=appuser:appgroup \
        /app/node_modules ./node_modules

EXPOSE 3000 3001
ENV NODE_ENV='production'
USER 2000

# Run node directly so that it receives SIGTERM and can shut down gracefully
CMD [ "node", "dist/server.js" ]
