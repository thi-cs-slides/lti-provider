const debug = require('debug')('lti-provider:config');

const DEFAULT_SECRET = "SUPER_SECRET!";

const ips = process.env.TRUSTED_IPS ? process.env.TRUSTED_IPS.split(',') : [];

module.exports = {
    port: process.env.PORT || 4000,
    base: process.env.BASE || '/',
    database: process.env.DATABASE || 'mongodb://localhost/lti',
    secret: process.env.SECRET || DEFAULT_SECRET,
    cookie: {
        secure: process.env.COOKIE_SECURE || false,
        maxAge: process.env.COOKIE_MAX_AGE || 60 * 60 * 24 * 1000
    },
    tokenExp: process.env.TOKEN_EXP || 60 * 60 * 24 * 1000,
    public: process.env.PUBLIC_PATH || "public",
    trusted: (ip) => ips.length == 0 ? true : ips.indexOf(ip) != -1
}

if(!module.exports.base.endsWith('/')) {
    module.exports.base += '/';
}

if(module.exports.secret == DEFAULT_SECRET) {
    debug(`WARN: Configurate secret with ENV SECRET!`)
}