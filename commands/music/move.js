

module.exports = {
    name: "move",
    aliases: [],
    description: 'move song in que',
    usage: `move <song> to <position>`,
    execute(message, args) {
        try {
            if (args.length != 3) return
            if (message.member.voice.channel && message.client.MB[message.guild.id]) {
                if (parseInt(args[0]) && parseInt(args[2])) {
                    message.client.MB[message.guild.id].move(parseInt(args[0]), parseInt(args[2]))
                }
            }
        } catch (err) { 
            console.log(err)
            //message.channel.send("")
        }
    }
}