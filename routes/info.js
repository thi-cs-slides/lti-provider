const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const config = require('../config');

router.get('/info', (req, res) => {
    if(req.resources.accessable()) {
        res.status(200).send(req.resources.current().info);
    } else {
        res.status(403).send({msg: 'Required authentification with lti before'});
    }
});

/*
 * At the end we export the paths so our application can use them.
 */
module.exports = router;