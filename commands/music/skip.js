module.exports = {
    name: "skip",
    aliases: ['s'],
    description: 'skip song currently playing',
    execute(message, args) {
        let song = message.client.MB[message.guild.id].skipSong()
        //if (song) message.channel.send(song.name)
    }
}