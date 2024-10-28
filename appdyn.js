const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const csurf = require('csurf');
const hbs = require('hbs');

const logger = require('morgan');
const fs = require("fs");
const session = require('express-session');
const passport = require("passport");
const LocalStrategy = require('passport-local').Strategy;
const multer = require('multer');
const {checkPassword} = require('./utils/CryptoManager');
require('dotenv').config();
const moment = require("moment")

global.upload = multer({
    dest: './public/data/uploads/'
})

/* Chargement du fichier de configuration générale du Framework MiniSmall */
global.config = JSON.parse(fs.readFileSync("./config_minismall.json", "utf8"));

/*chargement de la configuration JSON des actions*/
global.actions_json = JSON.parse(fs.readFileSync("./routes/config_actions.json", "utf8"));

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

hbs.registerHelper('compare', function(arg1, operator, arg2, options) {
    switch (operator) {
        case '==':
            return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
        case '===':
            return (arg1 === arg2) ? options.fn(this) : options.inverse(this);
        case '!=':
            return (arg1 != arg2) ? options.fn(this) : options.inverse(this);
        case '!==':
            return (arg1 !== arg2) ? options.fn(this) : options.inverse(this);
        default:
            return options.inverse(this);
    }
});

hbs.registerHelper('formatDateTime', function(date) {
    return moment(date).format('DD/MM/YYYY, HH:mm:ss');
});

hbs.registerHelper('includes', function(array, value) {
    return array && array.includes(value);
});

hbs.registerHelper('checkPermission', function (userPermissions, requiredPermissionBit, options) {
    const hasPermission = (userPermissions & (1 << requiredPermissionBit)) !== 0;

    if (hasPermission) {
        return options.fn(this);
    } else if (typeof options.inverse === 'function') {
        return options.inverse(this);
    }
});

// Helper Handlebars pour vérifier la permission d'un bit
hbs.registerHelper('hasPermission', function (groupPermission, permissionBit) {
    return (groupPermission & (1 << permissionBit)) !== 0;
});


if (global.config.mongodb.used) {
    global.db = {};
    const mongoClient = require('mongodb').MongoClient;
    // Connexion URL
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
app.engine('hbs', hbs.__express);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
    name: 'sessiongreta',
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false // à mettre à true uniquement avec un site HTTPS
    }
}));

// Initialiser le middleware CSRF
app.use(csurf({ cookie: true }));

// Middleware pour attacher le token CSRF à chaque requête
app.use((req, res, next) => {
    res.locals.csrfToken = req.csrfToken();
    next();
});

// Configurer les layouts par contexte
app.use((req, res, next) => {
    if (req.path.startsWith('/dashboard')) {
        res.locals.layout = '/layouts/layout';
    } else if (req.path.startsWith('/admin')) {
        res.locals.layout = '/layouts/admin';
    } else if (req.path.startsWith('/developers')) {
        res.locals.layout = '/layouts/developers';
    } else if (req.path.startsWith('/')) {
        res.locals.layout = '/layouts/login';
    } else {
        res.locals.layout = '/layouts/layout';
    }
    next();
});


// Middleware d'authentification pour les routes de l'application principale
app.use('/', (req, res, next) => {
    if (req.path.startsWith('/api')) {
        return next();
    }
    if (!req?.session?.passport?.user) {
        console.log("no session")
        if (req.originalUrl !== "/" && req.originalUrl !== "/authenticated") {
            return res.redirect('/')
        }
    }
    next();
});

// Middleware d'authentification pour les routes de l'API
app.use('/api', (req, res, next) => {
    if (!req?.session?.passport?.user) {
        return res.status(403).json({ error: 'Unauthorized' });
    }
    next();
});

// app.use(permissionMiddleware)
app.use(passport.initialize());
app.use(passport.session());
passport.serializeUser(function(user, done) {
    done(null, user.uuid);
});

passport.deserializeUser(function(id, done) {
    global.schemas["Users"].findOne({uuid: id}, function(err, user) {
        //console.log(user)
        done(err, user);
    });
});

passport.use(new LocalStrategy(
    // Version du code pour mongoDB via mongoose
    function(username, password, done) {
        global.schemas["Users"].findOne({
            username: username
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
            // console.log(user.firstName);
            return done(null, user);
        });
    }
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
    res.status(404);
    if (req.path.startsWith('/api')) {
        res.json({ error: 'Bad request or unauthorized' });
    } else {
        res.render('404', createError(404));
    }
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
