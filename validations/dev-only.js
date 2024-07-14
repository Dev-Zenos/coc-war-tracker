module.exports =  (interaction, commandObj) => {
    if(commandObj.devOnly && (interaction.user.id !== '979875479425261580' && interaction.user.id !== '496649867997872138')){
        interaction.reply('This command is only available for the developer');
        return true;
    }
}