const fs = require('fs');

module.exports = {
    name: "prefix",
    aliases: ['pf'],
    description: "set/show prefix",
    usage: `prefix (to show current prefix)\n
            prefix <new prefix> (to set new prefix)`,
    execute(message, args) {
        
        if (args.length == 0) {
            prefix = message.client.servers[`${message.guild.id}`].prefix
            message.channel.send("Server prefix is: " + prefix)
        }
        else if (args.length == 1) {
            message.client.db.setPrefix(message.guild.id, args[0])
            .then(msg => {
                message.channel.send(msg)
                message.client.db.getPrefix(message.guild.id)
                .then(msg => {
                    message.client.servers[`${message.guild.id}`].prefix = msg 
                }).catch(err => message.channel.send(err))
            })
            .catch(err => message.channel.send(err)) 
        }
    }
}