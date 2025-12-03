const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
const storagePath = path.join(__dirname, '..', 'data', 'applications.json');
let store = { applications: {} };
if (fs.existsSync(storagePath)) {
  try { store = JSON.parse(fs.readFileSync(storagePath, 'utf8')); } catch(e){ store = { applications: {} }; }
}
function save(){ fs.mkdirSync(path.dirname(storagePath), { recursive: true }); fs.writeFileSync(storagePath, JSON.stringify(store, null, 2)); }

module.exports = {
  init(client){ /* no-op for now */ },
  handleSelect: async (interaction) => {
    // If it's an application dropdown, open a modal containing questions from the application config
    const customId = interaction.customId;
    if (!customId.startsWith('apply_select_')) return;
    const appName = customId.split('apply_select_')[1];
    const app = store.applications[appName];
    if (!app) return interaction.reply({ content: 'Application not found.', ephemeral: true });
    // Build modal from configuration (simple: single long input called answers)
    const modal = new ModalBuilder()
      .setCustomId(`apply_modal_${appName}_${interaction.user.id}`)
      .setTitle(`Apply — ${appName}`);
    const input = new TextInputBuilder()
      .setCustomId('answers')
      .setLabel('Your answers (please format as you like)')
      .setStyle(TextInputStyle.Paragraph)
      .setPlaceholder('Answer the application questions here...')
      .setRequired(true);
    modal.addComponents(new ActionRowBuilder().addComponents(input));
    await interaction.showModal(modal);
  },
  handleModal: async (interaction) => {
    if (!interaction.customId.startsWith('apply_modal_')) return;
    const parts = interaction.customId.split('_');
    const appName = parts[2];
    const userId = parts[3];
    const app = store.applications[appName];
    if (!app) return interaction.reply({ content: 'Application config missing.', ephemeral: true });
    const answers = interaction.fields.getTextInputValue('answers');
    // DM applicant
    try {
      await interaction.user.send({ content: `Thanks for applying to **${appName}**. Your answers:

${answers}` });
    } catch(e){ /* ignore DM failures */ }
    // Post to review channel if configured
    if (app.reviewChannelId) {
      const guild = interaction.client.guilds.cache.get(app.guildId);
      if (guild) {
        const ch = guild.channels.cache.get(app.reviewChannelId);
        if (ch) {
          ch.send({ content: `New application for **${appName}** from <@${interaction.user.id}>:\n\n${answers}` }).catch(()=>{});
        }
      }
    }
    await interaction.reply({ content: 'Application submitted! Check your DMs.', ephemeral: true });
  },
  // admin helpers
  createApplication(guildId, name){
    if (!store.applications[name]) store.applications[name] = { guildId, name, reviewChannelId: null };
    save();
  },
  setReviewChannel(appName, channelId){
    if (!store.applications[appName]) return false;
    store.applications[appName].reviewChannelId = channelId;
    save();
    return true;
  },
  addApplicationToMessage(appName, message){
    // no-op placeholder
  },
  listApplications(guildId){
    return Object.values(store.applications).filter(a => a.guildId === guildId);
  }
};
