'use strict';

const assert = require('assert');

const { parse } = require('../lib/parser');

describe('lib/parser.js', () => {
  it('parse', () => {
    const result = parse([ '-f', '-p', '2', '-f2=f2v', '--flag1', 'flagvalue', '--flag', '--key=value', '--', 'node', 'test.js']);
    assert.deepStrictEqual(result.full, new Map([
      ['flag1', 'flagvalue'],
      ['flag', undefined],
      ['key', 'value']
    ]));
    assert.deepStrictEqual(result.short, new Map([
      ['f', undefined],
      ['p', '2'],
      ['f2', 'f2v']
    ]));
    assert.deepStrictEqual(result.rest, ['node', 'test.js']);
  });

  it('parse without rest', () => {
    const result = parse([ '-m', 'init project']);
    assert.deepStrictEqual(result.full, new Map());
    assert.deepStrictEqual(result.short, new Map([['m', 'init project']]));
    assert.deepStrictEqual(result.rest, undefined);
  });

  it('parse -m at end', () => {
    const result = parse([ '-m']);
    assert.deepStrictEqual(result.full, new Map());
    assert.deepStrictEqual(result.short, new Map([['m', undefined]]));
    assert.deepStrictEqual(result.rest, undefined);
  });

  it('parse --message at end', () => {
    const result = parse([ '--message']);
    assert.deepStrictEqual(result.full, new Map([['message', undefined]]));
    assert.deepStrictEqual(result.short, new Map());
    assert.deepStrictEqual(result.rest, undefined);
  });

  it('parse no flag', () => {
    const result = parse([]);
    assert.deepStrictEqual(result.full, new Map());
    assert.deepStrictEqual(result.short, new Map());
    assert.deepStrictEqual(result.rest, undefined);
  });
});
