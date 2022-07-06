'use strict';

const { parse } = require('../lib/parser');

const { spawn, exec } = require('child_process');
const { loadConfig, loadProfile, loadCurrentProfile } = require('../lib/profile');
const { default: Credential, Config } = require('@alicloud/credentials');

function onExit(cp) {
  return new Promise((resolve) => {
    cp.on('exit', (code) => resolve(code));
  });
}

function onFinish(cp) {
  return new Promise((resolve) => {
    const stdout = [];
    const stderr = [];

    cp.stdout.on('data', (chunk) => {
      stdout.push(chunk);
    });

    cp.stderr.on('data', (chunk) => {
      stderr.push(chunk);
    });

    cp.on('exit', (code) => {
      resolve({
        code: code,
        stdout: Buffer.concat(stdout),
        stderr: Buffer.concat(stderr)
      });
    });
  });
}

class CredentialModel {
  constructor(id, secret, token) {
    this.id = id;
    this.secret = secret;
    this.token = token;
  }

  getAccessKeyId() {
    return this.id;
  }

  getAccessKeySecret() {
    return this.secret;
  }

  getSecurityToken() {
    return this.token;
  }

  toEnv() {
    const result = {
      'ALIBABACLOUD_ACCESS_KEY_ID': this.id,
      'ALICLOUD_ACCESS_KEY_ID': this.id,
      'ALIBABACLOUD_ACCESS_KEY_SECRET': this.secret,
      'ALICLOUD_ACCESS_KEY_SECRET': this.secret
    };

    if (this.token) {
      result['ALIBABACLOUD_SECURITY_TOKEN'] = this.token;
      result['ALICLOUD_SECURITY_TOKEN'] = this.token;
      result['SECURITY_TOKEN'] = this.token;
    }

    return result;
  }
}

async function getCredential(profile, parent) {
  switch (profile.mode) {
  case 'AK': {
    const id = profile['access_key_id'];
    const secret = profile['access_key_secret'];
    return new CredentialModel(id, secret);
  }
  case 'RamRoleArn': {
    const config = new Config({
      type: 'ram_role_arn',
      accessKeyId: profile['access_key_id'],          // AccessKeyId of your account
      accessKeySecret: profile['access_key_secret'],  // AccessKeySecret of your account
      roleArn: profile['ram_role_arn'],               // Format: acs:ram::USER_ID:role/ROLE_NAME
      roleSessionName: profile['ram_session_name'] || 'ACC_SESSION',  // Role Session Name
      // policy: 'policy',                            // Not required, limit the permissions of STS Token
      roleSessionExpiration: 3600,                    // Not required, limit the Valid time of STS Token
      stsRegion: profile['sts_region'] || 'cn-hangzhou'
    });
    const cred = new Credential(config);
    const id = await cred.getAccessKeyId();
    const secret = await cred.getAccessKeySecret();
    const securityToken = await cred.getSecurityToken();
    return new CredentialModel(id, secret, securityToken);
  }
  case 'EcsRamRole': {
    const config = new Config({
      type: 'ecs_ram_role',
      roleName: profile['ram_role_name']
    });
    const cred = new Credential(config);
    const id = await cred.getAccessKeyId();
    const secret = await cred.getAccessKeySecret();
    const securityToken = await cred.getSecurityToken();
    return new CredentialModel(id, secret, securityToken);
  }
  case 'CredentialsURI': {
    const config = new Config({
      type: 'credentials_uri',
      credentialsURI: profile['credentials_uri']
    });
    const cred = new Credential(config);
    const id = await cred.getAccessKeyId();
    const secret = await cred.getAccessKeySecret();
    const securityToken = await cred.getSecurityToken();
    return new CredentialModel(id, secret, securityToken);
  }
  case 'ChainableRamRoleArn': {
    const sourceProfileName = profile['source_profile'];
    const sourceProfile = loadProfile(parent, sourceProfileName);
    const credential = await getCredential(sourceProfile);
    const config = new Config({
      type: 'ram_role_arn',
      accessKeyId: credential.getAccessKeyId(),          // AccessKeyId of your account
      accessKeySecret: credential.getAccessKeySecret(),  // AccessKeySecret of your account
      securityToken: credential.getSecurityToken(),
      roleArn: profile['ram_role_arn'],               // Format: acs:ram::USER_ID:role/ROLE_NAME
      roleSessionName: profile['ram_session_name'] || 'ACC_SESSION',  // Role Session Name
      // policy: 'policy',                            // Not required, limit the permissions of STS Token
      roleSessionExpiration: 3600,                    // Not required, limit the Valid time of STS Token
      stsRegion: profile['sts_region'] || 'cn-hangzhou'
    });
    const cred = new Credential(config);
    const id = await cred.getAccessKeyId();
    const secret = await cred.getAccessKeySecret();
    const securityToken = await cred.getSecurityToken();
    return new CredentialModel(id, secret, securityToken);
  }
  case 'External': {
    const command = profile['process_command'];
    const cp = exec(command, {
      cwd: process.cwd(),
      encoding: null
    });
    const result = await onFinish(cp);
    const stdout = result.stdout.toString();
    const response = JSON.parse(stdout);
    if (response.mode === 'AK') {
      return new CredentialModel(response['access_key_id'], response['access_key_secret']);
    } else if (response.mode === 'STS') {
      return new CredentialModel(response['access_key_id'], response['access_key_secret'], response['security_token']);
    }
    break;
  }
  default:
    return null;
  }
}

