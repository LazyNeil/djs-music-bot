require('dotenv').config({ path: '../.env' })
const fs = require('fs')
const Discord = require('discord.js')
const { Routes } = require('discord.js')
const { REST } = require('@discordjs/rest')
const { Player } = require('discord-player')
const { EmbedBuilder } = require('@discordjs/builders')

const TOKEN = process.env.TOKEN
const APP_ID = process.env.APP_ID
const GUILD_ID = process.env.GUILD_ID
const LOAD_COMMANDS = process.argv[2] == 'load'

const installCommands = (commands) => {
    const rest = new REST({ version: "10" }).setToken(TOKEN)
    console.log('Installing commands on the guild.')

    rest.put(Routes.applicationGuildCommands(APP_ID, GUILD_ID), { body: commands })
        .then(() => {
            console.log('The process sucessfully installed all commands on the guild.')
            process.exit(0)
        })
        .catch((err) => {
            if (err) {
                console.log(err)
                process.exit(1)
            }
        })
}

let commands = []

const client = new Discord.Client({
    intents: [
        'Guilds',
        'GuildVoiceStates'
    ]
})

client.scommands = new Discord.Collection()
client.player = new Player(client, {
    ytdlOptions: {
        quality: 'highestaudio',
        highWaterMark: 1 << 25
    }
})

const slashCommands = fs.readdirSync('./commands').filter(file => file.endsWith('.js'))
for (const file of slashCommands) {
    const cmd = require(`./commands/${file}`)
    client.scommands.set(cmd.data.name, cmd)
    if (LOAD_COMMANDS) commands.push(cmd.data.toJSON())
}
if (LOAD_COMMANDS) installCommands(commands)

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}`)
})

client.on('interactionCreate', (interaction) => {
    async function commandHandler() {
        if (!interaction.isCommand) return

        const userCommand = client.scommands.get(interaction.commandName)
        if (!userCommand) interaction.reply('Invalid command')

        await interaction.deferReply()
        await userCommand.run({ client, interaction })
    }

    commandHandler()
})

client.player.on('trackEnd', (queue, track) => {
    const channel = queue.messageChannel
    const message = queue.guild.channels.cache.get(channel)
    const newSong = queue.tracks[0]

    if (!queue.tracks.length) {
        console.log(queue.metadata)
        message.send({
            embeds: [new EmbedBuilder().setDescription('The queue has finished!')]
        })
        return
    }

    message.send({
        embeds: [new EmbedBuilder()
            .setDescription(`[${track.title}](${track.url}) ended.\n\n**Now playing:**\n[${newSong.title}](${newSong.url})`)
            .setFooter({ text: `Duration: ${newSong.duration}` })
            .setThumbnail(newSong.thumbnail)]
    })
})

client.login(TOKEN)
