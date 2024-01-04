const mongoose = require('mongoose');
const contactSchema = mongoose.Schema({
    nom : { type: "string"}, //soit comme ça ou sans "" mais avec la premiere lettre en majucsule
    prenom : { type: "string"},
    email : { type : "string"},
    message : { type : "string"},
})

module.exports = mongoose.model("Contact", contactSchema);