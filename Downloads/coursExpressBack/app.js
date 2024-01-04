/*var express = require("express");
var app = express();
var bodyParser = require("body-parser");

app.use(bodyParser.urlencoded({extended: false}));

var path = require("path");

app.get("/", function(req, res){
    res.sendFile(path.resolve("index.html"));
});

app.post("/submit-data", function(req, res){
    var name = req.body.firstname + " " + req.body.lastname;
    res.send(name + "Submitted successfully");
})

var server = app.listen(5000, function(req, res) {
    console.log("Server listening on port 5000");
});*/





var express = require("express");
var app = express();
var bodyParser = require("body-parser");

app.use(bodyParser.urlencoded({extended: false}));
require("dotenv").config();

//var path = require("path");
//connexion mongodb :
var mongoose = require("mongoose");
const url = process.env.DATABASE_URL;

mongoose.connect(url)
.then(console.log("Mongodb connected"))
.catch(err => console.log(err));

app.set('view engine', 'ejs');

const cors = require("cors");
app.use(cors({credentials : true, origin: process.env.FRONTEND_URL}));

//method put et delete pour express
const methodOverride = require ('method-override');
app.use(methodOverride('_method'));


//bcrypt : hashage de mdp
const bcrypt = require('bcrypt');

//cookie parser
const cookieParser = require("cookie-parser");
app.use(cookieParser());

//import JWT
const {createTokens, validateToken} = require("./JWT");

//import jwt decode
const {jwtDecode} = require("jwt-decode");

//multer
const multer = require("multer")
app.use(express.static("uploads"));

const storage= multer.diskStorage({
    destination : (req, file, cb) =>{
        cb(null, "uploads/");
    },
    filename : (req, file, cb) =>{
        cb(null, file.originalname); // a ce moment la que tu peux changer le nom du fichier 
    },
})
const upload = multer({storage})


//Models : 

var Contact = require("./models/Contact");

app.post('/uploadimage', upload.single('image'), function(req, res){ // le nom 'image' ici doit etre le meme que celui dans le front au nivaeau du formData.append
    if(!req.file){
        res.status(400).json("No file uploaded!");
    }
    else{
        res.json("File uploaded!");
    }
})

app.post("/uploadmulitple", upload.array("images", 5),(req, res)=>{
    if(!req.files || req.files.lenght === 0){
        res.status(400).json("No files uploaded!");
    }
    else{
        res.json("File uploaded!")
    }
})

//parti contact
app.get("/", validateToken, function(req, res){
    /*res.sendFile(path.resolve("index.html"));*/
    Contact.find()
    .then((data)=>{
        console.log(data);
        //res.send(data);
        // res.render("Home",{data:data});
        res.json(data);
    })
    .catch(err => console.log(err));
    
});

app.get("/NewContact", function (req, res){
    res.render("NewContact");
});

app.get("/contact/:id", function(req, res){
    Contact.findOne({
        _id : req.params.id
    })
    .then((data)=>{
        res.render("Edit", {data:data})
    })
    .catch (err => console.log(err));
});                                               


app.post("/submit-contact", function(req, res){
    /*var name = req.body.nom + " " + req.body.prenom;
    var email = req.body.email;
    res.send("Bonjour " + name + ", <br/> Merci de nous avoir contacté. Nous reviendrons vers vous à cette email : " + email);
    res.send(name + "Submitted successfully");*/
    const Data = new Contact({
        nom : req.body.nom,
        prenom : req.body.prenom,
        email : req.body.email,
        message : req.body.message
    })

        Data.save()
        .then(()=>{
            console.log("Data saved successfully");
            res.redirect("/");
        })
        .catch(err=>{
            console.log(err);
        });
});

app.put("/edit/:id", function (req, res) {
    const Data = {
        nom : req.body.nom,
        prenom : req.body.prenom,
        email : req.body.email,
        message : req.body.message
    }

    Contact.updateOne({_id : req.params.id},{$set: Data})
    .then(()=>{
        console.log("Data updated");
        res.redirect("/");
    })
    .catch(err=>{console.log(err);});
});

