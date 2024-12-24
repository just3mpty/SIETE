const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { updateScoreboard } = require("./scoreboard");
const blindtest = require("./blindtest.json");

// RETRAIT DES ACCENTS
function normalizeAnswer(answer) {
    const accents = "ÀÁÂÃÄÅàáâãäåÒÓÔÕÖØòóôõöøÈÉÊËèéêëÇçÌÍÎÏìíîïÙÚÛÜùúûüÑñ";
    const without = "AAAAAAaaaaaaOOOOOOooooooEEEEeeeeCcIIIIiiiiUUUUuuuuNn";
    const normalizedAnswer = answer
        .split("")
        .map((char) => {
            const index = accents.indexOf(char);
            return index !== -1 ? without[index] : char;
        })
        .join("")
        .toLowerCase()
        .replace(/\s+/g, "");

    return normalizedAnswer;
}

// COMMANDE
module.exports = {
    data: new SlashCommandBuilder()
        .setName("blindtest")
        .setDescription("Blindtest Empty7"),

    async execute(interaction) {
        await interaction.deferReply();

        // VERIFICATION DES ROLES
        const MOD = "1320777165557600388";

        const allowedRoles = [MOD];
        const userRole = interaction.member.roles.cache;
        const isAllowed = userRole.some((role) =>
            allowedRoles.includes(role.id)
        );

        if (!isAllowed) {
            interaction.editReply({
                content:
                    "Désolé, seul un *`MODERATEUR`* peut utiliser cette commande !",
                ephemeral: true,
            });
            return;
        }

        // QUESTION
        const item = blindtest[Math.floor(Math.random() * blindtest.length)];
        const questionEmbed = new EmbedBuilder()
            .setTitle("De quel morceau provient cette punchline ?")
            .setDescription(`${item.question} 🎶`)
            .setColor(0x0a0a0a);
        const timesUpEmbed = new EmbedBuilder()
            .setTitle("Temps écoulé !")
            .setDescription(`La réponse était : **${item.final}**`)
            .setColor(0xec2b2b);
        const congratsEmbed = new EmbedBuilder()
            .addFields({
                name: "La réponse était :",
                value: `**${item.final}**`,
            })
            .setColor(0x65dc65);

        // FILTRE DES MESSAGES
        const filter = (response) =>
            item.answers.some(
                (answer) =>
                    normalizeAnswer(answer) ===
                    normalizeAnswer(response.content)
            );

        await interaction.editReply({ embeds: [questionEmbed] });

        // EMBED VAINQUEUR
        try {
            const collected = await interaction.channel.awaitMessages({
                filter,
                max: 1,
                time: 30000,
                errors: ["time"],
            });

            const winner = collected.first().author;
            if (filter(collected.first())) {
                congratsEmbed
                    .setTitle("Trouvé !")
                    .setDescription(`Félicitations à **${winner}**`)
                    .setThumbnail(winner.displayAvatarURL());
                await interaction.followUp({ embeds: [congratsEmbed] });

                // Mise à jour du score
                updateScoreboard(winner.username, 1);
            }
        } catch (error) {
            // Gestion du temps écoulé
            await interaction.followUp({ embeds: [timesUpEmbed] });
        }
    },
};
