const logger = require("../../logger")

module.exports = {
    name: "volume",
    aliases: ['v'],
    description: 'set volume between 0 and 2',
    async execute(message, args) {
        let newVol = parseFloat(args[0])
        if (newVol >= 0 &&  newVol <= 2) {
            message.client.MB[message.guild.id].setVolume(newVol)
        } else {
            console.log(message.client.MB[message.guild.id]?.volume)
        }
    }
}