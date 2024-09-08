const mongoose = require('mongoose')
const AutoIncrement = require('mongoose-sequence')(mongoose);


const commentSchema = new mongoose.Schema({
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users'
    },
    content: {type: String, required: true}
});

const Tickets = new mongoose.Schema({

    client: {type: mongoose.Schema.Types.ObjectId, ref: "Clients", required: true},
    origin: {type: String, required: true},
    project: {type: mongoose.Schema.Types.ObjectId, ref: "Projects", required: true},
    state: {type: String, required: true},
    level: {type: String, required: true},
    branch: {type: String, required: true},
    subject: {type: String, required: true},
    content: {type: String, required: true},
    author: {type: mongoose.Schema.Types.ObjectId, ref: "Users", required: true},
    comments: [commentSchema],



})
Tickets.plugin(AutoIncrement, { inc_field: 'id' });



module.exports = mongoose.model('Tickets', Tickets, "tickets")

