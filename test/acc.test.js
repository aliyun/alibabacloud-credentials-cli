'use strict';

const path = require('path');
const assert = require('assert');

const spawn = require('./spawn');
const version = require('../package.json').version;

describe('bin/acc', function() {
  it('acc', async function () {
    const {code, stdout, stderr} = await spawn('node', ['../bin/acc.js'], {
      cwd: __dirname
    });
    assert.deepStrictEqual(stderr, '');
    assert.deepStrictEqual(stdout, `Alibaba Cloud Credentials CLI v${version}

   help              print help information
   version           print version
   completion        auto completion
   list              list alibaba cloud cli configurations
   run               run command with profile

`);
    assert.deepStrictEqual(code, 0);
  });

  it('acc version', async function () {
    const {code, stdout, stderr} = await spawn('node', ['../bin/acc.js', 'version'], {
      cwd: __dirname
    });
    assert.deepStrictEqual(stderr, '');
    assert.deepStrictEqual(stdout, `${version}\n`);
    assert.deepStrictEqual(code, 0);
  });

  it('acc help', async function () {
    const {code, stdout, stderr} = await spawn('node', ['../bin/acc.js', 'help'], {
      cwd: __dirname
    });
    assert.deepStrictEqual(stderr, '');
    assert.deepStrictEqual(stdout, `Alibaba Cloud Credentials CLI v${version}

   help              print help information
   version           print version
   completion        auto completion
   list              list alibaba cloud cli configurations
   run               run command with profile

`);
    assert.deepStrictEqual(code, 0);
  });

  it('acc help help', async function () {
    const {code, stdout, stderr} = await spawn('node', ['../bin/acc.js', 'help', 'help'], {
      cwd: __dirname
    });
    assert.deepStrictEqual(stderr, '');
    assert.deepStrictEqual(stdout, `\x1B[1mUsage:\x1B[22m
   acc help [command]

\x1B[1mDescription:\x1B[22m
   print help information

\x1B[1mArguments:\x1B[22m
command:
   the sub-command name
`);
    assert.deepStrictEqual(code, 0);
  });

  it('acc completion acc', async function () {
    const {code, stdout, stderr} = await spawn('node', ['../bin/acc.js', 'help', 'help'], {
      cwd: __dirname,
      env: {
        ...process.env,
        COMP_LINE: 'acc'
      }
    });
    assert.deepStrictEqual(stderr, '');
    assert.deepStrictEqual(stdout, `help
version
completion
list
run
`);
    assert.deepStrictEqual(code, 0);
  });

  it('acc completion acc v', async function () {
    const {code, stdout, stderr} = await spawn('node', ['../bin/acc.js', 'help', 'help'], {
      cwd: __dirname,
      env: {
        ...process.env,
        COMP_LINE: 'acc v'
      }
    });
    assert.deepStrictEqual(stderr, '');
    assert.deepStrictEqual(stdout, `version
`);
    assert.deepStrictEqual(code, 0);
  });

  it('acc list', async function () {
    const {code, stdout, stderr} = await spawn('node', ['../bin/acc.js', 'list'], {
      cwd: __dirname,
      env: {
        ...process.env,
        'ALIBABACLOUD_CONFIG': path.join(__dirname, 'figures/aliyun.json')
      }
    });
    assert.deepStrictEqual(stderr, '');
    assert.deepStrictEqual(stdout, ` # | Profile      | Credential 
---|--------------|----------
   | ramrolearn   | RamRoleArn:***kid/ram_role_arn
 * | current      | AK:***kid
   | external     | External:node test.js
   | uri          | CredentialsURI:https://localhost:7878/
   | chainable    | ChainableRamRoleArn:external:ram_role_arn
   | ecs_ram_role | EcsRamRole:rolename
`);
    assert.deepStrictEqual(code, 0);
  });

  it('acc run', async function () {
    const {code, stdout, stderr} = await spawn('node', ['../bin/acc.js', 'run', '--', 'node', '-p', 'process.env.ALIBABACLOUD_ACCESS_KEY_ID'], {
      cwd: __dirname,
      env: {
        ...process.env,
        'ALIBABACLOUD_CONFIG': path.join(__dirname, 'figures/aliyun.json')
      }
    });
    assert.deepStrictEqual(stderr, '');
    assert.deepStrictEqual(stdout, `akid\n`);
    assert.deepStrictEqual(code, 0);
  });

  it('acc run without --', async function () {
    const {code, stdout, stderr} = await spawn('node', ['../bin/acc.js', 'run'], {
      cwd: __dirname,
      env: {
        ...process.env,
        'ALIBABACLOUD_CONFIG': path.join(__dirname, 'figures/aliyun.json')
      }
    });
    assert.deepStrictEqual(stderr, '');
    assert.deepStrictEqual(stdout, `export ALIBABACLOUD_ACCESS_KEY_ID=akid
export ALICLOUD_ACCESS_KEY_ID=akid
export ALIBABACLOUD_ACCESS_KEY_SECRET=aksecret
export ALICLOUD_ACCESS_KEY_SECRET=aksecret\n`);
    assert.deepStrictEqual(code, 0);
  });

  it('acc run --profile current', async function () {
    const {code, stdout, stderr} = await spawn('node', ['../bin/acc.js', 'run', '--profile', 'current', '--', 'node', '-p', 'process.env.ALIBABACLOUD_ACCESS_KEY_ID'], {
      cwd: __dirname,
      env: {
        ...process.env,
        'ALIBABACLOUD_CONFIG': path.join(__dirname, 'figures/aliyun.json')
      }
    });
    assert.deepStrictEqual(stderr, '');
    assert.deepStrictEqual(stdout, `akid\n`);
    assert.deepStrictEqual(code, 0);
  });

  it('acc run -p current', async function () {
    const {code, stdout, stderr} = await spawn('node', ['../bin/acc.js', 'run', '-p', 'current', '--', 'node', '-p', 'process.env.ALIBABACLOUD_ACCESS_KEY_ID'], {
      cwd: __dirname,
      env: {
        ...process.env,
        'ALIBABACLOUD_CONFIG': path.join(__dirname, 'figures/aliyun.json')
      }
    });
    assert.deepStrictEqual(stderr, '');
    assert.deepStrictEqual(stdout, `akid\n`);
    assert.deepStrictEqual(code, 0);
  });

  it('acc run --profile invalid', async function () {
    const {code, stdout, stderr} = await spawn('node', ['../bin/acc.js', 'run', '--profile', 'invalid', '--', 'node', '-p', 'process.env.ALIBABACLOUD_ACCESS_KEY_ID'], {
      cwd: __dirname,
      env: {
        ...process.env,
        'ALIBABACLOUD_CONFIG': path.join(__dirname, 'figures/aliyun.json')
      }
    });
    assert.deepStrictEqual(stderr, `Can not find profile 'invalid'.\n`);
    assert.deepStrictEqual(stdout, ``);
    assert.deepStrictEqual(code, 1);
  });

  it('acc run -- with script', async function () {
    this.timeout(10000);
    const { code } = await spawn('node', ['../bin/acc.js', 'run', '--', 'npm', '-v'], {
      cwd: __dirname,
      env: {
        ...process.env,
        'ALIBABACLOUD_CONFIG': path.join(__dirname, 'figures/aliyun.json')
      }
    });
    // assert.deepStrictEqual(stderr, ``);
    assert.deepStrictEqual(code, 0);
  });

  it('acc run -- with binary', async function () {
    const {code, stdout, stderr} = await spawn('node', ['../bin/acc.js', 'run', '--', 'node', '-v'], {
      cwd: __dirname,
      env: {
        ...process.env,
        'ALIBABACLOUD_CONFIG': path.join(__dirname, 'figures/aliyun.json')
      }
    });
    assert.deepStrictEqual(stderr, ``);
    assert.ok(stdout.startsWith(process.version));
    assert.deepStrictEqual(code, 0);
  });
});
