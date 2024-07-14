const {Schema, model} = require('mongoose');

const war_data = new Schema({
    name: {
        type: String,
        required: true,
    },
    tag: {
        type: String,
        required: true,
    },
    townhall: {
        type: String,
        required: true,
    },
    opponent_clan_tag: {
        type: String,
        required: true,
    },
    attacks: {
        type: Object,
        required: true,
    },
    timestamp: {
        type: String,
        required: true,
    },
});

module.exports = model('war_datas', war_data);