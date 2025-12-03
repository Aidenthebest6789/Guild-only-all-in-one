const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const fs = require('fs');
const path = require('path');
const configPath = path.join(__dirname, '..', 'data', 'verify.json');
let cfg = {};
if (fs.existsSync(configPath)) { cfg = JSON.parse(fs.readFileSync(configPath, 'utf8')); }
function save(){ fs.writeFileSync(configPath, JSON.stringify(cfg, null, 2)); }

module.exports = {
  data: new SlashCommandBuilder()
    .setName('verify')
    .setDescription('Setup or use verification. Owner/admin: /verify setup <role>. Users: /verify to get role.')
    .addSubcommand(sub => sub.setName('setup').setDescription('Set verification role').addRoleOption(opt => opt.setName('role').setRequired(true)))
    .addSubcommand(sub => sub.setName('use').setDescription('Get the verification role')),
  async execute(interaction){
    const sub = interaction.options.getSubcommand();
    if (sub === 'setup'){
      if (!interaction.member.permissions.has(PermissionFlagsBits.ManageGuild)) return interaction.reply({ content: 'You lack permissions.', ephemeral: true });
      const role = interaction.options.getRole('role');
      cfg[interaction.guildId] = { roleId: role.id };
      save();
      return interaction.reply({ content: `Verification role set to ${role.name}.`, ephemeral: true });
    } else {
      const conf = cfg[interaction.guildId];
      if (!conf) return interaction.reply({ content: 'Verification not configured.', ephemeral: true });
      try {
        await interaction.member.roles.add(conf.roleId);
        return interaction.reply({ content: 'You have been verified!', ephemeral: true });
      } catch(e){
        return interaction.reply({ content: 'Failed to add role. Check my permissions.', ephemeral: true });
      }
    }
  }
};
