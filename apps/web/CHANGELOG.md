# @nimbus/web

## 0.0.8

### Patch Changes

- f5ea8ad: fix: type error web build chore: update deps wrangler cloudflare fix: remove onAccountAdded since it doesn't
  work as expected. needed to remove window reload since returning to the page is handled by OAuth callback

## 0.0.7

### Patch Changes

- b9d0d3f: feat: removed middleware.ts and create client side routing.

## 0.0.6

### Patch Changes

- Updated dependencies [45caeab]
  - @nimbus/auth@0.0.4
  - @nimbus/env@0.0.3
  - @nimbus/server@0.0.5
  - @nimbus/shared@0.0.4

## 0.0.5

### Patch Changes

- Updated dependencies [2efcc5a]
  - @nimbus/auth@0.0.3
  - @nimbus/server@0.0.4

## 0.0.4

### Patch Changes

- 1ee7ea3: Claude attempted to fix more race conditions in web
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
- Updated dependencies [7ffde8d]
- Updated dependencies [03bb85d]
- Updated dependencies [c047c01]
  - @nimbus/auth@0.0.2
  - @nimbus/shared@0.0.3
  - @nimbus/env@0.0.2
  - @nimbus/server@0.0.3

## 0.0.3

### Patch Changes

- 83b4c87: fixed legal pages and footer. mostly CSS.

## 0.0.2

### Patch Changes

- 1c1f4a3: Added legal pages. Added legal constants. Grouped all constants in shared/constants/\*.
- Updated dependencies [1c1f4a3]
  - @nimbus/shared@0.0.2
  - @nimbus/server@0.0.2

## 0.0.1

### Patch Changes

- 7e2271f: init changeset
- Updated dependencies [7e2271f]
  - @nimbus/shared@0.0.1
  - @nimbus/auth@0.0.1
  - @nimbus/env@0.0.1
  - @nimbus/server@0.0.1
