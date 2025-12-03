module.exports = {
  name: 'guildMemberAdd',
  async execute(member){
    // Optional: auto-assign a role or message new members
    // Example: send welcome DM
    try {
      await member.send(`Welcome to ${member.guild.name}! Use /verify to get access.`);
    } catch(e){}
  }
};
