FROM node:lts-alpine

ENV COREPACK_ENABLE_AUTO_PIN=1
ENV PORT=8000
ENV NODE_ENV=development
ENV CI=true

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

COPY package.json* pnpm-lock.yaml* pnpm-workspace.yaml* ./

RUN pnpm install --frozen-lockfile


COPY . .

EXPOSE $PORT 

CMD ["pnpm","dev"]
