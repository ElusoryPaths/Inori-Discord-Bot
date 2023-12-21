const fs = require('fs');

module.exports = {
    name: 'reload',
    aliases: ['r'],
    description: 'Reloads a command',

    execute(message, args) {
        
        if (!args.length) {
            try {
                const moduleFiles = fs.readdirSync('./modules').filter(file => file.endsWith('.js'));
                for (const file of moduleFiles) {
                    delete require.cache[require.resolve(`../../modules/${file}`)];
                }
                const commandFolders = fs.readdirSync(`./commands`);
                for (const folder of commandFolders) {
                    const commandFiles = fs.readdirSync(`./commands/${folder}`).filter(file => file.endsWith('.js'));
                    for (const file of commandFiles) {
                        delete require.cache[require.resolve(`../${folder}/${file}`)];
                        const command = require(`../../commands/${folder}/${file}`);
                        message.client.commands.set(command.name, command);
                    }
                }
                message.channel.send(`commands reloaded`)
            } catch (error) {
                
            }
        } else {
            const commandFolders = fs.readdirSync(`./commands`);
            const commandName = args[0].toLowerCase();
            const command = message.client.commands.get(commandName) ||
                message.client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

            if (!command) {
                return message.channel.send(`There is no command with name or alias \`${commandName}\`, ${message.author}!`);
            }

            const folderName = commandFolders.find(folder => fs.readdirSync(`./commands/${folder}`).includes(`${command.name}.js`));
            delete require.cache[require.resolve(`../${folderName}/${command.name}.js`)];

            try {
                const newCommand = require(`../${folderName}/${command.name}.js`);
                message.client.commands.set(newCommand.name, newCommand);
                message.channel.send(`Command \`${newCommand.name}\` was reloaded!`).then(msg => msg.delete());
            } catch (error) {
                console.error(error);
                message.channel.send(`There was an error while reloading a command \`${command.name}\`:\n\`${error.message}\``);
            }
        }
    }
};