const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

// Schéma pour les commentaires
const commentSchema = new mongoose.Schema({
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users'
    },
    content: { type: String, required: true }
});

// Schéma pour les vues
const historySchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users'
    },
    action: {type: String, required: true},
    date: { type: Date, default: Date.now } // Correction: Utiliser Date.now pour une date dynamique
});

// Schéma principal pour les tickets
const ticketSchema = new mongoose.Schema({
    client: { type: mongoose.Schema.Types.ObjectId, ref: 'Clients', required: true },
    origin: { type: String, required: true },
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Projects', required: true },
    state: { type: Number, required: true, default: 1}, // 0: closed, 1: open, 2: in progress
    priority: { type: Number, required: true }, // 0: low, 1: medium, 2: haut, 3: emergency
    subject: { type: String, required: true },
    content: { type: String, required: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'Users', required: true },
    createAt: { type: Date, default: Date.now },
    comments: [commentSchema],
    history: [historySchema],
    open: { type: Boolean, default: true },
    affected: { type: mongoose.Schema.Types.ObjectId, ref: 'Users'},

});

// Auto-incrémentation du champ 'id'
ticketSchema.plugin(AutoIncrement, { inc_field: 'id' });

module.exports = mongoose.model('Tickets', ticketSchema, 'tickets');
