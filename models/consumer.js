/*
 * In this file we define the basic model for our consumer key pairs.
 */
const mongoose = require('mongoose');
const crypto = require('crypto');

/*
 * This function generates a random aplpha-numeric key
 * for a given length.
 */
let generateRandomKey = (length) => crypto.randomBytes(Math.ceil(length / 2)).toString('hex').slice(0, length);

/*
 * At the end we export our model so mongoose can use it.
 */
module.exports = mongoose.model('Consumer', {
    key: {
        type: String,
        default: () => generateRandomKey(32),
        required: true,
        unique: true
    },
    secret: {
        type: String,
        default: () => generateRandomKey(32),
        required: true
    },
    content: {
        type: String,
        required: true
    },
    target: {
        type: String,
        required: false
    }
});