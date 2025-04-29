FROM node:18-slim

# Install TeX Live with essential packages
RUN apt-get update && apt-get install -y \
    texlive-latex-base \
    texlive-fonts-recommended \
    texlive-latex-extra \
    texlive-science \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY server/package*.json ./
RUN npm install

COPY server/ ./

EXPOSE 5000

CMD ["npm", "start"]