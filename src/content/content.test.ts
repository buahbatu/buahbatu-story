// Validasi konten ASLI repo. Dijalankan oleh `npm test` dan `npm run validate:content`.
// Desain: docs/03-standar-kode.md §5
import { describe, expect, it } from 'vitest';

import { rawContent } from './index';
import { CONTENT_SCHEMAS } from './registry';
import { formatIssues, validateContent } from './validate';

describe('konten src/content', () => {
  it('semua file JSON valid dan terdaftar', () => {
    const issues = validateContent(rawContent, CONTENT_SCHEMAS);
    expect(issues, formatIssues(issues)).toEqual([]);
  });

  it('konten personal tidak pernah ikut dimuat ke bundle', () => {
    expect(Object.keys(rawContent).filter((file) => file.startsWith('personal'))).toEqual([]);
  });
});
