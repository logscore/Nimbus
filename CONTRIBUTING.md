# Contributing to Nimbus

Thank you for your interest in contributing to Nimbus! This guide will help you set up the development environment.

## Prerequisites

- [Bun](https://bun.sh/) (JavaScript runtime)
- [Docker](https://www.docker.com/) (for running PostgreSQL)
- [Git](https://git-scm.com/)

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

### 3. Environment Setup

Copy the `.env.example` file to `.env` using this command, `cp .env.example .env` and fill in these values. Follow the
instructions on the first step of this [guide](https://www.better-auth.com/docs/authentication/google).

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

- Under <b>Supported account types</b>, choose:  
  <b>Accounts in any organizational directory and personal Microsoft accounts</b>  
  (i.e. all Microsoft account users).

- Under <b>Redirect URI</b>, select <b>Web</b> and enter:  
  `http://localhost:1284/api/auth/callback/microsoft`  
  (Also add `http://localhost:3000` under front-end origins if needed.)

- After registration, go to the app's <b>Overview</b> to copy your <b>Application (client) ID</b>.

- Then go to <b>Certificates & secrets</b> → <b>New client secret</b> → add a description and expiry → click <b>Add</b>
  → copy the generated secret value.

- Now, go to <b>API permissions</b> and make sure these **delegated Microsoft Graph** permissions are added and granted:
  - `email` – View users' email address
  - `offline_access` – Maintain access to data you have given it access to
  - `openid` – Sign users in
  - `profile` – View users' basic profile
  - `User.Read` – Sign in and read user profile
  - `Files.ReadWrite` – Have full access to user files (OneDrive access)

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

### 4. Set Up Postgres and Valkey with Docker

We use Docker to run a PostgreSQL database and Valkey for local development. Follow these steps to set it up:

1. **Start the database and valkey**:

   ```bash
   bun db:up
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
   docker compose ps
   ```

   You should see the `nimbus-db` and `nimbus-valkey` containers in the list with a status of "Up".

3. **Connect to the database** (optional):

   ```bash
   # Using psql client inside the container
   docker compose exec postgres psql -U postgres -d nimbus
   ```

4. **Connect to the valkey** (optional):

   ```bash
   # Using valkey-cli inside the container
   docker compose exec valkey valkey-cli --user valkey --pass valkey
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

The application should now be running at http://localhost:3000

## Making Changes

### Fork the repo

- On GitHub, click the "Fork" button and make your own fork of the repo

### Clone your fork locally

```bash
git clone https://github.com/\<yourusername\>/Nimbus.git
cd Nimbus
```

### Create a feature branch

```bash
git checkout -b feature/your-feature-name
```

Add the original repo as a remote:

```bash
git remote add upstream https://github.com/nimbusdotstorage/Nimbus.git
```

> Make sure to pull from the upstream repo to keep your fork up to date using `git pull upstream main`

### Commit your changes

```bash
git add .
git commit -m "Your commit message"
```

### Push to the branch

```bash
git push origin feature/your-feature-name
```

### Open a pull request

- Go to GitHub and open a pull request from your feature branch

> Note: If you open a pull request, try to minimize the amount of repo wide changes you make. It will highly increase
> the chances that we just review and merge. We're much more likely to question and challenge changes if they do not
> make sense to the actual features or fixes the PR was intended for. Example: adding unneeded dependencies for the
> server when the PR was for a dialog component, or changing the middleware functionality when you were working on
> better error handling on the server

## Useful Commands

- **Stop the database**:

  ```bash
  bun db:down
  ```

- **Reset the database** (deletes all data):

  ```bash
  bun db:reset
  ```

## Troubleshooting

- **Port conflicts**: If port 5432 is already in use, just change the port mapping in `docker-compose.yml`
- **Permission issues**: On Linux, you might need to run Docker commands with `sudo` or add your user to the `docker`
  group with the command `sudo usermod -aG docker $USER`
- **Database connection issues**: Ensure the database is running and the connection string in your `.env` file is
  correct

## License

By contributing to this project, you agree that your contributions will be licensed under its
[Apache License 2.0](LICENSE).

---

## For new contributors

We want everyone to be able to contribute something to Nimbus. So we set up a list of a few items that can get you
started contributing to the project. This will be updated as needed.

### 1. Storage source support

If you have experience with the APIs or specs for S3, R2, OneDrive, or any other storage source, we would love it if you
help us add support for it. Try to stay as close to the API spec as possible, especially for S3 storage so we can
support S3 compatible storage sources like MinIO.

### 2. UI/UX improvements

Some items to get started with:

- Add a missing page or component
- Add error or loading states to a page or component
- Add custom file icons for specific file types
- Create modals for file actions (add, delete, rename, move, etc.)
- Create modals for adding new storage sources
- Create modals for tag management (add, delete, edit, rename, etc.)
- Create pop ups for uploading files & folders
- Notification dropdown
- A settings page that functions with the providers and user settings
- Add folder tree navigation, breadcrumbs, or a file previewer

We realize that many of these changes will not have total functionality hooked up yet. Thats fine, just make sure to add
dummy data so we can see the UI and make sure it works as expected before adding real data.

### 3. Backend Improvements

Some items to get started with:

- Any security related changes
- Add RPC support with [Hono](https://hono.dev/docs/guides/rpc). Add the provider and migrate a few routes that haven't
  been migrated.
- Add in storage support drivers like OneDrive, S3, etc.
- Add account linking to the Better-Auth config if needed.
- Add authentication to the API routes if needed.
- Add rate limiting to the API routes if needed.
- Add database tables and migrations if needed for new features.
- Add or improve logging with a lightweight logger.
- Improve error handling.

### 4. Design

Some items to get started with:

- Tag color selection
- Visual hierarchy improvements
- Transitions and component design
- Any errors in spacing, margin, sizing, mode toggling, or responsiveness that you can find.

### 5. General Improvements/Features

Some items to get started with:

- Update the README.md or CONTRIBUTING.md if they are out of date.
- Improve error messages on both the frontend and backend.
- Add tests to the backend using Vitest
- Add tests to the frontend using Playwright
- Help us build a public API for Nimbus
- Build a CLI for that API to upload/download/manage files form the terminal
