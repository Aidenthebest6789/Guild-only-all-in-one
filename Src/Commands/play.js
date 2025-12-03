const { SlashCommandBuilder } = require('discord.js');
const SpotifyWebApi = require('spotify-web-api-node');
const fetch = require('node-fetch');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, NoSubscriberBehavior, getVoiceConnection } = require('@discordjs/voice');

const spotify = new SpotifyWebApi({
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET
});

async function getToken(){
  const data = await spotify.clientCredentialsGrant();
  spotify.setAccessToken(data.body.access_token);
  setTimeout(()=>spotify.setAccessToken(null), (data.body.expires_in - 60) * 1000);
}

let queues = {}; // simple in-memory queue per guild

module.exports = {
  data: new SlashCommandBuilder()
    .setName('play')
    .setDescription('Search Spotify and play preview (30s) in your voice channel.')
    .addStringOption(opt => opt.setName('query').setDescription('Track name or artist').setRequired(true)),
  async execute(interaction){
    await interaction.deferReply();
    const query = interaction.options.getString('query');
    try {
      await getToken();
      const res = await spotify.searchTracks(query, { limit: 5 });
      if (!res.body.tracks.items.length) return interaction.editReply('No tracks found.');
      const track = res.body.tracks.items[0];
      if (!track.preview_url) return interaction.editReply('No preview available for that track.');
      const memberVC = interaction.member.voice.channel;
      if (!memberVC) return interaction.editReply('You must be in a voice channel.');

      // join voice
      const connection = joinVoiceChannel({
        channelId: memberVC.id,
        guildId: interaction.guildId,
        adapterCreator: interaction.guild.voiceAdapterCreator
      });

      // simple queue: play immediately, then next if exists
      if (!queues[interaction.guildId]) queues[interaction.guildId] = [];
      queues[interaction.guildId].push({ title: track.name, url: track.preview_url, artists: track.artists.map(a=>a.name).join(', ') });

      if (queues[interaction.guildId].length === 1){
        const player = createAudioPlayer({ behaviors: { noSubscriber: NoSubscriberBehavior.Stop } });
        const stream = await fetch(track.preview_url);
        const arrayBuffer = await stream.arrayBuffer();
        const resource = createAudioResource(Buffer.from(arrayBuffer));
        player.play(resource);
        connection.subscribe(player);
        await interaction.editReply(`Now playing preview: **${track.name}** — ${track.artists.map(a=>a.name).join(', ')}`);
        player.on('idle', ()=>{
          queues[interaction.guildId].shift();
          if (queues[interaction.guildId].length > 0){
            const next = queues[interaction.guildId][0];
            // play next (fire and forget)
            (async ()=>{
              try {
                const stream2 = await fetch(next.url);
                const buffer2 = await stream2.arrayBuffer();
                const res2 = createAudioResource(Buffer.from(buffer2));
                player.play(res2);
              } catch(e){ connection.destroy(); }
            })();
          } else {
            try{ connection.destroy(); } catch(e){}
          }
        });
      } else {
        await interaction.editReply(`Queued: **${track.name}** — ${track.artists.map(a=>a.name).join(', ')}`);
      }

    } catch (e){
      console.error(e);
      await interaction.editReply('Error searching or playing.');
    }
  }
};
