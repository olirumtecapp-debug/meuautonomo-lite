# Environment variables (reference only)

Do not commit `.env` files or real values. Configure these variables in the local environment or in the Antigravity/WebDev secret manager.

```text
DATABASE_URL=mysql://USER:PASSWORD@HOST/DATABASE?ssl-mode=REQUIRED
JWT_SECRET=<long-random-secret>
VITE_APP_ID=<manus-app-id>
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://manus.im
OWNER_OPEN_ID=<owner-open-id>
OWNER_NAME=<owner-name>
BUILT_IN_FORGE_API_URL=<managed-forge-url>
BUILT_IN_FORGE_API_KEY=<server-only-key>
VITE_FRONTEND_FORGE_API_URL=<frontend-forge-url-if-required>
VITE_FRONTEND_FORGE_API_KEY=<frontend-key-if-required>
```

The deployed environment already provides these values through its secret/configuration system. Never paste real credentials into source control, ZIP files, screenshots, logs, or issue descriptions.
