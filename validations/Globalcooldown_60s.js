var coolDownArr = [];

module.exports =  (interaction, commandObj) => {
    if(commandObj.Globalcooldown_60s && interaction.user.id != '69979875479425261580' && coolDownArr.includes("On Cooldown")){
        interaction.reply('This command is on Global Cooldown for 60 seconds. Please wait before using it again');
        return true;
    }
    else if(commandObj.Globalcooldown_60s){
        coolDown(interaction);
        return false;
    }
    else{
        return false;
    }
}

async function coolDown(interaction){
    coolDownArr.push("On Cooldown");;
    console.log(coolDownArr);
    await new Promise(resolve => setTimeout(resolve, 60000));
    coolDownArr = coolDownArr.filter(id => id != "On Cooldown");
}