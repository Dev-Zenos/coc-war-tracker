const {Schema, model} = require('mongoose');

const wars = new Schema({
    clan_tag: {
        type: String,
        required: true,
    },
    opponent_clan_tag: {
        type: String,
        required: true,
    },
    timestamp: {
        type: String,
        required: true,
    },
    lastUpdated:{
        type: String,
        required: true,
    },
    state:{
        type: String,
        required: true,
    }
});

module.exports = model('wars', wars);