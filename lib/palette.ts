// Cluster colors shared by the topic map, charts and post lists —
// color follows the topic everywhere on the page.
export const PALETTE = [
  '#ffd94d',
  '#a78bfa',
  '#ff9a3d',
  '#5eead4',
  '#f472b6',
  '#93c5fd',
  '#bef264',
  '#fca5a5',
  '#fdba74',
  '#c4b5fd',
];

export const colorOf = (clusterId: number) => PALETTE[clusterId % PALETTE.length];
