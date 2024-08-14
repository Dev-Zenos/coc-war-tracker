const { SlashCommandBuilder } = require('discord.js');
const warSchema = require('./../models/wars');
const MemberSchema = require('./../models/war_data');
const { GoogleSpreadsheet } =  require('google-spreadsheet');
const {JWT} = require('google-auth-library');
const { parse } = require('dotenv');
const fs = require('fs');
const { disabled } = require('./update_dono');

var serviceAccountAuth;
var doc;
var sheetIndex = 4;
var seperator = 17;


module.exports = {
    data: new SlashCommandBuilder().setName('cwl_list_permanent').setDescription('Permanently Shows, People eligible for cwl in Pro Rebels :D'), 
    run: async({ interaction }) => {
        await interaction.deferReply();
        await initSheet();
        const sheet = doc.sheetsByIndex[sheetIndex];
        const rows = await sheet.getRows(); // can pass in { limit, offset }
        //console.log(rows.length);

        let scores = [];
        let names = [];
        const nameWidth = 16; // adjust as needed
        const warScoreWidth = 6; // adjust as needed
        const donosScoreWidth = 7; // adjust as needed
        const totalScoreWidth = 8; // adjust as needed
        const Avg_TarWidth = 9;
        for (const row of rows) {
            let name = row.get('Name').padEnd(nameWidth, ' ');
            let warScore = parseInt(row.get('Total war score')).toString().padEnd(warScoreWidth, ' ');
            let donosScore = parseInt(row.get('Donos score')).toString().padEnd(donosScoreWidth, ' ');
            let totalScore = row.get('Total score');
            //console.log(totalScore);
            if(!isNaN(parseInt(totalScore))){
                let nameTag = row.get('Player tag');
                const query = { tag: nameTag, timestamp: { $regex: reg } };
                let member = await MemberSchema.find(query);
                let attack = 0;
                let counter = 0;
                for(const mem of member){
                    for(const atk of mem.attacks){
                        attack += atk.opponentMapPosition;
                        counter++;
                    }
                }
                let avgTar = attack/counter;
                avgTar = (avgTar).toFixed(2).toString().padEnd(Avg_TarWidth, ' ');
                names.push(`${name}${warScore}${donosScore}${avgTar}`);
                //console.log(parseInt(totalScore));
                scores.push(parseInt(totalScore));
            }
        }
        console.log(scores.length);
        console.log(names.length);
        const { sortedScores, sortedNames } = sortScoresAndNames(scores, names);
  
        //loop through rows
        let arr = [];
        let startStr = "No. Name             War   Dono   Avg_Tar  Total\n";
        let message = "```"+startStr;
        let counter = 0;
        for (const row of sortedNames) {
            let formattedScore = sortedScores[counter].toString().padEnd(totalScoreWidth, ' ');
            let rank = (counter + 1).toString().padEnd(4, ' ');
            //console.log(sortedScores[counter]);
            message += rank + row + formattedScore + "\n";
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
        await interaction.editReply("Here are the people eligible for cwl: ");
        const channel = interaction.channel.id;
        const messageArr = [];
        for(const msg of arr){
            const messages = await interaction.channel.send(msg);
            messageArr.push(messages.id);
        }
        //console.log(messageArr);
        //console.log(channel);
        await updateConfig(channel, messageArr);
        //await interaction.channel.send(message);
        

    },
    Globalcooldown_5s: true,
}

async function updateConfig(channel, messageArr){
    fs.readFile('config.json', 'utf8', async(err, data) => {
        if (err) {
            console.error('Error reading config.json:', err);
            return;
        }
        const configObject = JSON.parse(data);
        configObject.CWLchannels.push({id: channel, messages: messageArr});

        fs.writeFile('config.json', JSON.stringify(configObject, null, 2), (err) => {
            if (err) {
                console.error('Error writing config.json:', err);
                return;
            }
            console.log('Config updated');
        });
    });
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