const mongoose = require('mongoose');
const {v4: uuidv4} = require("uuid");

const Groups = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    color: { type: String, required: true },
    uuid: { type: String, default: uuidv4 },
    permission: { type: Number, required: true }
});

module.exports = mongoose.model('Groups', Groups, 'groups');
