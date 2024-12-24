const Guild = require("../../schemas/guild");
const { SlashCommandBuilder } = require("discord.js");
const mongoose = require("mongoose");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("server")
        .setDescription("Enregistrer le serv dans la BDD !"),
    async execute(interaction, client) {
        // Vérification du rôle de Modération ->

        if (
            !interaction.member.roles.cache.some(
                (role) => role.id === "1320777165557600388"
            )
        ) {
            interaction.reply({
                content:
                    "Désolé, seuls les `modérateurs` peuvent utiliser cette commande !",
                ephemeral: true,
            });
            return;
        }

        let guildProfile = await Guild.findOne({
            guildId: interaction.guild.id,
        });
        if (!guildProfile) {
            guildProfile = await new Guild({
                _id: new mongoose.Types.ObjectId(),
                guildId: interaction.guild.id,
                guildName: interaction.guild.name,
                guildIcon: interaction.guild.iconURL()
                    ? interaction.guild.iconURL()
                    : "None",
            });

            await guildProfile.save().catch(console.error);
            await interaction.reply({
                content: `✅ Serveur enregistré en tant que : **${guildProfile.guildName}**`,
            });
            console.log(guildProfile);
        } else {
            await interaction.reply("*Serveur déjà enregistré chef !*");
        }
        console.log(guildProfile);
    },
};
