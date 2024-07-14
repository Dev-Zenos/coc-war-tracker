const { SlashCommandBuilder } = require('discord.js');
const warSchema = require('./../models/wars');

module.exports = {
    data: new SlashCommandBuilder().setName('war_list').setDescription('Lists all the war data, The bot has saved'),
    run: async({ interaction }) => {
        await interaction.deferReply();

        let query = {
            clan_tag: process.env.CLAN_TAG,
        }
        let result = await warSchema.find(query);
        if(result.length == 0){
            await interaction.editReply("No war data found for the clan tag: " + process.env.CLAN_TAG);
            return;
        }
        else{
            let message = "All the wars the bot has saved: \n" + "`";
            let counter = 1;
            for(const war of result){
                message += (counter + ".  Opponent Clan Tag: " + war.opponent_clan_tag + "\n");
                message += "    Start Time: " + war.timestamp + "\n";
                counter++;
                
            }
            message += "`";
            await interaction.editReply(message);
        }
    },
}