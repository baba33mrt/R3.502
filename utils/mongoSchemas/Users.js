const mongoose = require('mongoose')
const { v4: uuidv4 } = require('uuid');


const rolesShema = new mongoose.Schema({
    roles: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'groups'
    }
});

const Users = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    uuid: { type: String, default: uuidv4 },
    firstName: {type: String, requires: true},
    lastName: {type: String, required: true},
    email: {
        type: String,
        required: true,
        match: /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/,
        message: props => `${props.value} n'est pas une adresse email valide !`
    },
    phone: {type: String},
    password: {type: String, required: true},
    roles: {type: [rolesShema], required: true},
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    isActive: { type: Boolean, default: true },
    resetPasswordToken: { type: String, default: null },
    resetPasswordExpires: { type: Date },
    lastLogin: { type: Date }
})

Users.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});


module.exports = mongoose.model('Users', Users, 'users')

