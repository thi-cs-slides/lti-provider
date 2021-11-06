const express = require('express');
const router = express.Router();
const debug = require('debug')('lti-provider:routes:outcome');

router.post('/outcome', (req, res) => {
    const value = parseFloat(req.body.value);

    try {
        const out = req.resources.outcome();
        out.replace(value);
        res.status(204).send();
        debug(`Updated outcome to ${value} for ${req.resources.userId()}`);
    } catch(e) {
        debug(e);
        res.status(400).send('Could not save outcome');
    }
});

module.exports = router;
