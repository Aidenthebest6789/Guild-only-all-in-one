const { SlashCommandBuilder, PermissionFlagsBits, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');
const apps = require('../features/applications');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('application')
    .setDescription('Manage application forms')
    .addSubcommand(sub => sub.setName('create').setDescription('Create a new application').addStringOption(o=>o.setName('name').setRequired(true)))
    .addSubcommand(sub => sub.setName('add_dropdown').setDescription('Add application to dropdown list').addStringOption(o=>o.setName('name').setRequired(true)))
    .addSubcommand(sub => sub.setName('send').setDescription('Send dropdown to channel').addChannelOption(o=>o.setName('channel').setRequired(true)))
    .addSubcommand(sub => sub.setName('setreview').setDescription('Set review channel').addChannelOption(o=>o.setName('channel').setRequired(true)).addStringOption(o=>o.setName('name').setRequired(true))),
  async execute(interaction){
    const sub = interaction.options.getSubcommand();
    if (sub === 'create'){
      if (!interaction.member.permissions.has(PermissionFlagsBits.ManageGuild)) return interaction.reply({ content: 'No perm', ephemeral: true });
      const name = interaction.options.getString('name');
      apps.createApplication(interaction.guildId, name);
      return interaction.reply({ content: `Created application ${name}`, ephemeral: true });
    } else if (sub === 'add_dropdown'){
      const name = interaction.options.getString('name');
      // simply notify; real dropdown building happens on send
      return interaction.reply({ content: `Added ${name} to application list (placeholder).`, ephemeral: true });
    } else if (sub === 'send'){
      const channel = interaction.options.getChannel('channel');
      const list = apps.listApplications(interaction.guildId);
      if (!list.length) return interaction.reply({ content: 'No applications available.', ephemeral: true });
      const options = list.map(a=>({ label: a.name, value: a.name }));
      const menu = new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder().setCustomId('apply_select_main').setPlaceholder('Choose an application').addOptions(options)
      );
      await channel.send({ content: 'Apply using the menu below:', components: [menu] });
      return interaction.reply({ content: 'Sent application menu.', ephemeral: true });
    } else if (sub === 'setreview'){
      if (!interaction.member.permissions.has(PermissionFlagsBits.ManageGuild)) return interaction.reply({ content: 'No perm', ephemeral: true });
      const name = interaction.options.getString('name');
      const ch = interaction.options.getChannel('channel');
      const ok = apps.setReviewChannel(name, ch.id);
      if (ok) return interaction.reply({ content: `Review channel for ${name} set to ${ch.name}`, ephemeral: true });
      return interaction.reply({ content: 'Application not found.', ephemeral: true });
    }
  }
};
