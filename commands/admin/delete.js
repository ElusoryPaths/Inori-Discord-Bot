const delPerm = require('../../config/perms.json').deletePerm;


let deleteMessage = (message, numToDelete, uid) => {
    return new Promise((resolve, reject) => {
        message.channel.messages.fetch({ limit: 100 })
            .then((messages) => {
                let messagesToBeDeleted = []
                messages.filter(m => m.author.id === uid).forEach(msg => {
                    if (messagesToBeDeleted.length < numToDelete && msg.id != message.id) {
                        messagesToBeDeleted.push(msg);
                    }
                });
                messagesToBeDeleted.push(message)
                let len = messagesToBeDeleted.length - 1
                message.channel.bulkDelete(messagesToBeDeleted)
                    .then(message.channel.send(`Cleared ${len} messages`)
                        .then(msg => { setTimeout(() => { 
                            msg.delete() 
                            resolve()
                        }, 2000) })
                        .catch(error => { reject(error) }))
                    .catch(error => { reject(error) })
            });
    })
}

let deleteAllMessage = (message, numToDelete) => {
    return new Promise((resolve, reject) => {
        if (numToDelete > 100) numToDelete = 100;
        message.channel.messages.fetch({ limit: numToDelete })
            .then((messages) => {
                message.channel.bulkDelete(messages)
                    .then(message.channel.send(`Cleared ${numToDelete} messages`)
                        .then(msg => { setTimeout(() => { 
                            msg.delete() 
                            resolve()
                        }, 2000) })
                        .catch(error => { reject(error) }))
                    .catch(error => { reject(error) })
            });
    })
}

module.exports = {
    name: 'delete',
    aliases: ['d'],
    description: 'delete messages',
    async execute(message, args) {
        try {
            if (args.length == 1 && !isNaN(args[0])) {
                await deleteMessage(message, parseInt(args[0]), message.author.id);
            }
            else if (args.length == 2 && !isNaN(args[0]) && delPerm.includes(parseInt(message.author.id))) {
                let user = message.client.util.getUserFromMention(message.client, args[1])
                if (user) await deleteMessage(message, parseInt(args[0]), user.id);
                else return message.channel.send("Error: cannot find user")
            }
            else if (args.length == 2 && args[0] == "purge" && !isNaN(args[1]) && delPerm.includes(parseInt(message.author.id))) {
                deleteAllMessage(message, parseInt(args[1]));
            }
        } catch (e) {
            console.log(e)
        }
        
    }

};