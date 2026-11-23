// Urutan task TODO.md (P0-10a < P0-10b < P0-11 < P1-01). Dipakai doctor untuk menentukan kebutuhan
// per fase. Murni. Desain: AGENTS.md §4, docs/51 §5

/**
 * @param {string} id mis. "P0-10a"
 * @returns {[number, number, string]}
 */
export function parseTaskId(id) {
  const match = /^P(\d+)-(\d+)([a-z]?)$/.exec(id.trim());
  if (!match) throw new Error(`ID task tidak valid: ${id}`);
  return [Number(match[1]), Number(match[2]), match[3] ?? ''];
}

/**
 * @param {string} a
 * @param {string} b
 * @returns {number} negatif kalau a lebih dulu
 */
export function compareTasks(a, b) {
  const [pa, na, sa] = parseTaskId(a);
  const [pb, nb, sb] = parseTaskId(b);
  return pa - pb || na - nb || sa.localeCompare(sb);
}

/**
 * Task yang sedang/akan dikerjakan: `[~]` pertama, kalau tidak ada `[ ]` pertama.
 * @param {string} todoText isi TODO.md
 * @returns {string | undefined}
 */
export function currentTask(todoText) {
  const find = (/** @type {string} */ mark) =>
    new RegExp(`^- \\[${mark}\\] \\*\\*(P\\d+-\\d+[a-z]?)\\*\\*`, 'm').exec(todoText)?.[1];
  return find('~') ?? find(' ');
}

/**
 * Apakah kebutuhan yang mulai berlaku di `neededFrom` sudah wajib sekarang?
 * @param {string | undefined} current task saat ini (undefined = semua selesai)
 * @param {string} neededFrom
 */
export function isRequiredNow(current, neededFrom) {
  return current === undefined || compareTasks(current, neededFrom) >= 0;
}
