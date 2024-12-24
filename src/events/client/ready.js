const { ActivityType } = require("discord.js");

module.exports = {
    name: "ready",
    once: true,
    async execute(client) {
        client.user.setPresence({
            activities: [
                {
                    type: ActivityType.Listening,
                    name: "Empty7 - pour le gang",
                },
            ],
            status: "Online",
        });
        console.log(`${client.user.tag} est connecté`);
    },
};
