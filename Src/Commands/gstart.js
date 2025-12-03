const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
module.exports = {
  data: new SlashCommandBuilder()
    .setName('gstart')
    .setDescription('Start a simple giveaway (scaffold).')
    .addChannelOption(o=>o.setName('channel').setRequired(true))
    .addStringOption(o=>o.setName('prize').setRequired(true))
    .addIntegerOption(o=>o.setName('winners').setRequired(true)),
  async execute(interaction){
    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageGuild)) return interaction.reply({ content: 'No perm', ephemeral: true });
    const channel = interaction.options.getChannel('channel');
    const prize = interaction.options.getString('prize');
    const winners = interaction.options.getInteger('winners');
    const msg = await channel.send({ content: `🎉 **GIVEAWAY** 🎉\nPrize: ${prize}\nReact with 🎉 to enter!` });
    await msg.react('🎉');
    return interaction.reply({ content: 'Giveaway started (scaffold).', ephemeral: true });
  }
};
