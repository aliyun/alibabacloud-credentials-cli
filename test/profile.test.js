'use strict';

const assert = require('assert');

const { loadProfile, loadCurrentProfile } = require('../lib/profile');

describe('lib/profile.js', function () {
  it('loadProfile', () => {
    const config = {
      profiles: [
        {'name': 'default', 'mode': 'AK', 'access_key_id': 'id', 'access_key_secret': 'secret'}
      ]
    };
    const p1 = loadProfile(config, 'p1');
    assert.deepStrictEqual(p1, undefined);
    const p2 = loadProfile(config, 'default');
    assert.deepStrictEqual(p2, {'name': 'default', 'mode': 'AK', 'access_key_id': 'id', 'access_key_secret': 'secret'});
  });

  it('loadCurrentProfile', () => {
    const config = {
      current: 'default',
      profiles: [
        {'name': 'default', 'mode': 'AK', 'access_key_id': 'id', 'access_key_secret': 'secret'}
      ]
    };
    const p = loadCurrentProfile(config);
    assert.deepStrictEqual(p, {'name': 'default', 'mode': 'AK', 'access_key_id': 'id', 'access_key_secret': 'secret'});
  });
});