const express = require('express');
const router = express.Router();

router.post('/outcome', (req, res) => {
    const value = parseFloat(req.body.value);

    req.resources.outcome((err, out) => {
        if(!err) {
            out.replace(value);
            res.status(204).send();
        } else {
            res.status(400).send('Could not save outcome');
        }
    });
});

module.exports = router;
