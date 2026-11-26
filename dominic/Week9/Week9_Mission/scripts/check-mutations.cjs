const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const root = path.resolve(__dirname, '..');
const scratch = fs.mkdtempSync(path.join(os.tmpdir(), 'umc-week9-mutations-'));
const docs = path.join(root, 'docs');
const summary = [];

function run(label, config, args, expected, marker) {
  const result = spawnSync(process.execPath, [path.join(root, 'node_modules/jest/bin/jest.js'),
    '--config', config, '--runInBand', '--no-cache', ...args], {
    cwd: scratch, encoding: 'utf8', env: { ...process.env, FORCE_COLOR: '0' }, timeout: 60000,
  });
  const output = `${result.stdout ?? ''}${result.stderr ?? ''}`.split(root).join('<project>').split(scratch).join('<temporary-copy>');
  fs.writeFileSync(path.join(docs, `${label}.txt`), output);
  const verified = expected === 'pass' ? result.status === 0
    : result.status !== 0 && result.status !== null && output.includes(marker) && /Tests:\s+1 failed/.test(output);
  summary.push({ label, expected, exitCode: result.status, verified });
  if (!verified) throw new Error(`${label}: unexpected test result; inspect docs/${label}.txt`);
  console.log(`${label}: ${expected === 'pass' ? 'PASS' : 'expected failure detected'}`);
}

try {
  // Mutate only a disposable copy. The working source and MySQL DB are untouched.
  for (const entry of ['src', 'test', 'package.json', 'tsconfig.json', 'tsconfig.test.json', 'jest.config.cjs']) {
    fs.cpSync(path.join(root, entry), path.join(scratch, entry), { recursive: true });
  }
  fs.symlinkSync(path.join(root, 'node_modules'), path.join(scratch, 'node_modules'), 'dir');
  run('mutation-baseline-unit', 'jest.config.cjs', [], 'pass');
  run('mutation-baseline-e2e', 'test/jest-e2e.cjs', [], 'pass');

  const favoritePath = path.join(scratch, 'src/favorites/favorites.service.ts');
  const originalFavorite = fs.readFileSync(favoritePath, 'utf8');
  const duplicateGuard = '    if (await this.favorites.exists({ where })) throw apiError.duplicateFavorite();';
  if (!originalFavorite.includes(duplicateGuard)) throw new Error('Favorite mutation target changed');
  fs.writeFileSync(favoritePath, originalFavorite.replace(duplicateGuard, '    // Mutation experiment: duplicate guard removed.'));
  run('mutation-favorite-unit', 'jest.config.cjs', ['--runTestsByPath', 'src/favorites/favorites.service.spec.ts'], 'fail', 'FAVORITE409_1');
  run('mutation-favorite-e2e', 'test/jest-e2e.cjs', ['-t', '즐겨찾기를 중복 등록하면'], 'fail', 'expected 409');
  fs.writeFileSync(favoritePath, originalFavorite);

  const recordPath = path.join(scratch, 'src/movie-records/movie-records.service.ts');
  const originalRecord = fs.readFileSync(recordPath, 'utf8');
  const start = 'return this.dataSource.transaction(async manager => {';
  if (!originalRecord.includes(start) || !originalRecord.includes('    });')) throw new Error('Transaction mutation target changed');
  const noTransaction = originalRecord.replace("import { DataSource }", "import { DataSource, EntityManager }")
    .replace(start, 'return (async (manager: EntityManager) => {')
    .replace('    });', '    })(this.dataSource.manager);');
  fs.writeFileSync(recordPath, noTransaction);
  run('mutation-transaction-e2e', 'test/jest-e2e.cjs', ['-t', '기존 즐겨찾기와 충돌하면'], 'fail', 'Received: 1');
  fs.writeFileSync(recordPath, originalRecord);

  run('mutation-restored-unit', 'jest.config.cjs', [], 'pass');
  run('mutation-restored-e2e', 'test/jest-e2e.cjs', [], 'pass');
  fs.writeFileSync(path.join(docs, 'mutation-results.json'), JSON.stringify(summary, null, 2) + '\n');
} finally {
  fs.rmSync(scratch, { recursive: true, force: true });
}
