const mongoose = require('mongoose')
const {v4: uuidv4} = require("uuid");


const Projects = new mongoose.Schema({

    name: {type: String, requires: true},
    description: {type: String},
    uuid: { type: String, default: uuidv4 },

})

module.exports = mongoose.model('Projects', Projects, "projects")

