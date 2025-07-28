# Nimbus cloud storage

A better cloud

## Quickstart

### 1. Clone the Repository

```bash
git clone https://github.com/nimbusdotstorage/Nimbus.git
cd Nimbus
```

### 2. Install Dependencies

```bash
bun i
```

### 3. Set Up Postgres and Valkey with Docker

We use Docker to run a PostgreSQL database and Valkey for local development. Follow these steps to set it up:

1. Copy .env.development.example to .env

```bash
cp .env.development.example .env
```

Copy .env to child directories

```bash
bun run env:sync
```

2. **Start the database and valkey**:

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

3. **Verify the database and valkey is running if running a detached container**:

   ```bash
   docker ps
   ```

   You should see the `nimbus-db-local-compose` and `nimbus-cache-local-compose` containers in the list with a status of
   "Up".

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

### 4. Environment Setup

Follow the instructions on the first step of this [guide](https://www.better-auth.com/docs/authentication/google).

<details>
<summary>How to setup Google keys?</summary>
<br>

- Navigate to Google Cloud [console](https://console.cloud.google.com/).

- Create a new project and navigate to its dashboard.

- Under <b>API & Services</b>, navigate to <b>Oauth Consent Screen</b> and enter the details.

- Now create a client. Add <b>Authorised Javascript origin</b> as `http://localhost:3000` and <b> Authorised redirect
  uri</b> as `http://localhost:1284/api/auth/callback/google` and get your `client_id` and `client_secret`.

- Now navigate to <b>Audience</b> and add <b>Test users</b>.
</details>

<details>
<summary>How to setup Microsoft keys?</summary>
<br>

- Go to the <a href="https://portal.azure.com/" target="_blank"><b>Microsoft Azure Portal</b></a>.

- Navigate to <b>Azure Active Directory</b> → <b>App registrations</b> → click <b>New registration</b>.

- Enter a name for your app.

- Under <b>Supported account types</b>, choose: <b>Accounts in any organizational directory and personal Microsoft
  accounts</b> (i.e. all Microsoft account users).

- Under <b>Redirect URI</b>, select <b>Web</b> and enter: `http://localhost:1284/api/auth/callback/microsoft` (Also add
  `http://localhost:3000` under front-end origins if needed.)

- After registration, go to the app's <b>Overview</b> to copy your <b>Application (client) ID</b>.

- Then go to <b>Certificates & secrets</b> → <b>New client secret</b> → add a description and expiry → click <b>Add</b>
  → copy the generated secret value.

- Now, go to <b>API permissions</b> and make sure these **delegated Microsoft Graph** permissions are added and granted:
  - `email` – View users' email address
  - `offline_access` – Maintain access to data you have given it access to
  - `openid` – Sign users in
  - `profile` – View users' basic profile
  - `User.Read` – Sign in and read user profile
  - `Files.ReadWrite.All` – Have full access to user files (OneDrive access)

- Click <b>Grant admin consent</b> to apply the permissions.

</details>

```bash
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

MICROSOFT_CLIENT_ID=
MICROSOFT_CLIENT_SECRET=

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

### 5. Run Database Migrations

After setting up the database, run the migrations:

```bash
bun db:push
```

### 6. Enable Google Drive API

To ensure the application works correctly and can fetch data from Google Drive, you must enable the Google Drive API in
the same Google Cloud project where your OAuth credentials are configured.

<details>
<summary> Steps To Enable Drive API </summary>
<br>

1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Select the project you're using for OAuth.
3. Navigate to **APIs & Services > Library**.
4. Search for **Google Drive API** or [Click Here](https://console.cloud.google.com/apis/library/drive.googleapis.com).
5. Click **Enable**.
</details>

> Note: This step is **required** for the application to access Google Drive data via OAuth.

### 7. Start the Development Server

In a new terminal, start the development server:

> NOTE: this starts both the web and server development servers, to run just one, use `bun dev:web` or `bun dev:server`.
> Both will need the db running to work.

```bash
bun dev
```

The application should now be running at [http://localhost:3000](http://localhost:3000)

### 8. Access Authentication

Once the development server is running, you can access the authentication pages:

- **Sign In**: Navigate to [http://localhost:3000/signin](http://localhost:3000/signin)
- **Sign Up**: Navigate to [http://localhost:3000/signup](http://localhost:3000/signup)

Make sure you have configured the Google OAuth credentials in your `.env` file as described in step 4 for authentication
to work properly. Additionally, configure your Resend API key for the forgot password functionality to work.

If you want to contribute, please refer to the
[contributing guide](https://github.com/nimbusdotstorage/Nimbus/blob/main/CONTRIBUTING.md)

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
