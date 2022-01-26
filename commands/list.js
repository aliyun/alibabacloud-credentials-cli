'use strict';

const { loadConfig } = require('../lib/profile');

function mockAKID(id) {
  return `***${id.substring(id.length - 3, id.length)}`;
}

function getDetail(d) {
  switch (d.mode) {
  case 'AK':
    return `AK:${mockAKID(d.access_key_id)}`;
  case 'RamRoleArn':
    return `RamRoleArn:${mockAKID(d.access_key_id)}/${d.ram_role_arn}`;
  case 'External':
    return `External:${d.process_command}`;
  case 'CredentialsURI':
    return `CredentialsURI:${d.credentials_uri}`;
  case `ChainableRamRoleArn`:
    return `ChainableRamRoleArn:${d.source_profile}:${d.ram_role_arn}`;
  case `EcsRamRole`:
    return `EcsRamRole:${d.ram_role_name}`;
  }
}

function display(config) {
  const maxNameLength = config.profiles.map((d) => d.name.length).reduceRight((pre, current) => {
    return Math.max(pre, current);
  }, 0);

  console.log(` # | ${'Profile'.padEnd(maxNameLength, ' ')} | Credential `);
  console.log(`---|${'-'.padEnd(maxNameLength + 2, '-')}|----------`);
  for (const d of config.profiles) {
    console.log(` ${d.name === config.current ? '*' : ' '} | ${d.name.padEnd(maxNameLength, ' ')} | ${getDetail(d)}`);
  }
}

module.exports = class {
  constructor(app) {
    this.app = app;
    this.name = 'list';
    this.description = 'list alibaba cloud cli configurations';
    this.options = {};
  }

  async run(argv) {
    const config = await loadConfig();
    display(config);
  }
};
