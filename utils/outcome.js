const session = require('./resources');
const lti = require('ims-lti');
const debug = require('debug')('lti-provider:utils:outcome');

const Consumer = require('../models/consumer');
module.exports = {
    access: (data, callback) => {
        const consumerKey = data.oauth_consumer_key;

        Consumer.findOne({ key: consumerKey }, 'secret content', (err, consumer) => {
            if (err || !consumer) {
                return callback(err || "Missing consumer");
            }
            const consumerSecret = consumer.secret;
            const provider = new lti.Provider(consumerKey, consumerSecret);

            provider.parse_request({}, data);
            callback(undefined, {
                replace: (result) => provider.outcome_service.send_replace_result(result, (err, result) => {
                        if (err) {
                            debug("Couldn't update result", err);
                        }
                    }),
                read: (callback) => provider.outcome_service.send_delete_result(callback), // (err, result)
                delete: () => provider.outcome_service.send_delete_result((err, result) => {
                        if (err) {
                            debug("Couldn't delete result", err);
                        }
                    })
            });
        });
    }
}