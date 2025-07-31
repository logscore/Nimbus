# @nimbus/shared

## 0.0.4

### Patch Changes

- @nimbus/db@0.0.3

## 0.0.3

### Patch Changes

- 03bb85d: chore: updated everything to latest except zod and Next.js (zod, tying errors, opennextjs-cloudflare only
  supports 15.3) CMD: find . -type f -name "package.json" -not -path "_/node_modules/_" -not -path "*/.*next/\*" -exec
  sh -c 'echo "\nUpdating $1/..." && (cd "$(dirname "$1")" && ncu -u)' \_ {} \; chore: revert zod upgrade as it breaks
  better-auth typing chore: zod broke better-auth typing again... chore: revert back to base sql chore: auth clean
  chore: FINALLY fixed schema.ts chore: reset migrations to current database state. removed the rateLimit table since we
  use cache now
- Updated dependencies [de391ed]
- Updated dependencies [7ffde8d]
- Updated dependencies [03bb85d]
  - @nimbus/db@0.0.2

## 0.0.2

### Patch Changes

- 1c1f4a3: Added legal pages. Added legal constants. Grouped all constants in shared/constants/\*.

## 0.0.1

### Patch Changes

- 7e2271f: init changeset
- Updated dependencies [7e2271f]
  - @nimbus/db@0.0.1
