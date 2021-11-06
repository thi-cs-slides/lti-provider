const express = require('express');
const router = express.Router();
const debug = require('debug')('lti-provider:routes:lti');
const lti = require('ims-lti');
const config = require('../config');
const crypto = require('crypto');

const anonymizeUser = (context, user) => crypto.createHash('sha256').update(`${user}@${context}`).digest("hex");

const Consumer = require('../models/consumer');

const handleLtiRequest = (req, res, next, target) => {
    const context = req.body.context_id;
    const userId = anonymizeUser(req.body.context_id, req.body.user_id);
    debug(`Start auth for ${userId}`);

    const consumerKey = req.body.oauth_consumer_key;
    if (typeof consumerKey === 'undefined' || consumerKey === null) {
        return next('Must specify oauth_consumer_key in request.');
    }

    Consumer.findOne({ key: consumerKey }, 'secret content', (err, consumer) => {
        if (err || !consumer) {
            debug(`Error while searching for consumer ${consumerKey}`, err)
            return next(err);
        }
        consumer = (consumer || {});

        const consumerSecret = consumer.secret;
        const content = consumer.content;
        const resource = req.body.resource_link_id;
        const provider = new lti.Provider(consumerKey, consumerSecret);
        debug(`Found consumer ${content} for ${userId}`);

        provider.valid_request(req, (err, isValid) => {
            if (isValid) {
                target = target || req.body.custom_target || consumer.target || 'index.html';
                const ref = req.resources.register(userId, context, content, resource, target, {
                    title: provider.context_title,
                    label: provider.context_label,
                    isAdmin: provider.admin,
                    isInstructor: provider.instructor,
                    isManager: provider.manager,
                    isMember: provider.member
                }, provider.outcome_service);

                targetUrl = config.base + ref + '/';
                req.session.save(function (err) {
                    debug(`Created content session ${userId} for ${content} with ${ref}`)
                    res.redirect(301, targetUrl);
                })
            } else {
                debug(`Error validating request for ${consumerKey}`, err)
                next(err);
            }
        });
    });
};

router.post('/lti/', (req, res, next) => handleLtiRequest(req, res, next));
router.post('/lti/*', (req, res, next) => handleLtiRequest(req, res, next, req.path.substr(5)));

module.exports = router;
