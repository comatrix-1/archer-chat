graph TD
  %% Apps
  A[apps/remix/web] -->|calls tRPC| B[apps/remix/server/trpc]
  A -->|optional REST| C[apps/remix/server/api]

  %% Server
  B -->|calls procedures| D[packages/trpc/server]


  %% Packages
  D -->|queries| E[packages/db/prismaClient.ts]
  D -->|imports shared utils/types| F[packages/shared]

  %% Prisma
E -->|connects to| G["Database (Postgres)"]
