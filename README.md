# Alibaba Cloud Credentials CLI

[![Node.js CI](https://github.com/aliyun/alibabacloud-credentials-cli/actions/workflows/node.js.yml/badge.svg)](https://github.com/aliyun/alibabacloud-credentials-cli/actions/workflows/node.js.yml)
[![npm version](https://badge.fury.io/js/@alicloud%2Facc.svg)](https://badge.fury.io/js/@alicloud%2Facc)
[![codecov](https://codecov.io/gh/aliyun/alibabacloud-credentials-cli/branch/master/graph/badge.svg?token=HNU0V3KSRJ)](https://codecov.io/gh/aliyun/alibabacloud-credentials-cli)

## Installation

Install it via NPM.

```sh
$ npm i @alicloud/acc -g
```

You will get a command that named `acc`. Test it in terminal:

```sh
$ acc
Alibaba Cloud Credentials CLI v0.0.1

   help              print help information
   version           print version
   completion        auto completion
   list              list alibaba cloud cli configurations
   run               run command with profile
```

## Usage

### List all credentials

```sh
$ acc list
 # | Profile             | Credential 
---|---------------------|----------
   | default             | AK:***C44
   | pager               | AK:***TrK
   | jacksontian         | AK:***zwR
   | sts                 | AK:***est
   | shyvo               | AK:***73a
   | ecsramrole          | EcsRamRole:rolename
   | sso                 | External:acs-sso login
   | nexttoken           | AK:***HZt
   | ramrole             | RamRoleArn:***73a/acs:ram::20899859:role/my
   | chain               | ChainableRamRoleArn:shyvo:acs:ram::1325847523475998:role/read-ecs
   | cli-test            | AK:***461
   | uri                 | CredentialsURI:http://localhost:6666/?user=jacksontian
   | ids-dev             | External:acs-sso login --profile ids-dev
   | test                | External:node /Users/jacksontian/go/src/github.com/aliyun/aliyun-cli/test.js
 * | puling_ram_role_arn | RamRoleArn:***sUT/acs:ram::1325847523475998:role/fc-test
```

### Run with credentials

default mode:

```sh
$ acc run --profile default
export ALIBABACLOUD_ACCESS_KEY_ID=akid
export ALICLOUD_ACCESS_KEY_ID=akid
export ALIBABACLOUD_ACCESS_KEY_SECRET=aksecret
export ALICLOUD_ACCESS_KEY_SECRET=aksecret
```

`acc run` will print environment variables to stdout. It can be used like this:

```sh
$ `acc run --profile default` # set ak&sk&security into environment variables
$ aliyun sts GetCallerIdentity # use it from environment variables
```

split mode:

```sh
$ acc run --profile default -- aliyun sts GetCallerIdentity
{
   "AccountId": "132584752347***",
   "Arn": "acs:ram::132584752347****:assumed-role/fc-test/test***",
   "IdentityType": "AssumedRoleUser",
   "PrincipalId": "34223406312260****:test****",
   "RequestId": "B2B1BD67-1B4F-5C6F-B318-AF175D47****",
   "RoleId": "342234063122600***"
}
```

ACC use `--` to split `acc run` and real command. `acc run` will get AK/STS with specify profile name, and set it
into environment variables, then spawn `aliyun sts GetCallerIdentity` command. If real command can consume the three
environment variables(`ALIBABACLOUD_ACCESS_KEY_ID`, `ALIBABACLOUD_ACCESS_KEY_SECRET`, `ALIBABACLOUD_SECURITY_TOKEN`),
it can be composed to use.

## License
[Apache License 2.0](./License).
