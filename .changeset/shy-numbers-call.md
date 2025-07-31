---
"@nimbus/auth": patch
"@nimbus/env": patch
"@nimbus/server": patch
---

chore: add WRANGLER_DEV to .env.example chore: configure t3 env to switch NODE_ENV to production when WRANGLER_DEV is
"true" chore: update auth.ts to throw on error chore: update server.ts to load env from hono context chore: update
server.ts to include Cloudflare namespace types: Env, ExecutionContext
