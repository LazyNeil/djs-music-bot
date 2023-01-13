const { SlashCommandBuilder } = require("@discordjs/builders")

module.exports = {
	data: new SlashCommandBuilder().setName("pause").setDescription("Pause the music"),
	run: async ({ client, interaction }) => {
		const queue = client.player.getQueue(interaction.guild.id)

		if (!queue) return await interaction.editReply("There are no songs in the queue")

		queue.setPaused(true)
        await interaction.editReply("Music has been paused! Use `/resume` to resume the music")
	},
}