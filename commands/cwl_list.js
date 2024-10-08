const { SlashCommandBuilder } = require('discord.js');
const warSchema = require('./../models/wars');
const MemberSchema = require('./../models/war_data');
const { GoogleSpreadsheet } =  require('google-spreadsheet');
const {JWT} = require('google-auth-library');
const { parse } = require('dotenv');
const { disabled } = require('./update_dono');

var serviceAccountAuth;
var doc;
var sheetIndex = 6;
var seperator = 17;
const reg = /Oct (1[0-9]|2[0-9]|3[01])/;


module.exports = {
    data: new SlashCommandBuilder().setName('cwl_list').setDescription('People eligible for cwl in Pro Rebels :D'), 
    run: async({ interaction }) => {
        await interaction.deferReply();
        await initSheet();
        const sheet = doc.sheetsByIndex[sheetIndex];
        const rows = await sheet.getRows(); // can pass in { limit, offset }
        //console.log(rows.length);

        let scores = [];
        let names = [];
        const nameWidth = 16; // adjust as needed
        const warScoreWidth = 8; // adjust as needed
        const Avg_TarWidth = 9;
        const Avg_Star = 10;
        for (const row of rows) {
            let name = ("" + row.get('Name')).padEnd(nameWidth, ' ');
            let warScore = ("" + row.get('Total war score')).toString().padEnd(warScoreWidth, ' ');
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
            if(counter + 1 == seperator)
                message += "-------------------------------------\n";
            counter++;
        }
        if(message.length > 3){
            message += "```";
            arr.push(message);
        }
        //message += "```";
        await interaction.editReply("Here are the people eligible for cwl: ");
        for(const msg of arr){
            await interaction.channel.send(msg);
        }
        //await interaction.channel.send(message);
        

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