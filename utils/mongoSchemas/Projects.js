const mongoose = require('mongoose')


const Projects = new mongoose.Schema({

    name: {type: String, requires: true},
    description: {type: String}
})

module.exports = mongoose.model('Projects', Projects, "projects")

