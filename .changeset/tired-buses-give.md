---
"@nimbus/server": patch
"@nimbus/web": patch
---

- Added a new handleUnauthorizedError utility function in client.ts for consistent error handling
- Added an auth context system to manage sign-in state (easy to prompt for login when unauthorized)
- Updated all frontend drive proctected routes (drives, files, tags)
- Improved type inferring for tags in server by removing try catch blocks
- Renamed default error to sendForbidden and reserved sendUnauthorized for out-of-date token
- Fixed race condition in account-provider by removing unecessary setters and by adding a useRef
