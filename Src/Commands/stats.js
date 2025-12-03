const { SlashCommandBuilder } = require('discord.js');
module.exports = {
  data: new SlashCommandBuilder().setName('stats').setDescription('Show bot stats.'),
  async execute(interaction){
    const uptime = Math.floor(process.uptime());
    const mem = (process.memoryUsage().rss / 1024 / 1024).toFixed(2);
    await interaction.reply({ content: `Uptime: ${uptime}s\nMemory: ${mem} MB\nUsers cached: ${interaction.client.users.cache.size}` });
  }
};
