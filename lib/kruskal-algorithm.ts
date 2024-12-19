import { Edge, Node } from "./types";

export default function kruskalAlgorithm(nodes: Node[], edges: Edge[]) {
  const snapshots: { nodes: Node[]; edges: Edge[] }[] = [];
  const mstEdges: Edge[] = [];
  const parent = new Map<number, number>();

  nodes.forEach((node) => parent.set(node.id, node.id));

  const find = (nodeId: number): number => {
    if (parent.get(nodeId) !== nodeId) {
      parent.set(nodeId, find(parent.get(nodeId)!));
    }
    return parent.get(nodeId)!;
  };

  const union = (nodeA: number, nodeB: number) => {
    const rootA = find(nodeA);
    const rootB = find(nodeB);
    if (rootA !== rootB) parent.set(rootA, rootB);
  };

  const sortedEdges = [...edges].sort((a, b) => a.weight - b.weight);

  for (const edge of sortedEdges) {
    if (find(edge.start.id) !== find(edge.end.id)) {
      union(edge.start.id, edge.end.id);
      mstEdges.push({ ...edge, selected: true });

      snapshots.push({
        nodes: [...nodes],
        edges: edges.map((e) => (mstEdges.includes(e) ? { ...e, selected: true } : e)),
      });
    }
  }

  return snapshots;
}
