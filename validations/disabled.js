module.exports =  (interaction, commandObj) => {
    if(commandObj.disabled){
        interaction.reply('This command is disabled');
        return true;
    }
}