module.exports = class {
  constructor(app) {
    this.app = app;
    this.name = 'run';
    this.description = 'run command with profile';
    this.useArgs = '0-n';
    this.supportAfterCommand = true;
    this.options = {
      profile: {
        short: 'p',
        required: false,
        description: `the profile name. default is current profile`
      }
    };
  }

  findOption(short) {
    for (const [key, option] of Object.entries(this.options)) {
      if (option.short === short) {
        return key;
      }
    }

    return null;
  }

  validOptions(full, short) {
    const all = new Map();

    for (const [key, value] of full) {
      if (this.options[key]) {
        all.set(key, value);
      }
    }

    for (const [key, value] of short) {
      const find = this.findOption(key);
      if (find) {
        all.set(key, value);
      }
    }

    return all;
  }

  async run(argv) {
    const { full, short, rest } = parse(argv);
    const parsed = this.validOptions(full, short);
    const config = await loadConfig();
    if (!config) {
      console.error(`No any configurations.`);
      process.exit(1);
    }

    let profile;
    if (parsed.has('profile')) {
      const profileName = parsed.get('profile');
      if (!profileName) {
        console.error(`Please input a valid profile name.`);
        process.exit(1);
      }
      profile = loadProfile(config, profileName);
      if (!profile) {
        console.error(`Can not find profile '${profileName}'.`);
        process.exit(1);
      }
    } else {
      // load default profile
      profile = loadCurrentProfile(config);
    }

    const credential = await getCredential(profile, config);
    if (!credential) {
      console.error(`the mode '${profile.mode}' is not supported currently.`);
      process.exit(1);
    }

    if (rest && rest.length > 0) {
      const [cmd, ...args] = rest;
      const child = spawn(cmd, args, {
        env: {
          ...process.env,
          // ak & sk & security token
          ...credential.toEnv()
        },
        cwd: process.cwd(),
        shell: true, // add it for Windows
        stdio: 'inherit'
      });
      const code = await onExit(child);
      process.exit(code);
    } else {
      console.log(`export ALIBABACLOUD_ACCESS_KEY_ID=${credential.getAccessKeyId()}`);
      console.log(`export ALICLOUD_ACCESS_KEY_ID=${credential.getAccessKeyId()}`);
      console.log(`export ALIBABACLOUD_ACCESS_KEY_SECRET=${credential.getAccessKeySecret()}`);
      console.log(`export ALICLOUD_ACCESS_KEY_SECRET=${credential.getAccessKeySecret()}`);
      if (credential.getSecurityToken()) {
        console.log(`export ALIBABACLOUD_SECURITY_TOKEN=${credential.getSecurityToken()}`);
        console.log(`export ALICLOUD_SECURITY_TOKEN=${credential.getSecurityToken()}`);
        console.log(`export SECURITY_TOKEN=${credential.getSecurityToken()}`);
      }
    }
  }
};
