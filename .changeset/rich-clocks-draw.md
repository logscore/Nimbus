---
"@nimbus/shared": patch
"@nimbus/auth": patch
"@nimbus/env": patch
"@nimbus/server": patch
"@nimbus/db": patch
"@nimbus/web": patch
---

chore: updated everything to latest except zod and Next.js (zod, tying errors, opennextjs-cloudflare only supports 15.3)
CMD: find . -type f -name "package.json" -not -path "_/node_modules/_" -not -path "*/.*next/\*" -exec sh -c 'echo
"\nUpdating $1/..." && (cd "$(dirname "$1")" && ncu -u)' \_ {} \; chore: revert zod upgrade as it breaks better-auth
typing chore: zod broke better-auth typing again... chore: revert back to base sql chore: auth clean chore: FINALLY
fixed schema.ts chore: reset migrations to current database state. removed the rateLimit table since we use cache now
