const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder().setName('ping').setDescription('Get the bot latency.'),
    run: async({ interaction, client }) => {
        await interaction.deferReply();

        const reply = await interaction.fetchReply();

        const ping = reply.createdTimestamp - interaction.createdTimestamp;

        interaction.editReply(`Pong! Bot Latency: ${ping}ms | API Latency: ${client.ws.ping}ms`);
    },Globalcooldown_60s: true,
}