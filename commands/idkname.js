const { SlashCommandBuilder } = require('discord.js');
const warSchema = require('./../models/wars');
const MemberSchema = require('./../models/war_data');
const { GoogleSpreadsheet } =  require('google-spreadsheet');
const {JWT} = require('google-auth-library');
const { parse } = require('dotenv');

var serviceAccountAuth;
var doc;
var sheetIndex = 1;
const reg = /Oct (1[0-9]|2[0-9]|3[01])/;


module.exports = {
    data: new SlashCommandBuilder()
        .setName('idkname')
        .setDescription('Gets your clan score!')
        .addStringOption(option => 
            option.setName('sortby')
                .setDescription('Sort by warscore or avg_stars or avg_tar')
                .setRequired(false)
                .addChoices(
                    { name: 'warscore', value: 'warscore' },
                    { name: 'avg_stars', value: 'avg_stars' },
                    { name: 'avg_tar', value: 'avg_tar' },
                )),
    run: async({ interaction }) => {
        await interaction.deferReply();
        const sortBy = interaction.options.getString('sortby') || 'warscore'; // Default to 'warscore', 
        await initSheet();
        const sheet = doc.sheetsByIndex[sheetIndex];
        const rows = await sheet.getRows(); // can pass in { limit, offset }

        let scores = [];
        let names = [];
        const nameWidth = 16; // adjust as needed
        const warScoreWidth = 8; // adjust as needed
        const Avg_TarWidth = 9;
        const Avg_Star = 10;
        for (const row of rows) {
            let name = row.get('Name').padEnd(nameWidth, ' ');
            let warScore = row.get('Total war score').toString().padEnd(warScoreWidth, ' ');
            //console.log(totalScore);
            if(!isNaN(parseInt(warScore))){
                let nameTag = row.get('Player tag');
                const query = { tag: nameTag, timestamp: { $regex: reg } };
                let member = await MemberSchema.find(query);
                //find all members after August 10th 
                
                let attack = 0;
                let stars = 0;
                let counter = 0;
                for(const mem of member){
                    for(const atk of mem.attacks){
                        attack += atk.opponentMapPosition;
                        stars += atk.stars;
                        counter++;
                    }
                }
                let avgTar = attack/counter;
                let avgStar = stars/counter;
                avgTar = (avgTar).toFixed(2).toString().padEnd(Avg_TarWidth, ' ');
                avgStar = (avgStar).toFixed(2).toString().padEnd(Avg_Star, ' ');
                names.push(`${name}${warScore}${avgStar}${avgTar}`);
                //console.log(parseInt(totalScore));
                if(sortBy === 'avg_stars'){
                    if(isNaN(parseFloat(avgStar))){
                        scores.push(0);
                    }
                    else
                        scores.push(parseFloat(avgStar));
                }
                else if(sortBy === 'avg_tar'){
                    if(isNaN(parseFloat(avgTar))){
                        scores.push(-100);
                    }
                    else
                        scores.push(-1 * parseFloat(avgTar));
                }
                else
                    scores.push(parseInt(warScore));
            }
        }
        const { sortedScores, sortedNames } = sortScoresAndNames(scores, names);
  
        //loop through rows
        let arr = [];
        let startStr = "No. Name            Score   Avg_Star  Avg_Tar\n";
        let message = "```"+startStr;
        let counter = 0;
        for (const row of sortedNames) {
            let rank = (counter + 1).toString().padEnd(4, ' ');
            //console.log(sortedScores[counter]);
            message += rank + row + "\n";
            if(message.length > 1800){
                message += "```";
                arr.push(message);
                message = "```";
            }
            counter++;
        }
        if(message.length > 3){
            message += "```";
            arr.push(message);
        }
        await interaction.editReply("Here is the clan score: ");
        for(const msg of arr){
            await interaction.channel.send(msg);
        }
        

    },
    Globalcooldown_5s: true,
}




function sortScoresAndNames(scores, names) {
    // Create an array of pairs (score, name)
    let pairedArray = scores.map((score, index) => [score, names[index]]);

    // Sort the paired array based on the score in descending order
    pairedArray.sort((a, b) => b[0] - a[0]);

    // Separate the paired array back into scores and names arrays
    let sortedScores = pairedArray.map(pair => pair[0]);
    let sortedNames = pairedArray.map(pair => pair[1]);

    return { sortedScores, sortedNames };
}

async function initSheet(){
    serviceAccountAuth = new JWT({
        // env var values here are copied from service account credentials generated by google
        // see "Authentication" section in docs for more info
        email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        keyFile: process.env.GOOGLE_PRIVATE_KEY,
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    doc = new GoogleSpreadsheet(process.env.SPREADSHEET_ID, serviceAccountAuth);
    await doc.loadInfo(); // loads document properties and worksheets
  
}