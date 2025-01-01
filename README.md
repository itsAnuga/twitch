# twitch
## requirements
- Two Twitch User Accounts (https://twitch.tv)
  - One Bot Account
  - One Streamer Account
- Two Application Client-Id's (https://dev.twitch.tv)
  - One from the Bot Account
  - One from the Streamer Account
- Node 18+
## installation
*Goto https://twitch.tv and logout from your account.*

```
git clone ...
cd twitch
```

Create a `.env` file, copy/paste `.env-example` for pre-defined variables and fill in the blanks.

The variable values, you'll find in the Dev Console on Twitch, on the different accounts.

Make the `tokens` folder, writeable, by the user that is going to run the bot.

### Install dependencies

```
npm install
```

#### ~~Fetch Bot Account Application Access Token~~

~~Can be run before each time the bot starts~~

```
npm start
```

### Run the webserver (express)

```
npm run http
```

*Visit: http://localhost:3000*

#### Visit: *Step 1*

Login with your Bot Account.

You will be redirect back to `http://localhost:3000` if there no errors. (file permission/connections/variables etc)

Open a new tab/window and visit `https://twitch.tv` and logout from the Bot Account.

Go back to `http://localhost:3000`.

#### Visit: *Step 2*
Login with your Streamer Account.

You will be redirect back to `http://localhost:3000` if there no errors. (file permission/connections/variables etc)

*Now you can exit the `npm run http`*

### Start the Bot

```
npm run bot
```

### bot

If all has gone well, it will listen to chat on the steramers channel and specificly after `HeyGuys`.

### streamer

Typing `HeyGuys` in chat, will trigger the Bot to respond.

### server-side-ready?

Yes, this app is server-side ready (Cloud Hosting)
Or run it locally, up to you.

## security

Additional security can be added, for example:

- Request Header validation.
