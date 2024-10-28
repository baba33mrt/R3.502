const mongoose = require('mongoose')
const {v4: uuidv4} = require("uuid");

const Clients = new mongoose.Schema({

    entrepriseName: {type: String, requires: true, unique: true},
    technicalPhone: {type: String, required: true},
    uuid: { type: String, default: uuidv4 },
    email: {
        type: String,
        required: true,
        match: /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/,
        message: props => `${props.value} n'est pas une adresse email valide !`
    },
    projects: [{type: mongoose.Schema.Types.ObjectId, ref: "Projects"}],
    isActive: { type: Boolean, default: true },

})
module.exports = mongoose.model('Clients', Clients, 'clients')

