require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Client, Collection, GatewayIntentBits, Partials } = require('discord.js');
const sqlite = require('better-sqlite3');
const rr = require('./features/reactionRoles');
const giveawaysFeature = require('./features/giveaways');
const apps = require('./features/applications');
const stats = require('./features/statsLogger');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessageReactions
  ],
  partials: [Partials.Message, Partials.Channel, Partials.Reaction]
});

client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');
if (fs.existsSync(commandsPath)) {
  const commandFiles = fs.readdirSync(commandsPath).filter(f => f.endsWith('.js'));
  for (const file of commandFiles) {
    const cmd = require(path.join(commandsPath, file));
    if (cmd.data && cmd.execute) client.commands.set(cmd.data.name, cmd);
  }
}

client.once('ready', async () => {
  console.log(`${client.user.tag} ready — ${new Date().toISOString()}`);
  // Initialize features
  rr.init(client);
  giveawaysFeature.init(client);
  apps.init(client);
  stats.init(client);
});

client.on('interactionCreate', async interaction => {
  if (interaction.isChatInputCommand()) {
    const cmd = client.commands.get(interaction.commandName);
    if (!cmd) return;
    try {
      await cmd.execute(interaction, client);
    } catch (err) {
      console.error('Command error', err);
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({ content: 'There was an error executing that command.', ephemeral: true });
      } else {
        await interaction.reply({ content: 'There was an error executing that command.', ephemeral: true });
      }
    }
  } else if (interaction.isModalSubmit()) {
    // Hand off to applications feature
    try {
      await apps.handleModal(interaction);
    } catch (e) {
      console.error('Modal handling failed', e);
    }
  } else if (interaction.isStringSelectMenu()) {
    // application selection menus, etc.
    try {
      await apps.handleSelect(interaction);
    } catch (e) {
      console.error('Select handling failed', e);
    }
  }
});

client.on('messageCreate', message => {
  // simple autoreply for application DMs & other flows can be added here
});

client.login(process.env.TOKEN);
