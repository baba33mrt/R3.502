const mongoose = require('mongoose');

const Groups = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    color: { type: String, required: true },
    // Utilisation de Number pour stocker les permissions sous forme de bits
    permission: { type: Number, required: true }
});

module.exports = mongoose.model('Groups', Groups, 'groups');
