# @nimbus/env

## 0.0.3

### Patch Changes

- 45caeab: chore: add WRANGLER_DEV to .env.example chore: configure t3 env to switch NODE_ENV to production when
  WRANGLER_DEV is "true" chore: update auth.ts to throw on error chore: update server.ts to load env from hono context
  chore: update server.ts to include Cloudflare namespace types: Env, ExecutionContext

## 0.0.2

### Patch Changes

- 03bb85d: chore: updated everything to latest except zod and Next.js (zod, tying errors, opennextjs-cloudflare only
  supports 15.3) CMD: find . -type f -name "package.json" -not -path "_/node_modules/_" -not -path "*/.*next/\*" -exec
  sh -c 'echo "\nUpdating $1/..." && (cd "$(dirname "$1")" && ncu -u)' \_ {} \; chore: revert zod upgrade as it breaks
  better-auth typing chore: zod broke better-auth typing again... chore: revert back to base sql chore: auth clean
  chore: FINALLY fixed schema.ts chore: reset migrations to current database state. removed the rateLimit table since we
  use cache now

## 0.0.1

### Patch Changes

- 7e2271f: init changeset
