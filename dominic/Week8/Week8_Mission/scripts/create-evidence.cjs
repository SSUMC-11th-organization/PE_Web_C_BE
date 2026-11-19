const fs = require('node:fs');
const escape = text => text.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
const source = fs.readFileSync('src/movie-records/movie-records.service.ts', 'utf8');
const { evidence } = JSON.parse(fs.readFileSync('docs/api-verification.json', 'utf8'));
const rollback = evidence.find(item => item.check === 'rollback after favorite INSERT failure');
if (!rollback) throw new Error('Run npm test first to collect real rollback evidence.');
fs.mkdirSync('public', { recursive: true });
fs.writeFileSync('public/transaction.html', `<!doctype html><html lang="ko"><meta charset="utf-8"><title>8주차 트랜잭션 코드와 검증</title>
<style>body{max-width:1120px;margin:40px auto;padding:0 28px;color:#1e293b;background:#f8fafc;font:16px/1.6 system-ui}h1{font-size:28px}pre{padding:24px;background:#0f172a;color:#e2e8f0;border-radius:12px;font:14px/1.6 ui-monospace,monospace;white-space:pre-wrap}code{font-family:ui-monospace,monospace}.result{background:#e0f2fe;padding:16px;border-radius:8px}</style>
<h1>8주차 영화 기록 트랜잭션</h1><p>평점과 즐겨찾기를 하나의 사용자 행동으로 처리하여, 어느 저장이 실패하더라도 다른 저장이 남지 않게 묶었습니다.</p>
<p><code>src/movie-records/movie-records.service.ts</code>의 실제 소스입니다. <code>npm run evidence</code>로 다시 생성할 수 있습니다.</p>
<div class="result"><strong>MySQL 통합 테스트 결과</strong><br>즐겨찾기 INSERT에 임시 트리거로 오류를 발생시킨 뒤 DB를 조회했습니다.<br>요청 전 ${escape(JSON.stringify(rollback.before))} → 실패 후 ${escape(JSON.stringify(rollback.after))}<br>테스트가 끝나면 임시 트리거를 제거하고 정상 저장도 확인합니다.</div>
<pre>${escape(source)}</pre></html>`);
