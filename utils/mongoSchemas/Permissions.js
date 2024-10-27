const mongoose = require('mongoose');

const Permissions = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    bit: { type: String, required: true },
    });

module.exports = mongoose.model('Permissions', Permissions, 'Permissions');
