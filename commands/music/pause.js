module.exports = {
    name: "pause",
    aliases: [],
    description: 'pause current song',
    execute(message, args) {
        if (message.client.MB[message.guild.id].player)
            message.client.MB[message.guild.id].pause(true)
    }
}