const fs = require('fs');

module.exports = {
    name: 'help',
    description: 'List all of my commands or info about a specific command.',
    aliases: ['commands'],
    usage: '[command name]',
    execute(message, args) {
        const client = message.client
        const prefix = client.servers[`${message.guild.id}`].prefix
        const { commands } = message.client;
        const dataEmbed = client.util.createEmbed({title: 'Command List'})

        const commandFolders = fs.readdirSync('./commands').filter(file => file != "admin");
        const commandArr = {};
        let desc = "";
        let len = 0;
        dataEmbed.setFooter(`\nYou can send \`${prefix}help [command name]\` to get info on a specific command!`);

        for (const folder of commandFolders) {
            commandArr[`${folder}`] = fs.readdirSync(`./commands/${folder}`).filter(file => file.endsWith('.js'))
        }

        function addSection(section) {
            len = 50 - section.length
            desc += `${'-'.repeat(len / 2)} ${section} ${'-'.repeat(len / 2)}\n`;
            commandArr[section].forEach(cmd => {
                const command = require(`../../commands/${section}/${cmd}`);
                if (command.name) desc += `**${command.name}**: \`${command.description}\`\n`;
            })
            desc += `\n`;
        }

        if (!args.length) {
            Object.keys(commandArr).forEach(arr => {
                addSection(arr)
            })
            dataEmbed.setDescription(desc);
            return message.channel.send({embeds: [dataEmbed]})
        }
       
        if (Object.keys(commandArr).includes(args[0])) {
            addSection(args[0]);
            dataEmbed.setDescription(desc);
            return message.channel.send({embeds: [dataEmbed]})
        }
        
        const name = args[0].toLowerCase();
        const command = commands.get(name) || commands.find(c => c.aliases && c.aliases.includes(name));

        if (!command) {
            return message.reply('that\'s not a valid command!');
        }

        desc += (`**Name:** ${command.name}\n`);

        if (command.aliases) desc += (`**Aliases:** ${command.aliases.join(', ')}\n`);
        if (command.description) desc += (`**Description:** ${command.description}\n`);
        if (command.usage) desc += (`**Usage:** ${prefix}${command.name} ${command.usage}\n`);
        if (command.cooldown) desc += (`**Cooldown:** ${command.cooldown} second(s)\n`);

        message.channel.send(desc);
    },
};