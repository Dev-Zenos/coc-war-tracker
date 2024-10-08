const { SlashCommandBuilder } = require('discord.js');
const warSchema = require('./../models/wars');
const MemberSchema = require('./../models/war_data');
const { GoogleSpreadsheet } =  require('google-spreadsheet');
const {JWT} = require('google-auth-library');

var serviceAccountAuth;
var doc;
var sheetIndex = 1;


module.exports = {
    data: new SlashCommandBuilder().setName('update_sheet').setDescription('Update the google sheet with the latest war data')
        .addStringOption(option => option.setName('opponent_clan_tag')
            .setDescription('tag of the opponent clan, please make sure they are in the formart: #xxxxx')
            .setRequired(true))
        .addStringOption(option => option.setName('timestamp')
            .setDescription('time stamp of war, optional do not add anything here unless bot tells you or you feel like it')
            .setRequired(false)), 
    run: async({ interaction }) => {
        opponent_clan_tag = interaction.options.getString('opponent_clan_tag');
        await interaction.deferReply();
        const query = {
            opponent_clan_tag: opponent_clan_tag,
        }
        let result = await warSchema.find(query);
        if(result.length == 0){
            await interaction.editReply("No war data found for the opponent clan tag: " + opponent_clan_tag);
            return;
        }
        else if(result.length > 1){
            await interaction.editReply("Multiple wars found for the opponent clan tag: " + opponent_clan_tag);
            return;
        }
        else{
            let memberCount = await updateSheet({ opponent_clan_tag });
            await interaction.editReply("Updated sheet for " + memberCount + " players, the opponent clan tag was: " + opponent_clan_tag + "\n If it did not work, please use /help");
        }
        

        //await interaction.editReply("Work in Progress...")
    },
    devOnly: true,
    Globalcooldown_60s: true,
}

async function updateSheet(updateData){
    await initSheet();
    const sheet = doc.sheetsByIndex[sheetIndex];
    var rows = await sheet.getRows(); // can pass in { limit, offset }
    
    var data = await MemberSchema.find(updateData);
    //console.log(data);
    for(const row of data){
      var indexObj = await find('Player tag', row.tag);
      var warScore = 0;
      for(const attack of row.attacks){
        warScore += attack.stars;
        //console.log(warScore);
      }
      if(indexObj.index != -1){
        //var orig = indexObj.row.get('Total war score');
        //let marker = '' + updateData.opponent_clan_tag
        // indexObj.row.set('Total war score', parseInt(indexObj.row.get('Total war score')) + warScore);
        indexObj.row.set(updateData.opponent_clan_tag, warScore);
        // indexObj.row.set('Total score', parseInt(indexObj.row.get('Total score'))  + warScore);
        indexObj.row.assign({ 'Total war score': parseInt(indexObj.row.get('Total war score')) + warScore, 'Total score': parseInt(indexObj.row.get('Total score'))  + warScore });
        //console.log(`Updated ${row.name} in row ${indexObj.index} with war score ${indexObj.row.get('Total war score')} from ${0}`);
        await indexObj.row.save();
      }
      else{
        //console.log(rows[38].get('Name'));
        var orig = warScore;
        var index = await addMembers({Name: row.name, warScore, tag: row.tag});
        rows = await sheet.getRows();
        var rowv2 = rows[index - 2];
        console.log(`Added ${row.name} in row ${index} with war score ${warScore}`);
        rowv2.set(updateData.opponent_clan_tag, orig);
        rowv2.set('Total war score', warScore);
        rowv2.set('Total score', warScore);
        await rowv2.save();
      }
    }
    return data.length;
    //console.log(data);
  
}

async function addMembers(updateData){
    const sheet = doc.sheetsByIndex[sheetIndex];
    const rows = await sheet.getRows()
    var len = (rows.length) + 2;
    await sheet.loadCells(`A${len}:C${len}`);
    const a = await sheet.getCellByA1(`A${len}`);
    const b = await sheet.getCellByA1(`B${len}`);
    const c = await sheet.getCellByA1(`C${len}`);
    a.value = len;
    b.value = updateData.Name;
    c.value = updateData.tag;
    await sheet.saveUpdatedCells();
    return len;
}
  
async function find(header, name){
    const sheet = doc.sheetsByIndex[sheetIndex];
    const rows = await sheet.getRows(); // can pass in { limit, offset }
  
    //loop through rows
    var counter = 0;
    for(const row of rows){
        if(row.get(header) == name){
            return {row: row, index: counter};
        }
        counter++;
    }
    return {row: null, index: -1};
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