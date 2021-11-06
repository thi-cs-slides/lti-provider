const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const config = require('../config');

router.get('/token', (req, res) => {
    if(req.resources.accessable()) {
        const token = jwt.sign({ 
                exp: Math.floor((Date.now() + config.tokenExp) / 1000), 
                data: {
                    userRef: req.session.userId,
                    info: req.resources.current().info
                }
            }, 
            config.secret)
        res.status(200).send({token});
    } else {
        res.status(403).send({msg: 'Required authentification with lti before'});
    }
});

/*
 * At the end we export the paths so our application can use them.
 */
module.exports = router;