const crypto = require('crypto');
const outcome = require('./outcome');

const generateId = (user, context, content, resource, target) => crypto.createHash('sha256').update(`${user}-${context}-${content}-${resource}-${target}-${Date.now()}`).digest("hex");

module.exports = (req, res, next) => {
    const contentId = req.params.contentId;
    resources = {
        register: (user, context, content, resource, target, info, data) => {
            const id = generateId(user, context, content, resource, target);
            req.session.resources = req.session.resources || {};
            req.session.resources[id] = {
                user, context, content, resource, target, info, data
            }
            return id;
        }
    };
    if(contentId) {
        resources.contentId = () => contentId;
        resources.accessable = () => (req.session.resources || {})[contentId] !== undefined;
        resources.current = () => (req.session.resources || {})[contentId];
        resources.outcome = (callback) => {
            if(!resources.accessable()) {
                return callback("Invalid session");
            }
            outcome.access(resources.current().data, callback);
        };
    }
    req.resources = resources;
    next();
};