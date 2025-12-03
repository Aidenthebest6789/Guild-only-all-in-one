const fs = require('fs');
const path = require('path');
const storagePath = path.join(__dirname, '..', 'data', 'reaction_roles.json');
let store = {};
if (fs.existsSync(storagePath)) {
  try { store = JSON.parse(fs.readFileSync(storagePath, 'utf8')); } catch(e){ store = {}; }
}
function save(){ fs.mkdirSync(path.dirname(storagePath), { recursive: true }); fs.writeFileSync(storagePath, JSON.stringify(store, null, 2)); }

module.exports = {
  init(client) {
    client.on('messageReactionAdd', async (reaction, user) => {
      if (user.bot) return;
      try {
        if (reaction.message.partial) await reaction.message.fetch();
        const guildId = reaction.message.guildId;
        const key = `${guildId}-${reaction.message.id}`;
        if (!store[key]) return;
        const roleId = store[key][reaction.emoji.id || reaction.emoji.name];
        if (!roleId) return;
        const member = await reaction.message.guild.members.fetch(user.id);
        await member.roles.add(roleId).catch(()=>{});
      } catch(e){ console.error('RR add', e); }
    });

    client.on('messageReactionRemove', async (reaction, user) => {
      if (user.bot) return;
      try {
        if (reaction.message.partial) await reaction.message.fetch();
        const guildId = reaction.message.guildId;
        const key = `${guildId}-${reaction.message.id}`;
        if (!store[key]) return;
        const roleId = store[key][reaction.emoji.id || reaction.emoji.name];
        if (!roleId) return;
        const member = await reaction.message.guild.members.fetch(user.id);
        await member.roles.remove(roleId).catch(()=>{});
      } catch(e){ console.error('RR remove', e); }
    });
  },
  // helpers for commands to call
  addMapping(guildId, messageId, emoji, roleId){
    const key = `${guildId}-${messageId}`;
    if (!store[key]) store[key] = {};
    store[key][emoji] = roleId;
    save();
  },
  removeMapping(guildId, messageId, emoji){
    const key = `${guildId}-${messageId}`;
    if (store[key]) { delete store[key][emoji]; save(); }
  },
  getMappings(guildId, messageId){
    const key = `${guildId}-${messageId}`;
    return store[key] || {};
  }
};
