# @nimbus/server

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
