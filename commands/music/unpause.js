module.exports = {
    name: "unpause",
    aliases: [],
    description: 'unpause current song',
    execute(message, args) {
        if (message.client.MB[message.guild.id].player)
            message.client.MB[message.guild.id].pause(false)
    }
}