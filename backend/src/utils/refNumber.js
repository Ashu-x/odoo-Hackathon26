const prefixes = {
  receipt: 'REC',
  delivery: 'DEL',
  transfer: 'INT',
  adjustment: 'ADJ',
};

export function createReferenceNumber(type) {
  const prefix = prefixes[type];
  if (!prefix) throw new Error(`Unknown reference type: ${type}`);
  const year = new Date().getFullYear();
  const suffix = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `${prefix}-${year}-${suffix}`;
}
