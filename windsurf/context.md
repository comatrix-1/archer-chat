# archer-chat-react-router Project Context

## Folder Structure

apps/
- remix/: Frontend (React Router v7), with app/, server/
    - app/: components/, contexts/, hooks/, lib/, routes/
    - server/: api/, config/, middleware/, trpc/, utils/

packages/
- prisma/: Prisma client, schema, utils
- tRPC/: tRPC server, client
- shared/: Shared utils, constants, types

Root files:
- package.json, tsconfig.json, turbo.json, .env, README.md

## Notes
1. Frontend imports: apps/remix/app may import types or utils from packages/shared.
2. Backend reuse: packages/prisma must be the single source for Prisma client access.
3. No duplication: Avoid duplicating helpers, constants, or types.
4. tRPC integration:
packages/trpc/server provides backend routers; used by API services.
packages/trpc/client provides client-side hooks for the frontend.