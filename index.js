// Default values (These are needed for the code to work)
const token = 'PUT YOUR TOKEN HERE!';
const clientid = 'PUT YOUR CLIENT ID HERE!';
const api = 'PUT YOUR API KEY FROM PTERODACTYL HERE!';
const url = 'PUT YOUR PTERODACTYL PANEL URL HERE!'

// Feature toggles
const enabledFeatures = {
  serverCountChannel: true,
};

// Server count channel (This will let you create a channel that shows how many servers your Pterodactyl panel has)
const scchannel = 'PUT THE ID OF YOUR CHANNEL HERE!';
const interval = 'HOW OFTEN SHOULD THE CHANNEL UPDATE? (IN MINUTES)';
const sccname = 'Servers:'; // You can change this if you want

// Allowed roles (IDs of roles that can use the suspend/unsuspend commands even without Admin permissions)
const allowedRoles = ['ROLE_ID_1', 'ROLE_ID_2'];

// -------------------------------------------------------------------------------------------------------------------------

// Actual code - DON'T TOUCH UNLESS YOU KNOW WHAT YOU ARE DOING
const { Client, GatewayIntentBits, SlashCommandBuilder, REST, Routes, PermissionsBitField } = require('discord.js');
const axios = require('axios');

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

const commands = [
    new SlashCommandBuilder()
        .setName('suspend')
        .setDescription('Use this to suspend a server.')
        .addStringOption(option => 
            option.setName('server_uuid')
                .setDescription('Public UUID of the server you would like to suspend')
                .setRequired(true)
        ),
    new SlashCommandBuilder()
        .setName('unsuspend')
        .setDescription('Use this to unsuspend a server.')
        .addStringOption(option =>
            option.setName('server_uuid')
                .setDescription('Public UUID of the server you would like to unsuspend')
                .setRequired(true)
        ),
].map(command => command.toJSON());

const rest = new REST({ version: '10' }).setToken(token);

async function registerCommands() {
    try {
        console.log('Registering commands...');
        await rest.put(Routes.applicationCommands(clientid), { body: commands });
        console.log('Commands have been registered successfully.');
    } catch (error) {
        console.error('Failed to register commands:', error);
    }
}

async function getServerIDFromUUID(uuid) {
    try {
        let page = 1;
        let servers = [];

        do {
            const response = await axios.get(`${url}/api/application/servers?page=${page}`, {
                headers: {
                    Authorization: `Bearer ${api}`,
                    'Content-Type': 'application/json',
                    Accept: 'Application/vnd.pterodactyl.v1+json',
                },
            });

            servers = servers.concat(response.data.data);
            if (!response.data.meta.pagination.links.next) break;
            page++;
        } while (true);

        const server = servers.find(s => s.attributes.uuid.startsWith(uuid));
        return server ? server.attributes.id : null;
    } catch (error) {
        console.error('Error fetching server ID:', error.response?.data || error.message);
        return null;
    }
}


client.once('ready', async () => {
    console.log(`Logged in as ${client.user.tag}`);
    await registerCommands();

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
        console.log('Server count channel feature is disabled. You can enable it in the code.');
    }
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    const { commandName, options, member } = interaction;
    const serverUUID = options.getString('server_uuid');

    const hasPermission = member.permissions.has(PermissionsBitField.Flags.Administrator) ||
                          member.roles.cache.some(role => allowedRoles.includes(role.id));

    if (!hasPermission) {
        return interaction.reply({ content: '❌ You do not have permission to use this command. If you think this is a mistake, contact the administrator.', ephemeral: true });
    }

    await interaction.deferReply();

    const serverID = await getServerIDFromUUID(serverUUID);
    if (!serverID) {
        return interaction.editReply(`❌ Server with UUID ${serverUUID} not found.`);
    }

    try {
        const endpoint = commandName === 'suspend' ? 'suspend' : 'unsuspend';
        const response = await axios.post(`${url}/api/application/servers/${serverID}/${endpoint}`, {}, {
            headers: {
                Authorization: `Bearer ${api}`,
                'Content-Type': 'application/json',
                Accept: 'Application/vnd.pterodactyl.v1+json',
            },
        });

        if (response.status === 204) {
            await interaction.editReply(`✅ Server ${serverUUID} has been ${commandName === 'suspend' ? 'suspended' : 'unsuspended'} successfully.`);
        } else {
            throw new Error('Unexpected API response');
        }
    } catch (error) {
        console.error(`Error ${commandName}ing server:`, error.response?.data || error.message);
        await interaction.editReply(`❌ Failed to ${commandName} server ${serverUUID}. Please check the UUID and try again.`);
    }
});

client.login(token);
