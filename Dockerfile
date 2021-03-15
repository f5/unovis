###################
# Stage 1 - build #
###################
FROM node:lts as builder

WORKDIR /app
RUN chown node:node /app

# Add SSH key
USER node
RUN mkdir /home/node/.ssh
COPY --chown=node:node deploy.key /home/node/.ssh/id_rsa
RUN chmod 600 ~/.ssh/id_rsa && \
    ssh-keyscan -t rsa gitlab.com >> ~/.ssh/known_hosts

# Install dependencies
COPY --chown=node:node . .
RUN yarn install --network-concurrency 1

# Install dependencies for web
WORKDIR /app/web/
RUN yarn build

# Clean up SSH key
RUN rm -rf ~/.ssh

##################
# Stage 2 - host #
##################
FROM nginxinc/nginx-unprivileged:1.19

USER root

# Clean default static site
RUN rm -rf /usr/share/nginx/html/*

# Copy static files from previous step
COPY --from=builder /app/web/lib/volterra-vis-examples /usr/share/nginx/html/

# RUN NGINX ON A CUSTOM PORT
EXPOSE 9001
RUN sed -i -e '/listen/!b' -e '/8080;/!b' -e 's/8080;/9001;/' /etc/nginx/conf.d/default.conf
USER 101
CMD ["nginx", "-g", "daemon off;"]

