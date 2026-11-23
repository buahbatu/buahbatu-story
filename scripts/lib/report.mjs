// Format hasil pemeriksaan doctor. Murni. Desain: docs/51 §5 ("tabel ✅/❌ per langkah")

/** @typedef {'ok' | 'warn' | 'fail' | 'later'} Status */
/**
 * @typedef {object} CheckResult
 * @property {string} group
 * @property {string} name
 * @property {Status} status
 * @property {string} [detail]  info aman ditampilkan (TIDAK PERNAH nilai rahasia)
 * @property {string} [fix]     langkah perbaikan
 */

export const ICON = /** @type {const} */ ({ ok: '✅', warn: '⚠️ ', fail: '❌', later: '⏳' });

/**
 * Hasil yang wajib sekarang jadi `fail`, yang belum waktunya jadi `later`.
 * @param {boolean} passed
 * @param {boolean} requiredNow
 * @returns {Status}
 */
export function gate(passed, requiredNow) {
  if (passed) return 'ok';
  return requiredNow ? 'fail' : 'later';
}

/**
 * @param {CheckResult[]} results
 * @returns {string}
 */
export function formatReport(results) {
  const lines = [];
  let group = '';
  for (const r of results) {
    if (r.group !== group) {
      group = r.group;
      lines.push('', `── ${group}`);
    }
    lines.push(`  ${ICON[r.status]} ${r.name}${r.detail ? `  · ${r.detail}` : ''}`);
  }
  const fixes = results.filter((r) => (r.status === 'fail' || r.status === 'warn') && r.fix);
  if (fixes.length > 0) {
    lines.push('', '── Yang perlu dilakukan');
    for (const r of fixes) lines.push(`  ${ICON[r.status]} ${r.name}: ${r.fix}`);
  }
  const count = (/** @type {Status} */ s) => results.filter((r) => r.status === s).length;
  lines.push(
    '',
    `Ringkasan: ${count('ok')} ok · ${count('warn')} peringatan · ${count('fail')} gagal · ${count('later')} belum waktunya`,
  );
  return lines.join('\n');
}

/** @param {CheckResult[]} results */
export function exitCode(results) {
  return results.some((r) => r.status === 'fail') ? 1 : 0;
}
