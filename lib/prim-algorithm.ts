import { Edge, Node } from "./types";

export default function primAlgorithm(nodes: Node[], edges: Edge[]) {
  const snapshots: { nodes: Node[]; edges: Edge[] }[] = [];
  const mstEdges: Edge[] = [];
  const visitedNodes: Set<number> = new Set();

  visitedNodes.add(nodes[0].id);

  while (visitedNodes.size < nodes.length) {
    const availableEdges = edges.filter(
      (edge) =>
        (visitedNodes.has(edge.start.id) && !visitedNodes.has(edge.end.id)) ||
        (visitedNodes.has(edge.end.id) && !visitedNodes.has(edge.start.id))
    );

    const minEdge = availableEdges.reduce((prev, curr) =>
      prev.weight < curr.weight ? prev : curr
    );

    mstEdges.push(minEdge);
    visitedNodes.add(minEdge.start.id);
    visitedNodes.add(minEdge.end.id);

    snapshots.push({
      nodes: nodes.map((node) => (visitedNodes.has(node.id) ? { ...node, visited: true } : node)),
      edges: edges.map((edge) => (mstEdges.includes(edge) ? { ...edge, selected: true } : edge)),
    });
  }

  return snapshots;
}
