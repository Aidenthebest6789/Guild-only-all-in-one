const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const rr = require('../features/reactionRoles');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('rr-setup')
    .setDescription('Create a reaction-role message and map emojis to roles.')
    .addChannelOption(opt => opt.setName('channel').setDescription('Channel to send the message').setRequired(true))
    .addStringOption(opt => opt.setName('content').setDescription('Message content').setRequired(true)),
  async execute(interaction){
    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageGuild)) return interaction.reply({ content: 'You lack permissions.', ephemeral: true });
    const channel = interaction.options.getChannel('channel');
    const content = interaction.options.getString('content');
    const msg = await channel.send({ content });
    await interaction.reply({ content: `Reaction-role message created: ${msg.url}`, ephemeral: true });
  }
};
