const crypto = require('crypto');

function hashPassword(password) {
    return crypto.createHash('sha256').update(password).digest("hex");
}

function checkPassword(password, hash) {

    console.log(hashPassword(password) , hash)
    return hashPassword(password) === hash;
}

module.exports = {
    hashPassword,
    checkPassword
};
