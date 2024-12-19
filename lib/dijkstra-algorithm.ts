import { Edge, Node } from "./types";

export default function dijkstraAlgorithm(nodes: Node[], edges: Edge[], sourceId: number) {
  const snapshots: { nodes: Node[]; edges: Edge[] }[] = [];
  const distances: Map<number, number> = new Map();
  const previous: Map<number, number | null> = new Map();

  nodes.forEach((node) => {
    distances.set(node.id, Infinity);
    previous.set(node.id, null);
  });

  distances.set(sourceId, 0);

  const unvisitedNodes = new Set(nodes.map((node) => node.id));

  while (unvisitedNodes.size > 0) {
    const currentNodeId = Array.from(unvisitedNodes).reduce((minNodeId, nodeId) =>
      distances.get(nodeId)! < distances.get(minNodeId)! ? nodeId : minNodeId
    );

    unvisitedNodes.delete(currentNodeId);

    edges.forEach((edge) => {
      if (edge.start.id === currentNodeId || edge.end.id === currentNodeId) {
        const neighborId = edge.start.id === currentNodeId ? edge.end.id : edge.start.id;
        const newDistance = distances.get(currentNodeId)! + edge.weight;

        if (newDistance < distances.get(neighborId)!) {
          distances.set(neighborId, newDistance);
          previous.set(neighborId, currentNodeId);

          snapshots.push({
            nodes: nodes.map((node) =>
              node.id === neighborId || node.id === currentNodeId
                ? { ...node, visited: true }
                : node
            ),
            edges: [...edges],
          });
        }
      }
    });
  }

  return snapshots;
}