app.delete("/delete/:id", function (req, res){
    Contact.findOneAndDelete({
        _id : req.params.id
    })
    .then(()=>{
        console.log("Data deleted");
        req.redirect("/");
    })
    .catch(err=>{console.log(err);});
});

//blog

var Blog = require("./models/Blog");

//affichage nv blog
app.get("/newblog", function (req, res){
    res.render("NewBlog")
});

//ajt blog
app.post("/addblog", upload.single('image'), function (req, res){
    const Data = new Blog({
        titre : req.body.titre,
        sousTitre : req.body.sousTitre,
        auteur : req.body.auteur,
        description : req.body.description,
        imageName : req.body.filename,
        datePublication : req.body.datePublication
    })
    // console.log(req.file);

    //img obligatoire pour l'enregistrement d'un blog
    if(!req.file){
        res.status(400).json("No file uploaded")
    }
    else{
        Data.save()
    .then(()=>{
        console.log("Blog saved");
        res.json("blog saved")
        // res.redirect("http://localhost:3000/allblog")
    })
    .catch(err=>console.log.error(err));
    }

});

//page qui affiche le formulaire edition
app.get("/allblogs", function(req,res){
    Blog.find()
    .then((data)=>{
        // res.render("AllBlogs",{data:data});
        res.json(data);
    })
});

app.get("/blog/:id", function (req, res){
    Blog.findOne({
        _id : req.params.id
    })
    .then((data)=>{
        // res.render("EditBlog",{data:data});
        res.json(data);
    })
});

//update
app.put("/editblog/:id", function (req,res){
    const Data = {
        titre : req.body.titre,
        sousTitre : req.body.sousTitre,
        auteur : req.body.auteur,
        description : req.body.description
    }

    Blog.updateOne({
        _id : req.params.id
    }, {$set:Data})
    .then(()=>{
        res.redirect("/http://localhost:5000/addblog")
    })
    .catch((err)=>{
        console.log(err)
    });
});

app.delete("/deleteblog/:id", function (req,res){
    Blog.findOneAndDelete({_id:req.params.id})
    .then(()=>{
        console.log("Blog deleted");
        res.redirect(process.env.FRONTEND_URL + "/allblogs");

    })
    .catch((err)=>{console.log(err);})
});


//User
const User = require("./models/User");

//Inscription
app.post("/api/inscription", function (req, res){
    const Data = new User({
        username : req.body.username,
        email : req.body.email,
        password : bcrypt.hashSync(req.body.password, 10),
        admin : req.body.admin
    })
    Data.save()
    .then(()=>{
        console.log("User saved");
        res.redirect("/")

    })
    .catch(err=>{console.log(err);})
})

app.get("/signup", function (req,res){
    res.render("Inscription");
})

app.get("/signin", function (req,res){
    res.render("Connexion");
})

app.post("/api/connexion", function (req, res){
    User.findOne({
        username : req.body.username
    }).then(user =>{
        if(!user)
        {
            return res.status(404).send("No user found");
        }
        if (!bcrypt.compareSync(req.body.password, user.password)){
            return res.status(404).send("Invalid password")
        }

        const accessToken = createToken(user)

        res.cookie("access-token", accessToken, {
            maxAge : 1000 * 60 * 60 * 24 * 30, //30 jours en ms
            //        1s   1min  1h   1j  1mois
            httpOnly : true 
        })

        res.redirect("http://loaclhost:3000/");
        // res.json('LOGGED IN')

        //res.render("UserPage", {data : user})
    })
    .catch(err =>{
        console.log(err);
    })
});

app.get('/logout', (req, res) =>{
    res.clearCookie("access-token");
    res.redirect("http://loaclhost:3000/");
})

app.get('/getJwt', (req, res)=>{
    res.json(jwtDecode(res.cookies["access-token"]))
});

var server = app.listen(5000, function(req, res) {
    console.log("Server listening on port 5000");
});












