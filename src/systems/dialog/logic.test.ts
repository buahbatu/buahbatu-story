import { describe, expect, it } from 'vitest';
import papan from '../../content/dialogs/papan.json';
import { advance, bookOf, choicesOf, choose, fillVars, fullText, moveChoice, startDialog, tick } from './logic';
import { dialogFileSchema, type Dialog } from './schema';

const book = bookOf([dialogFileSchema.parse(papan)]);
const vars = { player: 'Aldi' };

describe('skema dialog', () => {
  it('menolak pilihan > 4, pilihan bukan di baris terakhir, dan id ganda', () => {
    const choices = Array.from({ length: 5 }, (_, i) => ({ text: String(i) }));
    expect(dialogFileSchema.safeParse([{ id: 'a', lines: [{ choices }] }]).success).toBe(false);
    expect(dialogFileSchema.safeParse([{ id: 'a', lines: [{ choices: [{ text: 'x' }] }, { speaker: 'b', text: 'y' }] }]).success).toBe(
      false,
    );
    expect(
      dialogFileSchema.safeParse([
        { id: 'a', lines: [{ speaker: 'b', text: 'y' }] },
        { id: 'a', lines: [{ speaker: 'b', text: 'y' }] },
      ]).success,
    ).toBe(false);
  });
});

describe('alur dialog', () => {
  it('teks muncul huruf demi huruf sesuai kecepatan', () => {
    let s = startDialog(book, 'board_kebun_warga', vars);
    if (!s) throw new Error('dialog tidak ada');
    expect(s.shown).toBe(0);
    s = tick(book, s, 0.5, 40);
    expect(Math.floor(s.shown)).toBe(20);
    s = tick(book, s, 100, 40);
    expect(s.shown).toBe(fullText(book, s).length);
  });

  it('E pertama mempercepat teks, E kedua lanjut baris & mencatat log', () => {
    let s = startDialog(book, 'board_kebun_warga', vars);
    if (!s) throw new Error('dialog tidak ada');
    s = advance(book, s).state;
    expect(s.shown).toBe(fullText(book, s).length);
    expect(s.line).toBe(0);
    s = advance(book, s).state;
    expect(s.line).toBe(1);
    expect(s.shown).toBe(0);
    expect(s.log).toHaveLength(1);
    expect(s.log[0]?.speaker).toBe('papan');
  });

  it('pilihan bisa digeser melingkar dan dipilih; next membuka dialog lanjutan dengan variabel', () => {
    let s = startDialog(book, 'board_kebun_warga', vars);
    if (!s) throw new Error('dialog tidak ada');
    for (let i = 0; i < 4; i++) s = advance(book, s).state;
    expect(choicesOf(book, s)).toHaveLength(3);
    s = moveChoice(book, s, -1);
    expect(s.choice).toBe(2);
    s = moveChoice(book, s, 1);
    expect(s.choice).toBe(0);
    const { state, picked } = choose(book, s, 0);
    expect(picked?.next).toBe('board_kebun_warga_siap');
    expect(state.dialogId).toBe('board_kebun_warga_siap');
    expect(fullText(book, state)).toBe('Hatur nuhun, Aldi! Kebunnya pasti makin subur.');
    expect(state.log.at(-1)).toEqual({ speaker: 'player', text: 'Siap, nanti aku bantu siram!' });
    const end = advance(book, advance(book, state).state).state;
    expect(end.done).toBe(true);
  });

  it('pilihan tanpa next menutup dialog', () => {
    let s = startDialog(book, 'board_kebun_warga', vars);
    if (!s) throw new Error('dialog tidak ada');
    for (let i = 0; i < 4; i++) s = advance(book, s).state;
    expect(choose(book, s, 2).state.done).toBe(true);
  });

  it('dialog yang tidak ada = null; variabel tak dikenal dibiarkan', () => {
    expect(startDialog(book, 'tidak_ada')).toBeNull();
    expect(fillVars('Halo {player} & {partner}', vars)).toBe('Halo Aldi & {partner}');
  });

  it('semua next di konten menunjuk dialog yang ada', () => {
    const missing = [...book.values()].flatMap((d: Dialog) =>
      d.lines.flatMap((l) => ('choices' in l ? l.choices.map((c) => c.next).filter((n): n is string => !!n && !book.has(n)) : [])),
    );
    expect(missing).toEqual([]);
  });
});
