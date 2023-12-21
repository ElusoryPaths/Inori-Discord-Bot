function convertToTime(seconds) {
    let secs = seconds % 60;
    let mins = Math.floor((seconds % 3600) / 60)
    let hrs = Math.floor(seconds / 3600)
    let time = `${showTime(hrs)}:${showTime(mins)}:${showTime(secs)}`
    return time
}

function showTime(type) {
    if (type < 10) return "0" + type
    else return type
}

module.exports = {
    name: "nowplaying",
    aliases: ['np'],
    description: 'show song currently playing',
    execute(message, args) {
        
        if (!message.client.MB[message.guild.id]?.queue.length) {
            let embed = message.client.util.createEmbed({description: `Nothing is playing`});
            return message.channel.send({embeds: [embed]})
        }
        
        let embed = message.client.util.createEmbed({
            title: `Now playing: ${message.client.MB[message.guild.id].queue[0].name}`,
            description: `${convertToTime(Math.ceil(message.client.MB[message.guild.id].player.state.resource.playbackDuration/1000))}/${convertToTime(message.client.MB[message.guild.id].queue[0].duration)}`
        });

        message.channel.send({embeds: [embed]})
    }
}