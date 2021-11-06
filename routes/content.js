const express = require('express');
const router = express.Router();
const config = require('../config');
const path = require("path");
const debug = require('debug')('lti-provider:routes:content');

const sendFile = (req, res) => {
    const current = req.resources.current();
    if(!current) {
        res.status(404).send(`Unknown content ${content}. Please access via LTI to use this slides.`)
    }
    const target = current.target;
    const content = current.content;
    if (content && target) {
        const fileToPresent = req.path == '/' ? '/' + target : req.path;
        debug(`Access content ${req.resources.content()}${fileToPresent}${req.path == '/' ? ' (main)': ''} as ${req.resources.userId()}`);
        res.sendFile(
            path.join(
                config.public, 
                content, 
                fileToPresent
            ), { 
                root: require('path').dirname(require.main.filename) 
            }
        );
    } else {
        res.status(404).send(`Unknown content ${content}. Please access via LTI to use this slides.`);
    }
};

router.get('/', (req, res) => sendFile(req, res));
router.get('/*', (req, res) => sendFile(req, res));

module.exports = router;
