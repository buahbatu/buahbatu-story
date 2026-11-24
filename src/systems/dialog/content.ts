import { rawContent } from '../../content';
import { dialogFileSchema, type Dialog } from './schema';

export const dialogFiles = (): Dialog[][] =>
  Object.entries(rawContent)
    .filter(([file]) => file.startsWith('dialogs/'))
    .map(([, data]) => dialogFileSchema.parse(data));
