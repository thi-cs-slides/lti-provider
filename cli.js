
const yargs = require('yargs/yargs')
const { hideBin } = require('yargs/helpers')
const config = require('./config');
const mongoose = require('mongoose');
const debug = require('debug')('lti-provider:cli');

const Consumer = require('./models/consumer');

mongoose.connect(config.database, 
    { 
        useMongoClient: true
    }, 
    (err) => {
        if(err) {
            debug('Failed to connect to mongo', err);
            return;
        }
        yargs(hideBin(process.argv))
            .command('create [content] [target]', `create new consumer`, (yargs) => yargs
                .positional('content', {
                    describe: `content folder in ${config.public}`,
                    demandOption: true
                })
                .positional('target', {
                    describe: `default target in content`,
                    default: 'index.html'
                }), 
                (argv) => {
                    const token = new Consumer({content: argv.content});
                    token.save((err) => {
                        if(!err) {
                            debug(`New consumer for ${argv.content} created.\n  Key = ${token.key}\n  Secret = ${token.secret}`);
                            mongoose.disconnect();
                        } else {
                            debug(`Failed to save new consumer.`)
                        }
                    });
                })
            .command('remove [key]', `remove key`, (yargs) => yargs
                .positional('key', {
                    describe: `content key`,
                    demandOption: true
                }), 
                (argv) => {
                    Consumer.remove({key: argv.key}, (err) => {
                        if(!err) {
                            debug(`Key ${argv.key} removed.`)
                        } else {
                            debug(`Failed to remove consumer.`)
                        }
                    });
                })
            .command('list', `list keys`, (yargs) => yargs, 
                (argv) => {
                    Consumer.find({}, (err, keys) => {
                        if(!err) {
                            keys.forEach(el => {
                                debug(`${el.key} for ${el.content}`);
                            })
                        } else {
                            debug(`Failed list all keys.`)
                        }
                    });
                })
            .parse();
    });