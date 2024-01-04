const mongoose = require('mongoose');

const blogSchema = mongoose.Schema({
    titre : { type: "string"},
    sousTitre : { type: "string"},
    auteur : { type : "string"},
    description : { type : "string"},
    imageName : { type : "string"},
    datePublication : {type : "Date"},
})

module.exports = mongoose.model("Blog", blogSchema);
// faire l'export pour qu'il puisse être importer dans le controler
