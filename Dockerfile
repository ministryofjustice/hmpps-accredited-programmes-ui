# Stage: base image
FROM ghcr.io/ministryofjustice/hmpps-node:24-alpine AS base

ARG BUILD_NUMBER=1_0_0
ARG GIT_REF=not-available

LABEL maintainer="HMPPS Digital Studio <info@digital.justice.gov.uk>"

RUN apk update && \
    apk upgrade && \
    rm -rf /var/cache/apk/*

ENV TZ=Europe/London
RUN ln -snf "/usr/share/zoneinfo/$TZ" /etc/localtime && echo "$TZ" > /etc/timezone

RUN if ! getent group appgroup; then addgroup --gid 2000 --system appgroup; fi && \
    if ! id -u appuser 2>/dev/null; then adduser --uid 2000 --system appuser --ingroup appgroup; fi

WORKDIR /app

# Cache breaking
ENV BUILD_NUMBER=${BUILD_NUMBER:-1_0_0}

# Stage: build assets
FROM base AS build

ARG BUILD_NUMBER=1_0_0
ARG GIT_REF=not-available

RUN apk update && \
    apk add --no-cache make python3 g++

COPY package*.json ./
RUN CYPRESS_INSTALL_BINARY=0 npm ci --no-audit

COPY . .
RUN npm run build

RUN export BUILD_NUMBER=${BUILD_NUMBER} && \
    export GIT_REF=${GIT_REF} && \
    npm run record-build-info

RUN npm prune --no-audit --production

# Stage: copy production assets and dependencies
FROM base

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

CMD [ "npm", "start" ]
