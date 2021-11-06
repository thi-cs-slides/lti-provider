const express = require('express');
const router = express.Router();
const config = require('../config');
const path = require("path");

const sendFile = (req, res, fileToPresent) => {
    const current = req.resources.current();
    if(!current) {
        res.status(404).send(`Unknown content ${content}. Please access via LTI to use this slides.`)
    }
    const target = current.target;
    const content = current.content;
    if (content && target) {
        res.sendFile(
            path.join(
                config.public, 
                content, 
                fileToPresent(target, req.path)
            ), { 
                root: require('path').dirname(require.main.filename) 
            }
        );
    } else {
        res.status(404).send(`Unknown content ${content}. Please access via LTI to use this slides.`);
    }
};

router.get('/', (req, res) => sendFile(req, res, (target, _) => target));

router.get('/*', (req, res) => sendFile(req, res, (_, file) => file));

module.exports = router;
