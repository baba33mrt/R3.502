const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const fs = require("fs");
const session = require('express-session');
const passport = require("passport");
const LocalStrategy = require('passport-local').Strategy;
const multer = require('multer');

const {checkPassword} = require('./utils/CryptoManager');

require('dotenv').config();

global.upload = multer({
    dest: './public/data/uploads/'
})

/* Chargement du fichier de configuration générale du Framework MiniSmall */
global.config = JSON.parse(fs.readFileSync("./config_minismall.json", "utf8"));

/*chargement de la configuration JSON des actions*/
global.actions_json = JSON.parse(fs.readFileSync("./routes/config_actions.json", "utf8"));


const hbs = require('hbs');
const datanaseManager = require("./utils/databaseManager");
const mongoose = require("mongoose");
hbs.registerPartials(__dirname + '/views/partials', function() {
    console.log('partials registered');
});

hbs.registerHelper('compare', function(lvalue, rvalue, options) {
    //console.log("####### COMPARE lvalue :", lvalue, " et rvalue: ", rvalue);
    if (arguments.length < 3)
        throw new Error("Handlerbars Helper 'compare' needs 2 parameters");
    const operator = options.hash.operator || "==";
    const operators = {
        '==': function (l, r) {
            return l == r;
        },
        '===': function (l, r) {
            return l === r;
        }
    };
    if (!operators[operator])
        throw new Error("'compare' doesn't know the operator " + operator);
    const result = operators[operator](lvalue, rvalue);
    if (result) {
        return options.fn(this);
    } else {
        return options.inverse(this);
    }
});
if (global.config.mongodb.used) {
    global.db = {};
    const mongoClient = require('mongodb').MongoClient;
    // Connexion URL
    //var url = 'mongodb://greta:azerty@127.0.0.1:27017/gretajs?authMechanism=DEFAULT';
    const url = config.mongodb.url;
    // Utilisation de la methode “connect” pour se connecter au serveur
    mongoClient.connect(url, {
        useUnifiedTopology: true
    }, function(err, client) {
        global.db = client.db('gretajs'); //On met en global la connexion à la base
        console.log("Connected successfully to server: global.db initialized");
    });
}
if (global.config.mongoose.used) {
    // connexion depuis mongoose
    global.schemas = {};
    const mongoose = require('mongoose');
    mongoose.connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    }, function(err) {
        if (err) {
            throw err;
        } else console.log('Connected Mongoose');
    });



    if (global.config.mongoose.schemaSystem === "JSON"){
        // chargement des schémas depuis le fichier de configuration JSON dans une variable
        const database_schemas = JSON.parse(fs.readFileSync("database_schema.json", 'utf8'));
        // Initialisation de chaque schéma par association entre le schéma et la collection
        for (modelName in database_schemas) {
            global.schemas[modelName] = new mongoose.model(modelName, database_schemas[modelName].schema,
                database_schemas[modelName].collection);
        }
    }


    if (global.config.mongoose.schemaSystem === "manager"){
        const datanaseManager = require("./utils/databaseManager")
        console.log(datanaseManager)
        for (let modelName in datanaseManager){
            global.schemas[modelName] = datanaseManager[modelName]
        }
    }

}


if (global.config.sequelize.used) {
    // connexion à mariadb via Sequelize
    const Sequelize = require("sequelize");

    // configuration des paramètres de la connexion
    global.sequelize = new Sequelize(config.sequelize.databaseName, config.sequelize.userName, config.sequelize.password, {
        host: config.sequelize.host,
        dialect: config.sequelize.dialect,
        pool: {
            max: 5,
            min: 0,
            idle: 10000
        }
    });
    try {
        sequelize.authenticate();
        console.log('Sequelize : Connection has been established successfully.');
    } catch (error) {
        console.error('Sequelize: Unable to connect to the database:', error);
    }
}


const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({
    extended: false
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
    name: 'sessiongreta',
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false
    } // à mettre à true uniquement avec un site https.
}));
app.use(passport.initialize());
app.use(passport.session());
passport.serializeUser(function(user, done) {
    done(null, user.uuid);
});

passport.deserializeUser(function(id, done) {
    global.schemas["Users"].findOne({uuid: id}, function(err, user) {
        done(err, user);
    });
});


passport.use(new LocalStrategy(
    // Version du code pour mongoDB via mongoose
    function(username, password, done) {
        global.schemas["Users"].findOne({
            email: username
        }, function(err, user) {
            if (err) {
                return done(err);
            }
            if (!user) {
                console.log("pas d'utilisateur trouvé");
                return done(null, false, {
                    message: 'Incorrect username.'
                });
            }
            if (!checkPassword(password, user.password)) {
                console.log("password erroné");
                return done(null, false, {
                    message: 'Incorrect password.'
                });
            }
            console.log(user.firstName);
            return done(null, user);
        });
    }
    //************************************************************************************** */
    // Version du code pour base SQL via Sequelize
    // function(username, password, done) {
    //     var params_value = [];
    //     params_value.push(username);
    //     params_value.push(password);
    //     // ici on réalise une requête
    //     global.sequelize.query("SELECT id_users, login, mdp FROM users WHERE login=?", {
    //             replacements: params_value,
    //             type: sequelize.QueryTypes.SELECT
    //         })
    //         .then(function(result) { // sql query success
    //             if (!result[0]) {
    //                 console.log("pas d'utilisateur trouvé");
    //                 return done(null, false, {
    //                     message: 'Incorrect username.'
    //                 });
    //             }
    //             if (result[0].mdp != password) {
    //                 console.log("password erroné");
    //                 return done(null, false, {
    //                     message: 'Incorrect password.'
    //                 });
    //             }
    //             console.log("utilisateur : ", result[0]);
    //             return done(null, result[0]);
    //         }).catch(function(err) { // sql query error
    //             console.log('error select', err);
    //         });
    // }
));

app.post('/authenticated', passport.authenticate('local'), function(req, res) {
    if (req.session.passport.user != null) {
        res.redirect('/dashboard'); //le user est authentifié on affiche l’index il est en session
    } else {
        res.redirect('/'); // il n’est pas présent on renvoie à la boîte de login
    }
});

require('./dynamicRouter')(app);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    res.render('404', createError(404));
});

// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;
