const crypto = require('crypto');
const outcome = require('./outcome');

const generateId = (user, context, content, resource, target) => crypto.createHash('sha256').update(`${user}-${context}-${content}-${resource}-${target}-${Date.now()}`).digest("hex");

module.exports = (req, res, next) => {
    const contentId = req.params.contentId;
    resources = {
        register: (user, context, content, resource, target, info, outcome) => {
            const id = generateId(user, context, content, resource, target);
            req.session.resources = req.session.resources || {};
            req.session.resources[id] = {
                user, context, content, resource, target, info, outcomeData: Buffer.from(JSON.stringify(outcome), 'utf-8').toString('base64')
            }
            return id;
        }
    };
    if(contentId) {
        resources.contentId = () => contentId;
        resources.accessable = () => (req.session.resources || {})[contentId] !== undefined;
        resources.current = () => (req.session.resources || {})[contentId];
        resources.outcome = () => {
            if(!resources.accessable()) {
                throw new Error("Invalid session");
            }
            const config = Buffer.from(resources.current().outcomeData, 'base64').toString('utf-8');
            if(!config) {
                throw new Error("Malformed config data");
            }
            return outcome.access(JSON.parse(config));
        };
    }
    req.resources = resources;
    next();
};