// Modèle Permissions
const mongoose = require('mongoose');

const Permissions = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    bit: { type: Number, required: true, unique: true }, // Assure-toi qu'il est de type Number
});

module.exports = mongoose.model('Permissions', Permissions, 'permissions');
