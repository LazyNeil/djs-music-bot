const { SlashCommandBuilder } = require('@discordjs/builders')
const { EmbedBuilder } = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder()
    .setName('stop')
    .setDescription('Stops the music bot.'),
    run: async ({client, interaction}) => {
        const queue = client.player.getQueue(interaction.guildId)

        if(!queue) return await interaction.editReply('There are no songs in the queue.')

        queue.destroy()
        await interaction.editReply('Music bot stopped!')
    }   
}