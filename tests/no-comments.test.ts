import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import ts from 'typescript';
import { describe, expect, it } from 'vitest';

const root = join(import.meta.dirname, '..');
const tracked = execFileSync('git', ['ls-files'], { cwd: root, encoding: 'utf8' }).split('\n');
const code = tracked.filter((f) => /\.(tsx?|mjs|js)$/.test(f));
const css = tracked.filter((f) => /\.(css|html)$/.test(f));

function comments(file: string): string[] {
  const text = readFileSync(join(root, file), 'utf8');
  const kind = file.endsWith('.tsx') ? ts.ScriptKind.TSX : /\.m?js$/.test(file) ? ts.ScriptKind.JS : ts.ScriptKind.TS;
  const sf = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, kind);
  const found = new Set<string>();
  const visit = (node: ts.Node) => {
    for (const r of [
      ...(ts.getLeadingCommentRanges(text, node.getFullStart()) ?? []),
      ...(ts.getTrailingCommentRanges(text, node.getEnd()) ?? []),
    ])
      found.add(text.slice(r.pos, r.end));
    node.getChildren(sf).forEach(visit);
  };
  visit(sf);
  return [...found];
}

describe('kode tanpa komentar (ADR-019)', () => {
  it('ada file yang diperiksa', () => {
    expect(code.length).toBeGreaterThan(50);
  });
  it.each(code)('%s', (file) => {
    expect(comments(file)).toEqual([]);
  });
  it.each(css)('%s', (file) => {
    expect(readFileSync(join(root, file), 'utf8').match(/\/\*[\s\S]*?\*\//g) ?? []).toEqual([]);
  });
});
