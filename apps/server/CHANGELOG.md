# @nimbus/server

## 0.0.6

### Patch Changes

- 030752f: fix: 5.8.3 is preferred Typescript version rn fix: added error handling to filesWithTags. improved query
  consitency

## 0.0.5

### Patch Changes

- 45caeab: chore: add WRANGLER_DEV to .env.example chore: configure t3 env to switch NODE_ENV to production when
  WRANGLER_DEV is "true" chore: update auth.ts to throw on error chore: update server.ts to load env from hono context
  chore: update server.ts to include Cloudflare namespace types: Env, ExecutionContext
- Updated dependencies [45caeab]
  - @nimbus/auth@0.0.4
  - @nimbus/env@0.0.3
  - @nimbus/cache@0.0.3
  - @nimbus/db@0.0.3
  - @nimbus/shared@0.0.4

## 0.0.4

### Patch Changes

- 2efcc5a: chore: added better-auth on error handling for production (console.error(error, AuthContext) chore: added
  upstash vs valkey getter handling (upstash does not resturn string) chore: added wrangler dev, bun dev, and production
  runtime handling for server chore: context must be re-created (not a singleton) for edge runtime)
- Updated dependencies [2efcc5a]
  - @nimbus/auth@0.0.3

## 0.0.3

### Patch Changes

- 03bb85d: chore: updated everything to latest except zod and Next.js (zod, tying errors, opennextjs-cloudflare only
  supports 15.3) CMD: find . -type f -name "package.json" -not -path "_/node_modules/_" -not -path "*/.*next/\*" -exec
  sh -c 'echo "\nUpdating $1/..." && (cd "$(dirname "$1")" && ncu -u)' \_ {} \; chore: revert zod upgrade as it breaks
  better-auth typing chore: zod broke better-auth typing again... chore: revert back to base sql chore: auth clean
  chore: FINALLY fixed schema.ts chore: reset migrations to current database state. removed the rateLimit table since we
  use cache now
- c047c01: - Added a new handleUnauthorizedError utility function in client.ts for consistent error handling
  - Added an auth context system to manage sign-in state (easy to prompt for login when unauthorized)
  - Updated all frontend drive proctected routes (drives, files, tags)
  - Improved type inferring for tags in server by removing try catch blocks
  - Renamed default error to sendForbidden and reserved sendUnauthorized for out-of-date token
  - Fixed race condition in account-provider by removing unecessary setters and by adding a useRef
- Updated dependencies [de391ed]
- Updated dependencies [7ffde8d]
- Updated dependencies [03bb85d]
  - @nimbus/db@0.0.2
  - @nimbus/auth@0.0.2
  - @nimbus/shared@0.0.3
  - @nimbus/env@0.0.2
  - @nimbus/cache@0.0.2

## 0.0.2

### Patch Changes

- Updated dependencies [1c1f4a3]
  - @nimbus/shared@0.0.2

## 0.0.1

### Patch Changes

- 7e2271f: init changeset
- Updated dependencies [7e2271f]
  - @nimbus/shared@0.0.1
  - @nimbus/cache@0.0.1
  - @nimbus/auth@0.0.1
  - @nimbus/env@0.0.1
  - @nimbus/db@0.0.1
