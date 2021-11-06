const ltiOutcome = require('ims-lti/lib/extensions/outcomes');
const HMAC_SHA1 = require('ims-lti/lib/hmac-sha1');
const debug = require('debug')('lti-provider:utils:outcome');

// we need to created the outcome service instance by using a 
// subset of data
function OutcomeRecreator(data) {
    Object.assign(this, data);
    this.signer = new HMAC_SHA1();
}
OutcomeRecreator.prototype = ltiOutcome.OutcomeService.prototype;

module.exports = {
    access: (data) => {
        const outcome = new OutcomeRecreator(data);
        return {
            replace: (result) => outcome.send_replace_result(result, (err, result) => {
                    if (err) {
                        debug("Couldn't update result", err);
                    }
                }),
            read: (callback) => outcome.send_delete_result(callback), // (err, result)
            delete: () => outcome.send_delete_result((err, result) => {
                    if (err) {
                        debug("Couldn't delete result", err);
                    }
                })
        };
    }
}