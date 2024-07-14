const { PermissionsBitField } = require('discord.js');

module.exports =  (interaction, commandObj) => {
    if(commandObj.manageRoles && !interaction.member.permissions.has(PermissionsBitField.Flags.ManageRoles)){
        interaction.reply('This command requires Manage Roles permission');
        return true;
    }
}