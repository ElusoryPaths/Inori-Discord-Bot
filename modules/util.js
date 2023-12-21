const { MessageEmbed, MessageMentions: { USERS_PATTERN } } = require("discord.js");
const fs = require('fs')

class Util {
    createEmbed({ title = "", description = "Default", footer = "" }) {
        return new MessageEmbed()
            .setColor('#0099ff')
            .setTitle(title)
            .setDescription(description)
            .setFooter({ text: footer });
    }
    getUserFromMention(client, mention) {
        const matches = mention.matchAll(USERS_PATTERN).next().value;
        if (!matches) return;
        const id = matches[1];
        return client.users.cache.get(id);
    }
    FindUserInMention(client, mention, id) {
        const matches = mention.match(USERS_PATTERN)
        if (!matches) return;
        for (let i of matches) {
            if (`<@${id}>` == i) return true
        }
        return false
    }
    createCommand(folder = "basic", name, fn) {
        fs.writeFileSync(`./commands/${basic}/${name}`, fn)
    }
    deleteMessage(message, numToDelete, uid) {
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
}


module.exports = Util
