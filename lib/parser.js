'use strict';

// -p
exports.parse = function (args) {
  const full = new Map();
  const short = new Map();
  for (let i = 0; i < args.length; i++) {
    const item = args[i];
    if (item.startsWith('-')) {
      if (item === '--') {
        // 解析结束
        return {
          full: full,
          short: short,
          rest: args.slice(i + 1)
        };
      }

      if (item.startsWith('--')) {
        // --key=value
        if (item.indexOf('=') !== -1) {
          const [prefix, value] = item.split('=');
          const key = prefix.substring(2);
          full.set(key, value);
          continue;
        }

        const key = item.substring(2);

        const next = args[i + 1];
        if (!next) {
          full.set(key, undefined);
          continue;
        }

        // --key
        if (next.startsWith('-')) {
          full.set(key, undefined);
          continue;
        }

        full.set(key, next);
        i = i + 1;
        continue;
      }

      if (item.indexOf('=') !== -1) {
        const [prefix, value] = item.split('=');
        const key = prefix.substring(1);
        short.set(key, value);
        continue;
      }

      const key = item.substring(1);

      const next = args[i + 1];
      if (!next) {
        short.set(key, undefined);
        continue;
      }

      // --key
      if (next.startsWith('-')) {
        short.set(key, undefined);
        continue;
      }

      short.set(key, next);
      i = i + 1;
      continue;
    }
  }

  return {
    full,
    short
  };
};

