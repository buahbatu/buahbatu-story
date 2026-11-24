export type DialogRequest = { type: 'advance' } | { type: 'pick'; index: number } | { type: 'toggleLog' };

const queue: DialogRequest[] = [];

export const requestDialog = (r: DialogRequest): void => {
  queue.push(r);
};

export const drainDialogRequests = (): DialogRequest[] => queue.splice(0, queue.length);
