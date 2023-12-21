const {AudioPlayerStatus} = require('@discordjs/voice');

module.exports = {
    name: "debug",
    aliases: ['db'],
    description: 'cmd debug',
    async execute(message, args) {
        try {
        //console.log(message.client.resource)
        //console.log(message.client.MB[message.guild.id].getStatus())
        //console.log(message.client.MB[message.guild.id].player.state)
        }
        catch (err) {
            console.log(err)
        }

    }
}