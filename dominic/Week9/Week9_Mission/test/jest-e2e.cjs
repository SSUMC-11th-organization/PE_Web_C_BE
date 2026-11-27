module.exports = {
  ...require('../jest.config.cjs'), rootDir: '..', testRegex: 'test/.*\\.e2e-spec\\.ts$',
  testTimeout: 20000,
};
