module.exports = {
    name: "remove",
    aliases: ['rm'],
    description: 'remove song in queue',
    execute(message, args) {
        if(args.length > 0 && parseInt(args[0])) {
            message.client.MB[message.guild.id].removeSongInQueue(parseInt(args[0]))
        }
        if(args.length > 0 && args[0] == "all")
            message.client.MB[message.guild.id].resetQueue()
    }
}