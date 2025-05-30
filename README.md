# Overview 

My Discord bot to prevent spam and malicious link. This project is still under development and testing on my discord server. Any feedback is welcome. 

## Project structure
Below is a basic overview of the project structure:

```
├── utils
│   ├── detector.js
│   ├── logger.js
│   ├── ttlMap.js
│   ├── urlAnalyzer.js
├── handlers
│   ├── msgHandler.js  
├── .env
├── main.js      -> main file of the bot
├── client.js
├── package.json
├── README.md
└── .gitignore
```

## Running app locally

Before you start, you'll need to install [NodeJS](https://nodejs.org/en/download/) and [create a Discord app](https://discord.com/developers/applications) with the proper permissions:
- `applications.commands`
- `bot` (with Send Messages enabled)


Configuring the app is covered in detail in the [getting started guide](https://discord.com/developers/docs/getting-started).

### Setup project

For the first time:
```
npm install
```

### Install slash commands

The commands for the example app are set up in `commands.js`. All of the commands in the `ALL_COMMANDS` array at the bottom of `commands.js` will be installed when you run the `register` command configured in `package.json`:

```
npm run register
```

### Run the app

After your credentials are added, go ahead and run the app:

```
node main.js
```
or 
```
npm run start
```

> ⚙️ A package [like `nodemon`](https://github.com/remy/nodemon), which watches for local changes and restarts your app, may be helpful while locally developing. Use ```npm run dev``` instead.
