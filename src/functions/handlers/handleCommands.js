const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v9");
const fs = require("fs");
const { TOKEN, CLIENT_ID, GUILD_ID } = process.env;

const rest = new REST({ version: "9" }).setToken(TOKEN);

module.exports = (client) => {
    client.handleCommands = async () => {
        const commandFolders = fs.readdirSync(`./src/commands`);
        for (const folder of commandFolders) {
            const commandFiles = fs
                .readdirSync(`./src/commands/${folder}`)
                .filter((file) => file.endsWith(".js"));

            const { commands, commandArray } = client;
            for (const file of commandFiles) {
                const command = require(`../../commands/${folder}/${file}`);
                commands.set(command.data.name, command);
                commandArray.push(command.data.toJSON());
                console.log(
                    `Command : ${command.data.name} successfully handled ! <3`
                );
            }
        }

        try {
            await rest.put(
                Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
                { body: client.commandArray }
            );
            console.log("Application chargée !");
        } catch (error) {
            console.error(error);
        }
    };
};
