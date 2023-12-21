

module.exports = {
    name: "disconnect",
    aliases: ['dc'],
    description: 'disconnect',
    execute(message, args) {
        if (message.client.MB[message.guild.id]) {
            message.client.MB[message.guild.id].stopPlayer()
            delete message.client.MB[message.guild.id]
        }
    }
} 