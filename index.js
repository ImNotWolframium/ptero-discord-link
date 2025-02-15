const { Client,GatewayIntentBits } = require('discord.js');
const axios = require('axios');

// Default values (These are needed for the code to work)
const token = 'PUT YOUR TOKEN HERE!';
const api = 'PUT YOUR API KEY FROM PTERODACTYL HERE!';
const url = 'PUT YOUR PTERODACTYL PANEL URL HERE!'; // For example: https://panel.mypterodactyl.com

// Feature toggles
const enabledFeatures = {
  serverCountChannel: true,
};

// Server count channel (This will let you create a channel which shows how many servers does your pterodactyl panel have)
const scchannel = 'PUT THE ID OF YOUR CHANNEL HERE!';
const interval = 'HOW OFTEN SHOULD THE CHANNEL UPDATE? (IN MINUTES)'
const sccname = 'Servers:' // You can change this if you want

// Actual code - DON'T TOUCH UNLESS YOU KNOW WHAT YOU ARE DOING
const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);

  if (enabledFeatures.serverCountChannel) {
      const updateChannelName = async () => {
          console.log('Checking...');

          try {
              const response = await axios.get(`${url}/api/application/servers`, {
                  headers: {
                      Authorization: `Bearer ${api}`,
                      'Content-Type': 'application/json',
                      Accept: 'Application/vnd.pterodactyl.v1+json',
                  },
              });

              const serverCount = response.data.meta.pagination.total;

              const channel = await client.channels.fetch(scchannel);
              if (channel) {
                  const newName = `${sccname} ${serverCount}`;
                  if (channel.name !== newName) {
                      await channel.setName(newName);
                      console.log(`Updated to: ${newName}`);
                  } else {
                      console.log('No change necessary.');
                  }
              }

          } catch (error) {
              console.error('Error updating channel name:', error);
          }
      };

      setInterval(updateChannelName, interval * 60 * 1000);

      updateChannelName();
  } else {
      console.log('Server count channel feature is disabled.');
  }
});

client.login(token);