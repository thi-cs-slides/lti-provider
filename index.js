const express = require('express');
const session = require('express-session');
const mongoose = require('mongoose');
const resources = require('./utils/resources');
const debug = require('debug')('lti-provider:index');

const app = express();
const config = require('./config');

const startApp = function() {
    const MongoStore = require('connect-mongo')(session);

    // Check trusted ips
    app.set('trust proxy', config.trusted)

    // Handle JSON data
    app.use(express.json());
    app.use(express.urlencoded({extended: true}))

    // Config session storage
    app.use(session({
        secret: config.secret,
        resave: false,
        saveUninitialized: true,
        cookie: {
            secure: config.cookie.secure,
            maxAge: config.cookie.maxAge
        },
        store: new MongoStore({
            mongooseConnection: mongoose.connection
        })
    }));

    // Config CORS for express
    app.use((req, res, next) => {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Methods", "OPTIONS, PUT, POST, DELETE, GET");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, X-Access-Token");
        res.header("Access-Control-Expose-Headers", "Content-Type, X-Access-Token");
        // Intercepts OPTIONS method
        if ("OPTIONS" === req.method) {
            res.sendStatus(200);
        } else {
            next();
        }
    });

    app.use('/', resources, require('./routes/lti'));
    app.use('/:contentId', resources, require('./routes/outcome'));
    app.use('/:contentId', resources, require('./routes/token'));
    app.use('/:contentId', resources, require('./routes/content'));

    app.listen(config.port, function () {
        debug(`listening on ${config.port}`);
    });
};

/**
 * Reconnect to mongo, until db is available.
 */
const connectWithRetry = function () {
    debug(`Connect to ${config.database}`);
    return mongoose.connect(config.database, 
        { 
            useMongoClient: true
        }, 
        (err) => {
            if (err) {
                debug('Failed to connect to mongo on startup - retrying in 5 sec', err);
                setTimeout(connectWithRetry, 5000);
            } else {
                debug(`Database ${config.database} connected`);
                startApp();
            }
        });
};

connectWithRetry();

module.exports = app;