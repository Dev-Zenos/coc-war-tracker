const {ActivityType} = require('discord.js');

module.exports = async(client) => {
    console.log(`⭐️${client.user.tag} is online!! On stable Version`)
    client.user.setActivity({ 
        type: ActivityType.Streaming, 
        name: 'Big Brother is watching you!',
        url: 'https://www.youtube.com/watch?v=R_HQW9IYOZM'});

    //await client.guilds.cache.fetch(); // update the chache for accurate info.
    let serverCount = client.guilds.cache.size;
    console.log(`Server count: ${serverCount}`);
    for(const guild of client.guilds.cache){
        console.log("Guild: " + guild[1].name);
    }
};