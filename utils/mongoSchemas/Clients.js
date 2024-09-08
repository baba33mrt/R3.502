const mongoose = require('mongoose')

const Clients = new mongoose.Schema({

    entrepriseName: {type: String, requires: true, unique: true},
    technicalPhone: {type: String, required: true},
    email: {
        type: String,
        required: true,
        match: /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/,
        message: props => `${props.value} n'est pas une adresse email valide !`
    },
    projects: [{type: mongoose.Schema.Types.ObjectId, ref: "Projects"}],

})
module.exports = mongoose.model('Clients', Clients, 'clients')

