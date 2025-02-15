# ptero-discord-link
## About The Project

I am pretty sure someone already did this somewhere, but I am trying to make the best discord bot for linking your Pterodactyl panel to your discord server. This will be useful for hostings that just want an easy and intuitive way to manage their servers right from their Discord.
## Getting Started

This is how you can install the bot
### Prerequisites

You will need to have these before you start doing anything

- Node.JS
  - You will need to download node.js from their website: https://nodejs.org/en
- npm
  - You should get npm along with node.js when you install it.
- A way to host
  - You will need to selfhost the bot, so get a node.js server or create a folder for hosting the bot on your PC
### Installation

Follow these steps to install the bot:

1. Download the index.js file from the latest release. This is where all the code resides.

2. Place the index.js file in your hosting folder or server and run the following command to create the necessary files.
   ```sh
   npm init -y
   ```

3. Install NPM packages - run the following commands:
   ```sh
   npm i discord.js
   npm i axios
   ```

4. Configure the code - open index.js and change these values: 
   ```js
   // Default values (These are needed for the code to work)
   const token = 'PUT YOUR TOKEN HERE!';
   const api = 'PUT YOUR API KEY FROM PTERODACTYL HERE!';
   const url = 'PUT YOUR PTERODACTYL PANEL URL HERE!'; // For example: https://panel.mypterodactyl.com
   ```
   (You can get your token by creating a bot in the Discord developer portal: https://discord.com/developers/applications and your Pterodactyl API key by going to your Pterodactyl's admin panel and choosing "Application API" on the left)

5. Choose your features - Go to this part of the code: 
   ```js
   // Feature toggles
   const enabledFeatures = {
     serverCountChannel: true,
   };
   ```
   And change each value to true/false depending on if you want that feature or not.
## Usage

Once you set everything up, simply turn on your bot using this command:
   ```sh
   node index.js
   ```
And you are done! The bot should go online and you should see this message in the console:
   ```text
   Logged in as (your bot's username)
   ```
## Roadmap

- [ ] Add /suspend command
- [ ] Add /unsuspend command
- [ ] Add /create command
- [ ] Add /deletesrv command
- [ ] Add /deleteusr command
## License

Distributed under the MIT License. See [MIT License](https://opensource.org/licenses/MIT) for more information.
