module.exports = {
	name: 'ping',
	description: 'Ping!',
	usage: '',
	execute(message, args) {
		let user = message.client.util.getUserFromMention(message.client, args[0])
		if (user.id == 276488541259694081 || user.id == 160145629916430337) return
		let numPings = 0;
		let maxPings = parseInt(args[1]) || 1
		let interval = parseInt(args[2])*1000 || 1000

		let pinger = setInterval(() => {
			message.channel.send(`${user.toString()}`)
			numPings++;
			if (numPings >= maxPings || numPings >= 20) clearInterval(pinger)
		}, interval)
	}
};