

module.exports = {
    name: "goto",
    aliases: ['seek'],
    description: 'go to specificed time in song WIP',
    execute(message, args) {
        try {
            if (!args.length) return
            if (message.member.voice.channel && message.client.MB[message.guild.id]) {
                    message.client.MB[message.guild.id].seek(args[0])
            }
        } catch (err) { 
            console.log(err)
            //message.channel.send("")
        }
    }
}