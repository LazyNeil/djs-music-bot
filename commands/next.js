const { SlashCommandBuilder } = require("@discordjs/builders")

module.exports = {
	data: new SlashCommandBuilder().setName("next").setDescription("Skips the current song"),
	run: async ({ client, interaction }) => {
		const queue = client.player.getQueue(interaction.guild.id)
		if (!queue) return await interaction.editReply("There are no songs in the queue")
		queue.skip()
        await interaction.editReply(`<@${interaction.user.id}> skipped the song.`)
	},
}