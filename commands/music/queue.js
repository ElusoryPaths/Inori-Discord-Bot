const logger = require("../../logger");

const emojis = ["⏮️", "◀️", "▶️", "⏭️"]

async function createCollecter(message, embeds, pageNum = 0) {
    try {
        const filter = (reaction, user) => {
            return emojis.includes(reaction.emoji.name) && user.id != message.client.user.id
        }
        let page = pageNum
        const collector = await message.createReactionCollector({ filter, time: 150000 });
        collector.on('collect', (reaction, user) => {
            let outcomes = [0, page - 1, page + 1, embeds.length - 1]
            for (i in emojis) {
                if (reaction.emoji.name == emojis[i]) {
                    page = outcomes[i]
                    break;
                }
            }
            if (page < 0) page = 0
            else if (page > embeds.length - 1) page = embeds.length - 1
            reaction.users.remove(user.id)
            const emb = embeds[page]
            logger.info({ page, emb}, 'what went wrong here?')
            message.edit({ embeds: [embeds[page]] })
        })
    } catch (err) {
        console.error(err)
    }
}

async function setAwaitReactions(message, embeds) {
    try {
        if (embeds.length > 1) {
            await message.react(emojis[0])
            await message.react(emojis[1])
            await message.react(emojis[2])
            await message.react(emojis[3])
            await createCollecter(message, embeds, 0)
        }
    } catch (err) {
        console.error(err)
    }
}

module.exports = {
    name: "queue",
    aliases: ['q'],
    description: 'show songs',
    execute(message, args) {
        const Util = message.client.util
        const bot = message.client.MB[message.guild.id]
        if (!bot ||
            bot.queue.length == 0) {
            let emb = Util.createEmbed({ title: "Songs in Queue", description: "No Songs in Queue" })
            return message.channel.send({ embeds: [emb] })
        }

        let songs = ""
        let msgEmbs = []
        let queue = bot.queue

        for (song in queue) {
            songs += `${parseInt(song) + 1}: \`${queue[song].name}\`\n`

            if ((parseInt(song) + 1) % 10 == 0 || song == queue.length - 1) {
                msgEmbs.push(Util.createEmbed({ title: "Songs in Queue", description: songs }))
                songs = ""
            }
        }
        for (page in msgEmbs) {
            msgEmbs[page].setFooter({ text: `Page ${parseInt(page) + 1} | ${msgEmbs.length}` })
        }
        let pageNum = 0
        if (args.length == 1) pageNum = parseInt(args[0]) ? parseInt(args[0]) : 0;
        message.channel.send({ embeds: [msgEmbs[0]] }).then(msg => setAwaitReactions(msg, msgEmbs, pageNum))
    }
}