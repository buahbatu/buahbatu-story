// Snapshot visual layar penting. Baseline per project & OS (e2e/__screenshots__/).
// Perubahan tampilan yang disengaja → `npm run e2e:update`, lalu AI menilai gambarnya (docs/50 §5).
import { expect, test } from './fixtures';

test('layar judul', async ({ game: { page } }) => {
  await page.evaluate(() => window.__BB__?.freeze(true));
  await expect(page).toHaveScreenshot('title.png');
});

test('toast di atas layar judul', async ({ game: { page } }) => {
  await page.evaluate(() => {
    window.__BB__?.freeze(true);
    window.__BB__?.emit({ type: 'ui/toast', key: 'error.internal' });
    window.__BB__?.emit({ type: 'ui/toast', key: 'title.version', params: { version: 'e2e' } });
  });
  await expect(page.locator('.toast')).toHaveCount(2);
  await expect(page).toHaveScreenshot('title-toast.png');
});
