const { SlashCommandBuilder } = require('discord.js');
const { getVoiceConnection } = require('@discordjs/voice');
module.exports = {
  data: new SlashCommandBuilder().setName('stop').setDescription('Stop playback and leave voice channel.'),
  async execute(interaction){
    const conn = getVoiceConnection(interaction.guildId);
    if (!conn) return interaction.reply({ content: 'Not playing.', ephemeral: true });
    conn.destroy();
    return interaction.reply('Stopped and left voice channel.');
  }
};
