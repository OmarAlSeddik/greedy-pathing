export type Node = {
  id: number;
  x: number;
  y: number;
  visited?: boolean;
};

export type Edge = {
  start: Node;
  end: Node;
  weight: number;
  selected?: boolean;
};
