

module.exports = {
    name: "repeat",
    aliases: ['loop'],
    description: 'repeat the queue',
    execute(message, args) {
        try {
            if (message.member.voice.channel && message.client.MB[message.guild.id]) {
                if (message.client.MB[message.guild.id].loop) {
                    message.client.MB[message.guild.id].loop()
                    message.channel.send("Turing off loop")
                } else {
                    message.client.MB[message.guild.id].loop()
                    message.channel.send("Repeating current queue")
                }
               
            }
        } catch (err) { 
            console.log(err)
            //message.channel.send("")
        }
    }
}