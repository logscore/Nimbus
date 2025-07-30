---
"@nimbus/auth": patch
"@nimbus/server": patch
---

chore: added better-auth on error handling for production (console.error(error, AuthContext) chore: added upstash vs
valkey getter handling (upstash does not resturn string) chore: added wrangler dev, bun dev, and production runtime
handling for server chore: context must be re-created (not a singleton) for edge runtime)
