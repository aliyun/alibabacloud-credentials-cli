#!/usr/bin/env node

'use strict';

const argv = process.argv.slice(2);

const CLI = require('../lib/cli');
const pkg = require('../package.json');

const app = new CLI('acc', pkg.version, 'Alibaba Cloud Credentials CLI');
app.registerCommand(require('../commands/list'));
app.registerCommand(require('../commands/run'));
app.run(argv);
