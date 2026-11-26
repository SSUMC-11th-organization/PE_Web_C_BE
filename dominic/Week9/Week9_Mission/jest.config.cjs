module.exports = {
  rootDir: '.', testEnvironment: 'node', testRegex: 'src/.*\\.spec\\.ts$',
  transform: { '^.+\\.(t|j)s$': ['ts-jest', { tsconfig: 'tsconfig.test.json' }] },
  transformIgnorePatterns: ['node_modules/(?!@nestjs/jwt/)'],
  clearMocks: true, verbose: true,
};
