FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat openssl
WORKDIR /repo

FROM base AS deps
COPY package.json package-lock.json turbo.json tsconfig.json ./
COPY apps/web/package.json ./apps/web/
COPY packages ./packages
RUN npm ci

FROM base AS build
COPY --from=deps /repo/node_modules ./node_modules
COPY . .
WORKDIR /repo/apps/web
RUN npx prisma generate
RUN npm run build

FROM base AS runner
ENV NODE_ENV=production
WORKDIR /repo
COPY --from=build /repo/node_modules ./node_modules
COPY --from=build /repo/packages ./packages
COPY --from=build /repo/apps/web/.next ./apps/web/.next
COPY --from=build /repo/apps/web/public ./apps/web/public
COPY --from=build /repo/apps/web/package.json ./apps/web/package.json
COPY --from=build /repo/apps/web/prisma ./apps/web/prisma
COPY --from=build /repo/apps/web/next.config.* ./apps/web/

WORKDIR /repo/apps/web
EXPOSE 3000
CMD ["sh", "-c", "npx prisma migrate deploy && npm start"]
