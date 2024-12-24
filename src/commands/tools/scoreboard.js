const { EmbedBuilder, SlashCommandBuilder } = require("discord.js");
const Player = require("../../schemas/player");
const mongoose = require("mongoose");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("scoreboard")
        .setDescription("Tableau des scores du blindtest"),

    async execute(interaction, client) {
        await interaction.deferReply();

        try {
            let playerProfile = await Player.findOne({
                playerId: interaction.user.id,
            });

            if (!playerProfile) {
                playerProfile = new Player({
                    _id: new mongoose.Types.ObjectId(),
                    playerId: interaction.user.id,
                    playerName: interaction.user.username,
                    score: 0,
                });

                await playerProfile.save();
            }

            // Récupérer le top 4 des joueurs
            const players = await Player.find().sort({ score: -1 }).limit(4);

            if (players.length === 0) {
                await interaction.editReply({
                    content: "Aucun joueur dans la base de données ...",
                    ephemeral: true,
                });
                return;
            }

            // Construire l'embed des scores
            const scoreEmbed = new EmbedBuilder()
                .setTitle("Tableau des scores !")
                .setDescription("Voici le Top 4 des joueurs :")
                .setColor(0x0096c7)
                .setThumbnail(client.user.displayAvatarURL());

            players.forEach((player, index) => {
                const position = index + 1;
                const positionText =
                    position === 1
                        ? `1er : ${player.playerName} !`
                        : `${position}e. ${player.playerName}`;
                const value = `${player.score} points`;

                scoreEmbed.addFields({
                    name: positionText,
                    value,
                    inline: position !== 1,
                });
            });

            // Répondre avec l'embed
            await interaction.editReply({
                embeds: [scoreEmbed],
                ephemeral: false,
            });
        } catch (error) {
            console.error("Erreur dans la commande scoreboard :", error);
            await interaction.editReply({
                content:
                    "Une erreur est survenue lors de la récupération du tableau des scores.",
                ephemeral: true,
            });
        }
    },

    async updateScoreboard(playerName, points) {
        try {
            const player = await Player.findOneAndUpdate(
                { playerName },
                { $inc: { score: points } },
                { upsert: true, new: true }
            );

            console.log(
                `Score mis à jour pour ${player.playerName} : ${player.score}`
            );
        } catch (error) {
            console.error("Erreur lors de la mise à jour du score :", error);
        }
    },
};
