# Nimbus cloud storage

![Coverage](https://img.shields.io/badge/coverage-8%25-red)

A better cloud

## Quickstart

## Prerequisites

- [Bun](https://bun.sh/) (JavaScript runtime)
- [Docker](https://www.docker.com/) (for running PostgreSQL)
- [Git](https://git-scm.com/)
- [OpenSSL](https://www.openssl.org/)

### 1. Clone the Repository

```bash
git clone https://github.com/nimbusdotstorage/Nimbus.git
cd Nimbus
```

### 2. Install Dependencies

```bash
bun i
```

### 3. Environment Setup

1. Copy .env.example to .env

```bash
cp .env.example .env
```

Copy .env to child directories

```bash
bun run env:sync
```

Follow the instructions on the first step of this [guide](https://www.better-auth.com/docs/authentication/google).

<details>
<summary>How to setup Google keys?</summary>
<br>

- Navigate to Google Cloud [console](https://console.cloud.google.com/).

- Create a new project and navigate to its dashboard.

- Navigate to [**OAuth Consent Screen**](https://console.cloud.google.com/auth/overview) and enter the details.
  - Name: _Nimbus_
  - Audience: _External_
  - Contact info: _youremail@gmail.com_

- Navigate to [**Clients**](https://console.cloud.google.com/auth/clients).
  - Type: _Web application_
  - Name: _Nimbus_
  - Add **Authorised Javascript origin** as `http://localhost:3000`
  - Add **Authorised redirect uri** as `http://localhost:1284/api/auth/callback/google`
  - **IMPORTANT**:Get your `client_id` and `client_secret`.

- Enable Google Drive API
  - Search for **Google Drive API** or [Click Here](https://console.cloud.google.com/apis/library/drive.googleapis.com).
  - Click **Enable**.

- Now navigate to [**Audience**](https://console.cloud.google.com/auth/audience) and add **Test users**.

</details>

<details>
<summary>How to setup Microsoft keys?</summary>
<br>

Official Guide: [Microsoft Register App](https://learn.microsoft.com/en-us/entra/identity-platform/quickstart-register-app)

- Go to the <a href="https://portal.azure.com/" target="_blank">**Microsoft Azure Portal**</a>.

- Navigate to [**Microsoft Entra ID**](https://portal.azure.com/#blade/Microsoft_AAD_IAM/ActiveDirectoryMenuBlade) → Click **Add** → Click **App registrations**.
  - Name: _Nimbus_
  - Under **Supported account types**, choose: **Accounts in any organizational directory and personal Microsoft accounts** (i.e. all Microsoft account users).
  - Under **Redirect URI**, select **Web** and enter: `http://localhost:1284/api/auth/callback/microsoft` (Also add `http://localhost:3000` under front-end origins if needed.)

- After registration, navigate to the app's **Overview** to copy your **Application (client) ID**.

- In the left menu, Click **Manage**. Use this to navigate.

- Navigate to **Certificates & secrets** → Click **New client secret** → Add a _description_ and _expiry_ → Click **Add** → Copy the generated secret value.

- Navigate to **API permissions** and make sure these **delegated Microsoft Graph** permissions are added and granted:
  - `email` – View users' email address
  - `offline_access` – Maintain access to data you have given it access to
  - `openid` – Sign users in
  - `profile` – View users' basic profile
  - `User.Read` – Sign in and read user profile
  - `Files.ReadWrite.All` – Have full access to user files (OneDrive access)

- Click **Grant admin consent** to apply the permissions.
</details>

<details>
<summary>How to setup Box keys?</summary>
<br>

Official Guide: [Box Create OAuth 2.0 App](https://developer.box.com/guides/authentication/oauth2/oauth2-setup/)

- Navigate to Box Developer Console [console](https://app.box.com/developers/console).

- Click **Create App**. Select **Custom App**.

- Fill in the form.
  - Name: _Nimbus_
  - Purpose: _Integration_
  - Categories: _Productivity, Collaboration, Core Enterprise_
  - External system are you integrating with: _Box files_
  - Click **Next**
  - Select **User Authentication (OAuth 2.0)**
  - Click **Create App**

- Copy the **Client ID** and **Client Secret** under **OAuth 2.0 Credentials**.

- Add **OAuth 2.0 Redirect URIs** as `http://localhost:1284/api/auth/oauth2/callback/box`.

> **Note**: The redirect URI is different because it uses the generic oauth2 plugin from better-auth.

- Add **Application Scopes**:
  - `Read all files and folders stored in Box`
  - `Write all files and folders stored in Box`
  - `Manage Users`
  - `Enable Integrations`

- Add **CORS Domains** as `http://localhost:3000`.

- Click **Save Changes**.
</details>

<details>

Official Guide: [Dropbox OAuth Guide](https://developers.dropbox.com/oauth-guide)

<summary>How to setup Dropbox keys?</summary>
<br>

- Navigate to [Dropbox App Console](https://www.dropbox.com/developers/apps).

- Click **Create App**.
  - Select: _Scoped Access_
  - Select: _Full Dropbox Access_
  - Name: _Nimbus_

- Copy the **App key** and **App secret**.

- Add _OAuth 2 Redirect URIs_ as `http://localhost:1284/api/auth/callback/dropbox`.

- Navigate to **Permission** and add **Scopes**.
  - `account_info.read`
  - `files.metadata.read`
  - `files.content.read`
  - `files.content.write`
  - `sharing.read`

- Click **Submit** in the pop up bar.
</details>

```bash
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

MICROSOFT_CLIENT_ID=
MICROSOFT_CLIENT_SECRET=

BOX_CLIENT_ID=
BOX_CLIENT_SECRET=

# To generate a secret, just run `openssl rand -base64 32`
BETTER_AUTH_SECRET=
```

<details>
<summary>How to get a Resend API Key?</summary>
<br>

1. Go to [Resend.com](https://resend.com) and sign up or log in to your account.
2. From the dashboard, click on **"API Keys"** in the sidebar.
3. Click the **"Create API Key"** button.
4. Enter a name for your key (e.g., `nimbus-dev`) and confirm.
5. Copy the generated API key.

6. Add it to your `.env` file:
   </details>

   ```bash
   RESEND_API_KEY=your-api-key-here
   ```

### 4. Set Up Postgres and Valkey with Docker

We use Docker to run a PostgreSQL database and Valkey for local development. Follow these steps to set it up:

1. **Start the database and valkey**:

   ```bash
   bun db:up
   bun cache:up
   ```

   This will start a Postgres container with default credentials:
   - Host: `localhost`
   - Port: `5432`
   - Database: `nimbus`
   - Username: `postgres`
   - Password: `postgres`

   And a Valkey container with credentials:
   - Host: `localhost`
   - Port: `6379`
   - Username: `valkey`
   - Password: `valkey`

2. **Verify the database and valkey is running if running a detached container**:

   ```bash
   docker ps
   ```

   You should see the `nimbus-db` and `nimbus-cache` containers in the list with a status of "Up".

3. **Run Database Migrations**

After setting up the database, run the migrations:

```bash
bun db:push
```

4. **Connect to the database** (optional):

   ```bash
   # Using psql client inside the container
   docker compose exec postgres psql -U postgres -d nimbus
   ```

5. **Connect to the valkey** (optional):

   ```bash
   # Using valkey-cli inside the container
   docker compose exec valkey valkey-cli --user valkey --pass valkey
   ```

### 7. Start the Development Server

In a new terminal, start the development server:

> NOTE: this starts both the web and server development servers, to run just one, use `bun dev:web` or `bun dev:server`. Both will need the db running to work.

```bash
bun dev
```

The application should now be running at [http://localhost:3000](http://localhost:3000)

### 8. Access Authentication

Once the development server is running, you can access the authentication pages:

- **Sign In**: Navigate to [http://localhost:3000/signin](http://localhost:3000/signin)
- **Sign Up**: Navigate to [http://localhost:3000/signup](http://localhost:3000/signup)

Make sure you have configured the Google OAuth credentials in your `.env` file as described in step 4 for authentication to work properly. Additionally, configure your Resend API key for the forgot password functionality to work.

If you want to contribute, please refer to the [contributing guide](https://github.com/nimbusdotstorage/Nimbus/blob/main/CONTRIBUTING.md)

## Deploying Docker images (ex. Coolify)

Follow the [DEPLOYMENT.md](DEPLOYMENT.md) file for instructions on how to deploy with Coolify.

## Our Amazing Contributors

<a href="https://github.com/nimbusdotstorage/Nimbus/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=nimbusdotstorage/Nimbus" />
</a>

## Deploying Nimbus to VPS/VDS for Production or Development

> Deployment is the same locally or on a server, but OAuth providers (e.g., Google) require a domain for callback URLs.

### Steps to Deploy on a Server:

1. Point your **domain** to the server.
2. Use the domain in Google API keys for callback URLs (e.g., `https://example.com:1284/api/auth/callback/google`).
3. Update the `.env` file with the domain (e.g., `TRUSTED_ORIGINS=https://example.com:3000`).
