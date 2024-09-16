const mongoose = require('mongoose');

// Schéma du ticket
const TicketSchema = new mongoose.Schema({
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: true
  },
  origine: {
    type: {
      type: String,
      enum: ['telephone', 'mail'],  // Peut être 'telephone' ou 'mail'
      required: true
    },
    data: {
      type: String,  // Téléphone ou email
      required: true
    }
  },
  projet: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',  // Référence à un projet
    required: true
  },
  etat: {
    type: String,
    enum: ['En attente', 'Affecté', 'Annulé', 'Résolu'],  // États possibles
    default: 'En attente'
  },
  level: {
    type: Number,  // Niveau d'importance
    required: true
  },
  domaine: {
    type: String,
    enum: ['demande d’ajout', 'bug report', 'Type'],  // Domaine de l'incident
    required: true
  },
  type: {
    type: String,
    enum: ['Support technique', 'réclamation', 'demande d’information', 'demande de service'],
    required: true
  },
  sujet: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',  // Référence à l'auteur du ticket (rapporteur)
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Modèle Ticket
module.exports = mongoose.model('Ticket', TicketSchema);

