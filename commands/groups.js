const { SlashCommandBuilder, ChannelType, PermissionsBitField, PermissionFlagsBits } = require('discord.js');
const db = require("quick.db");
const { shuffle, chunk } = require('../utils.js')

let groups = db.get('groups') || [];

module.exports = {
	data: new SlashCommandBuilder()
		.setName('groups')
		.setDescription('Splits server users into breakout groups')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
  	.addIntegerOption(option =>
			option
				.setName('size')
				.setDescription('Number of users to split')
				.setRequired(true)
        .setAutocomplete(true)
    ),
  
	async execute(interaction) {
    const groupSize = interaction.options.getInteger('size');;
    
    // Get the list of members in the server
    const members = await interaction.guild.members.fetch();

    // Shuffle the members randomly
    const shuffledMembers = shuffle(Array.from(members.values()));
    
    // Divide the members into groups
    groups = chunk(shuffledMembers, groupSize);
    
    // find or create Favos category
    let cat = await interaction.guild.channels.cache.find(channel => channel.type == ChannelType.GuildCategory && channel.name == "Favos groups")
    if (!cat) {
      cat = await interaction.guild.channels.create({
        name: "Favos groups",
        type: ChannelType.GuildCategory,
      });
    }
    
    // Create a private channel for each group
    for (let i = 0; i < groups.length; i++) {
      const groupName = `favos-group-${i + 1}`;
      const groupMembers = groups[i];
      
      interaction.guild.channels.create({
        name: groupName,
        type: ChannelType.GuildText,
        parent: cat.id,
        permissionOverwrites: [
          {
            id: interaction.guild.id,
            deny: [PermissionsBitField.Flags.ViewChannel],
          },
          ...groupMembers.map(user => ({
            id: user.id,
            allow: [PermissionsBitField.Flags.ViewChannel],
          })),
          {
            id: interaction.user.id,
            allow: [PermissionsBitField.Flags.ViewChannel],
          },
          {
            id: interaction.client.user.id,
            allow: [PermissionsBitField.Flags.ViewChannel],
          },
        ],
      });
    }

    // Store the groups array to Quick.db storage
    db.set('groups', groups);
    
    interaction.reply(`Groups of size ${groupSize} created!`);

	},
};

