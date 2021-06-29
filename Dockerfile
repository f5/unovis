###################
# Stage 1 - build #
###################
FROM node:14-stretch as builder

WORKDIR /app
RUN chown node:node /app

RUN npm install -g npm@7

# Add SSH key
USER node
RUN mkdir /home/node/.ssh
COPY --chown=node:node deploy.key /home/node/.ssh/id_rsa
RUN chmod 600 ~/.ssh/id_rsa && \
    ssh-keyscan -t rsa gitlab.com >> ~/.ssh/known_hosts

# Install dependencies
COPY --chown=node:node . .
ARG GITLAB_NPM_REGISTRY_AUTH_TOKEN
RUN npm config set "//gitlab.com/api/v4/packages/npm/:_authToken" "${GITLAB_NPM_REGISTRY_AUTH_TOKEN}"
RUN bash -c 'set -o pipefail && npm install --unsafe-perm 2>&1 | tee'

# Npm build
RUN npm run build

# Clean up SSH key
RUN rm -rf ~/.ssh

##################
# Stage 2 - host #
##################
FROM nginxinc/nginx-unprivileged:1.19

USER root

# fix: CVE-2021-24031	libzstd1-1.3.8+dfsg-3
# next line can be removed after base image update to nginx-unprivileged:1.20
RUN apt-get update; apt-get install --only-upgrade libzstd1=1.3.8+dfsg-3+deb10u2

# Clean default static site
RUN rm -rf /usr/share/nginx/html/*

# Copy static files from previous step
COPY --from=builder /app/web/lib/volterra-vis-examples /usr/share/nginx/html/

# RUN NGINX ON A CUSTOM PORT
EXPOSE 9001
RUN sed -i -e '/listen/!b' -e '/8080;/!b' -e 's/8080;/9001;/' /etc/nginx/conf.d/default.conf
USER 101
CMD ["nginx", "-g", "daemon off;"]

