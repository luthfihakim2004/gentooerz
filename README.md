# Overview 

My Discord bot to prevent spam and malicious link. This project is still under development and testing on my discord server. Any feedback is welcome. 

## Features

- Spam & malicious messages detection.
- URL scanning with VirusTotal.
- Modular & clean structure layout.
- Lavalink Audio player with multiple sources based the server.

## Project Structure
Below is a basic overview of the project structure:

```
<<<<<<< HEAD
├── assets/         # Static assets used by the bot (e.g. banners, icons)
├── commands/       # Slash and text command logic files
├── config/         # Configuration files (only for filtering url ATM)
├── events/         # Discord event listeners
├── handlers/       # Discord command & event handlers logic 
├── lavaEvents/     # Lavalink events handler for audio player
├── utils/          # Utility functions
├── .env
├── client.js       # Bot client setup
├── commands.js     # Bot commands registration file
├── main.js         # Main entry point of the bot
=======
├── utils/
├── events/
├── handlers/
├── main.js      -> main file of the bot
├── client.js
>>>>>>> 2c91eb4669b25fbf93cd8ce21dfbbe9568c2d1aa
├── package.json
├── README.md
└── .gitignore
```
## Prerequisites

- [Node.js](https://nodejs.org/en/download/)
- [Discord application & bot](https://discord.com/developers/applications) with necessary permissions.

Configuring the discord app & bot is covered in detail in the [getting started guide](https://discord.com/developers/docs/getting-started).

## Running app locally

<<<<<<< HEAD
Before you start, ensure the prerequisites are fulfilled and you have setup the environment variables:
=======
Before you start, you'll need to install [NodeJS](https://nodejs.org/en/download/) and [create a Discord app](https://discord.com/developers/applications) with the proper permissions:
- `applications.commands`
- `bot` (with necessary permissions)
>>>>>>> 2c91eb4669b25fbf93cd8ce21dfbbe9568c2d1aa

```
APP_ID=
PORT=
DISCORD_TOKEN=
PUBLIC_KEY=
VIRUSTOTAL_KEY=
HEROKU_LOG=
PASSIVE_MODE=
AFK_ROOM=
GENERAL_ROOM=
GUILD_ID=
LOG_CHANNEL_ID=
WELCOME_CHANNEL_ID=
SPOTIFY_CLIENT_ID=
SPOTIFY_CLIENT_SECRET=
LAVALINK_HOST=
LAVALINK_PORT=
LAVALINK_SECRET=
```

### Setup project

For the first time:
```
npm install
```

### Install slash commands

<<<<<<< HEAD
The commands for the app are set up in `commands.js`. All of the commands in the `ALL_COMMANDS` array at the bottom of `commands.js` will be installed when you run the `register` command configured in `package.json`:
=======
The commands are set up in [commands](https://github.com/luthfihakim2004/gentooerz/tree/main/commands) directory. All of the command files in the directory need to be registered first by running the `register` command configured in `package.json`:
>>>>>>> 2c91eb4669b25fbf93cd8ce21dfbbe9568c2d1aa

```
npm run register
```

### Run the app

<<<<<<< HEAD
You can run the app directly by:
=======
After your the environment is ready, go ahead and run the app:
>>>>>>> 2c91eb4669b25fbf93cd8ce21dfbbe9568c2d1aa

```
node main.js
```
or 
```
npm run start
```

> ⚙️ A package [like `nodemon`](https://github.com/remy/nodemon), which watches for local changes and restarts your app, may be helpful while locally developing. Use ```npm run dev``` instead.
