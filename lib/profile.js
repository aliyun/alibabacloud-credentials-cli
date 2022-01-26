'use strict';

const fsx = require('fs/promises');
const path = require('path');
const os = require('os');

const CONFIG_FILE = path.join(os.homedir(), '.aliyun', 'config.json');

exports.loadConfig = async function () {
  const configPath = process.env.ALIBABACLOUD_CONFIG || CONFIG_FILE;
  const configContent = await fsx.readFile(configPath, 'utf-8');
  return JSON.parse(configContent);
};

exports.loadProfile = function (config, profileName) {
  const profile = config.profiles.find((d) => {
    return d.name === profileName;
  });

  return profile;
};

exports.loadCurrentProfile = function (config) {
  const profile = config.profiles.find((d) => {
    return d.name === config.current;
  });

  return profile;
};
