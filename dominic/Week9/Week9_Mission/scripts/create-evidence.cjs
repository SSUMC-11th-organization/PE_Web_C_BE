const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const escape = text => text.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
const sections = [
  ['tests', '단위 4개 · 메모리 DB 통합 14개 통과', 'test-results.txt'],
  ['favorite-unit', '중복 검사 제거: 단위 테스트 실패', 'mutation-favorite-unit.txt'],
  ['favorite-e2e', '중복 검사 제거: 통합 테스트 409 → 500', 'mutation-favorite-e2e.txt'],
  ['transaction', '트랜잭션 제거: 평점 0건 예상 → 1건 잔존', 'mutation-transaction-e2e.txt'],
  ['restored', '원복 후 통합 테스트 14개 재통과', 'mutation-restored-e2e.txt'],
];
const cards = sections.map(([id, title, file]) => `<section id="${id}"><h2>${title}</h2><p>실제 실행 로그: docs/${file}</p><pre>${escape(fs.readFileSync(path.join(root, 'docs', file), 'utf8'))}</pre></section>`).join('');
const html = `<!doctype html><html lang="ko"><meta charset="utf-8"><title>Week 9 실제 테스트 실행 증빙</title><style>body{margin:0;background:#f2f5fa;color:#18233c;font:16px/1.6 system-ui}header,section{max-width:1160px;margin:28px auto;padding:28px;background:white;border:1px solid #d7e1ee;border-radius:16px}h1,h2{margin:0 0 10px}p{color:#465575}pre{font:13px/1.5 ui-monospace,monospace;white-space:pre-wrap;overflow-wrap:anywhere;background:#111c31;color:#e7eefb;padding:22px;border-radius:10px}a{margin-right:18px}section{scroll-margin:16px}</style><header><h1>Week 9 · 함께 테스트하고 다듬기</h1><p>아래 내용은 저장된 실행 로그를 그대로 표시합니다. FAIL은 임시 복사본에서 코드를 제거한 의도적인 실패 실험입니다.</p>${sections.map(([id,title]) => `<a href="#${id}">${title}</a>`).join('')}</header>${cards}</html>`;
fs.writeFileSync(path.join(root, 'public', 'evidence.html'), html);
console.log('Created public/evidence.html from actual test logs.');
