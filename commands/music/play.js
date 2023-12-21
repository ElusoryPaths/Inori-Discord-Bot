
const { joinVoiceChannel } = require('@discordjs/voice');
const musicBot = require('../../modules/musicBot');

module.exports = {
    name: "play",
    aliases: ['p'],
    description: 'play a song',
    async execute(message, args) {
        if (!args.length) return;
        try {
            let connection;
            if (message.member.voice.channel) {
                
                connection = joinVoiceChannel({
                    channelId: message.member.voice.channel.id,
                    guildId: message.guild.id,
                    adapterCreator: message.guild.voiceAdapterCreator,
                })
            }
            else {
                message.channel.send('User not in Voice Chat')
            }
            let search = args.join(" ")
            
            if (!message.client.MB[message.guild.id]) {
                message.client.MB[message.guild.id] = new musicBot(message)
            }
            await message.client.MB[message.guild.id].setPlayer()
            await message.client.MB[message.guild.id].addToQueue(search, message)
            await message.client.MB[message.guild.id].play()
        } catch (err) {
            console.log(err)
        }
    }
}