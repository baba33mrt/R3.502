const mongoose = require('mongoose')

const Sessions = new mongoose.Schema({

    accessToken: {type: String, required: true},
    user: {type: mongoose.Schema.Types.ObjectId, ref: "Users", required: true}

})
module.exports = mongoose.model('Sessions', Sessions, "sessions")

