const fs = require('fs');
const { Client, Intents, Collection } = require('discord.js');
const client = new Client({
	intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES,
	Intents.FLAGS.GUILD_VOICE_STATES, Intents.FLAGS.GUILD_MESSAGE_REACTIONS]
});
require('dotenv').config();
const token = process.env.TOKEN
const Util = require('./modules/util');
client.db = require('./modules/database')
client.servers = {}

client.MB = {}
client.util = new Util()

client.commands = new Collection();
const commandFolders = fs.readdirSync('./commands');
for (const folder of commandFolders) {
	const commandFiles = fs.readdirSync(`./commands/${folder}`).filter(file => file.endsWith('.js'));
	for (const file of commandFiles) {
		const command = require(`./commands/${folder}/${file}`);
		client.commands.set(command.name, command);
	}
}

client.once('ready', () => { console.log('Ready!') });

client.on('messageCreate', async (message) => {
	try {
		let prefix = process.env.PREFIX;
		if (client.servers[`${message.guild.id}`])
			prefix = client.servers[`${message.guild.id}`].prefix
		else {
			await client.db.addServer(message.guild.id, message.guild.name)
			client.servers[`${message.guild.id}`] = await client.db.getServer(message.guild.id)
		}

		if (!message.content.startsWith(prefix) || message.author.bot) return;
		const args = message.content.slice(prefix.length).trim().split(/ +/);
		const commandName = args.shift().toLowerCase();
		const command = client.commands.get(commandName)
			|| client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

		if (!command) return;

		command.execute(message, args);
	} catch (e) {
		console.log(e)
	}

});


async function start() {
	try {
		await client.db.connect()
		console.log("client connected");
		client.servers = await client.db.getServers()
		await client.login(token)
	} catch (e) {
		console.log(e)
	}
}

start()

