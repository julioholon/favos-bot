const { SlashCommandBuilder, ChannelType, PermissionsBitField, PermissionFlagsBits } = require('discord.js');
const db = require("quick.db");
const { shuffle, chunk } = require('../utils.js')

let groups = db.get('groups') || [];

module.exports = {
	data: new SlashCommandBuilder()
		.setName('removegroups')
		.setDescription('Remove Favos breakout groups')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
  
	async execute(interaction) {
    // find or create Favos category
    let cat = await interaction.guild.channels.cache.find(channel => channel.type == ChannelType.GuildCategory && channel.name == "Favos groups")
    if (!cat) {
      interaction.reply(`Favos category not present, unable to remove.`);
    }

    interaction.guild.channels.cache.filter(channel => channel.parent == cat.id).forEach(channel => {
      channel.delete();
    })
    
    // Empties the groups array at Quick.db storage
    groups = []
    db.set('groups', groups);
    
    interaction.reply(`Groups removed!`);

	},
};

