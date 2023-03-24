const { SlashCommandBuilder, ChannelType, PermissionsBitField, PermissionFlagsBits } = require('discord.js');
const db = require("quick.db");
const { shuffle, chunk } = require('../utils.js')

let groups = db.get('groups') || [];

module.exports = {
	data: new SlashCommandBuilder()
		.setName('regenerate')
		.setDescription('Regenerate groups split into breakout channels, with new members')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
  
	async execute(interaction) {
    // Get the list of members in the server
    const members = Array.from((await interaction.guild.members.fetch({ force: true })).values());
    
    // Get the list of members who are not in the current groups
    const missingMembers = members.filter(member => {
      for (const group of groups) {
        if (group.includes(member)) {
          return false;
        }
      }
      return true;
    });
    
    console.log(missingMembers)
    
    // Add the missing members to the current groups
    for (let i = 0; i < missingMembers.length; i++) {
      const member = missingMembers[i];
      const groupIndex = i % groups.length;
      groups[groupIndex].push(member);
    }
    
    // Update the private channels for each group
    for (let i = 0; i < groups.length; i++) {
      const groupName = `favos-group-${i + 1}`;
      const groupMembers = groups[i];
      const groupChannel = interaction.guild.channels.cache.find(channel => channel.name === groupName);
      
      if (!groupChannel) {
        continue;
      }
      
      // Update the channel permissions for the new group members
      groupMembers.forEach(member => {
        groupChannel.updateOverwrite(member, { VIEW_CHANNEL: true });
      });
      
      // Remove channel access for members who are no longer in the group
      groupChannel.permissionOverwrites.forEach(permission => {
        if (permission.type === 'member' && !groupMembers.includes(permission.id)) {
          groupChannel.permissionOverwrites.delete(permission.id);
        }
      });
    }

    // Store the groups array to Quick.db storage
    db.set('groups', groups);
    
    await interaction.reply('Groups regenerated!');

  }
};