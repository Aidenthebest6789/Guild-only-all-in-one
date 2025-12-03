const ms = require('ms');
let interval = null;
module.exports = {
  init(client){
    const channelId = process.env.STATS_CHANNEL_ID;
    if (!channelId) return;
    const ch = client.channels.cache.get(channelId);
    if (!ch) return;
    if (interval) clearInterval(interval);
    interval = setInterval(() => {
      const uptime = Math.floor(process.uptime());
      const mem = (process.memoryUsage().rss / 1024 / 1024).toFixed(2);
      const msg = `Uptime: ${uptime}s | Memory: ${mem} MB | Users: ${client.users.cache.size}`;
      ch.send(msg).catch(()=>{});
    }, 1000 * 60 * 10); // every 10 minutes
  }
};
