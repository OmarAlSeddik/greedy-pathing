/* eslint-disable  @typescript-eslint/no-explicit-any */
import dijkstraAlgorithm from "@/lib/dijkstra-algorithm";
import kruskalAlgorithm from "@/lib/kruskal-algorithm";
import primAlgorithm from "@/lib/prim-algorithm";
import { Edge, Node } from "@/lib/types";
import React, { useEffect, useState } from "react";
import { Circle, Layer, Line, Stage, Text } from "react-konva";

export default function GraphCanvas() {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [isDrawingEdge, setIsDrawingEdge] = useState(false);
  const [tempEdge, setTempEdge] = useState<Node | null>(null);
  const [mousePosition, setMousePosition] = useState<{ x: number; y: number } | null>(null);
  const [hoveredNode, setHoveredNode] = useState<Node | null>(null);
  const [hoveredEdge, setHoveredEdge] = useState<Edge | null>(null);
  const [currentSnapshotIndex, setCurrentSnapshotIndex] = useState(0);
  const [snapshots, setSnapshots] = useState<{ nodes: Node[]; edges: Edge[] }[]>([]);

  const NODE_RADIUS = 20;
  const CLICK_RADIUS = NODE_RADIUS + 10;

  const getDistance = (x1: number, y1: number, x2: number, y2: number) => {
    return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
  };

  const findNearestNode = (x: number, y: number): Node | null => {
    for (const node of nodes) {
      const distance = getDistance(node.x, node.y, x, y);
      if (distance <= CLICK_RADIUS) {
        return node;
      }
    }
    return null;
  };

  const calculateWeightPosition = (start: Node, end: Node) => {
    const midX = (start.x + end.x) / 2;
    const midY = (start.y + end.y) / 2;
    const angle = Math.atan2(end.y - start.y, end.x - start.x);

    const offset = 15;
    const offsetX = offset * Math.cos(angle + Math.PI / 2);
    const offsetY = offset * Math.sin(angle + Math.PI / 2);

    return { x: midX + offsetX, y: midY + offsetY };
  };

  const handleCanvasClick = (event: any) => {
    const { offsetX, offsetY } = event.evt;
    if (event.target.name() === "canvas") {
      const nearestNode = findNearestNode(offsetX, offsetY);

      if (nearestNode) {
        handleNodeClick(nearestNode);
      } else {
        setNodes((prev) => [...prev, { id: prev.length + 1, x: offsetX, y: offsetY }]);
      }
    }
  };

  const handleNodeClick = (node: Node) => {
    if (isDrawingEdge) {
      if (tempEdge?.id === node.id) {
        alert("Cannot create an edge to the same node.");
        setIsDrawingEdge(false);
        setTempEdge(null);
        return;
      }

      const weight = parseFloat(prompt("Enter edge weight") || "1");
      setEdges((prev) => [...prev, { start: tempEdge as Node, end: node, weight }]);
      setIsDrawingEdge(false);
      setTempEdge(null);
    } else {
      setIsDrawingEdge(true);
      setTempEdge(node);
    }
  };

  const handleNodeDragEnd = (event: any, nodeId: number) => {
    const { x, y } = event.target.position();

    setNodes((prev) => prev.map((node) => (node.id === nodeId ? { ...node, x, y } : node)));

    setEdges((prev) =>
      prev.map((edge) => {
        if (edge.start.id === nodeId) {
          return { ...edge, start: { ...edge.start, x, y } };
        }
        if (edge.end.id === nodeId) {
          return { ...edge, end: { ...edge.end, x, y } };
        }
        return edge;
      })
    );
  };

  const handleEdgeClick = (edge: Edge) => {
    const newWeight = prompt("Enter new weight or type 'delete' to remove this edge");
    if (newWeight?.toLowerCase() === "delete") {
      setEdges((prev) => prev.filter((e) => e !== edge));
    } else if (!isNaN(parseFloat(newWeight || ""))) {
      setEdges((prev) =>
        prev.map((e) => (e === edge ? { ...e, weight: parseFloat(newWeight || "1") } : e))
      );
    }
  };

  const handleMouseMove = (event: any) => {
    const { offsetX, offsetY } = event.evt;
    setMousePosition({ x: offsetX, y: offsetY });
  };

  const visualizeAlgorithm = (algorithm: "prim" | "kruskal" | "dijkstra") => {
    let generatedSnapshots: { nodes: Node[]; edges: Edge[] }[] = [];
    if (algorithm === "prim") generatedSnapshots = primAlgorithm(nodes, edges);
    if (algorithm === "kruskal") generatedSnapshots = kruskalAlgorithm(nodes, edges);
    if (algorithm === "dijkstra") {
      const sourceId = parseInt(prompt("Enter Source Node ID") || "1");
      generatedSnapshots = dijkstraAlgorithm(nodes, edges, sourceId);
    }
    setSnapshots(generatedSnapshots);
    setCurrentSnapshotIndex(0);
  };

  useEffect(() => {
    if (snapshots.length > 0) {
      const interval = setInterval(() => {
        setCurrentSnapshotIndex((prev) => {
          if (prev < snapshots.length - 1) return prev + 1;
          clearInterval(interval);
          return prev;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [snapshots]);

  useEffect(() => {
    if (snapshots.length > 0 && currentSnapshotIndex < snapshots.length) {
      const currentSnapshot = snapshots[currentSnapshotIndex];
      setNodes(currentSnapshot.nodes);
      setEdges(currentSnapshot.edges);
    }
  }, [currentSnapshotIndex, snapshots]);

  const currentSnapshot = snapshots[currentSnapshotIndex] || { nodes, edges };

  return (
    <>
      <div className="flex border rounded divide-x text-[#80002a] overflow-hidden">
        <button
          className="px-4 py-2 hover:bg-[#80002a] hover:text-white transition"
          onClick={() => visualizeAlgorithm("prim")}
        >
          Run Prim&apos;s
        </button>
        <button
          className="px-4 py-2 hover:bg-[#80002a] hover:text-white transition"
          onClick={() => visualizeAlgorithm("kruskal")}
        >
          Run Kruskal&apos;s
        </button>
        <button
          className="px-4 py-2 hover:bg-[#80002a] hover:text-white transition"
          onClick={() => visualizeAlgorithm("dijkstra")}
        >
          Run Dijkstra&apos;s
        </button>
      </div>
      <Stage
        name="canvas"
        width={window.innerWidth * 0.6}
        height={window.innerHeight * 0.6}
        onClick={(event) => !isDrawingEdge && handleCanvasClick(event)}
        onMouseMove={handleMouseMove}
        className="border border-black w-[60%] rounded"
      >
        <Layer>
          {isDrawingEdge && tempEdge && mousePosition && (
            <Line
              points={[tempEdge.x, tempEdge.y, mousePosition.x, mousePosition.y]}
              stroke="#00805580"
              dash={[10, 5]}
            />
          )}

          {currentSnapshot.edges.map((edge, index) => {
            const weightPosition = calculateWeightPosition(edge.start, edge.end);
            return (
              <React.Fragment key={index}>
                <Line
                  points={[edge.start.x, edge.start.y, edge.end.x, edge.end.y]}
                  stroke={hoveredEdge === edge ? "#008055" : edge.selected ? "#008055" : "black"}
                  strokeWidth={hoveredEdge === edge ? 8 : 4}
                  onMouseEnter={() => setHoveredEdge(edge)}
                  onMouseLeave={() => setHoveredEdge(null)}
                  onClick={() => handleEdgeClick(edge)}
                />
                <Text
                  x={weightPosition.x}
                  y={weightPosition.y}
                  text={edge.weight.toString()}
                  fill="#80002a"
                  fontSize={20}
                  fontStyle="bold"
                />
              </React.Fragment>
            );
          })}

          {currentSnapshot.nodes.map((node) => (
            <Circle
              key={node.id}
              x={node.x}
              y={node.y}
              radius={20}
              fill={
                hoveredNode?.id === node.id
                  ? "#008055"
                  : tempEdge?.id === node.id
                  ? "#008055"
                  : "#80002a"
              }
              stroke={isDrawingEdge && tempEdge?.id !== node.id ? "#008055" : "black"}
              strokeWidth={isDrawingEdge ? 3 : 1}
              draggable
              onDragEnd={(e) => handleNodeDragEnd(e, node.id)}
              onClick={() => handleNodeClick(node)}
              onMouseEnter={() => setHoveredNode(node)}
              onMouseLeave={() => setHoveredNode(null)}
            />
          ))}

          {currentSnapshot.nodes.map((node) => (
            <Text
              key={`label-${node.id}`}
              x={node.x - 20}
              y={node.y - 40}
              text={`Node ${node.id}`}
              fill="#80002a"
              fontSize={20}
              fontStyle="bold"
            />
          ))}
        </Layer>
      </Stage>

      <button
        className="px-4 py-2 mt-4 hover:bg-[#80002a] hover:text-white transition rounded border"
        onClick={() => {
          setNodes([]);
          setEdges([]);
          setSnapshots([]);
          setCurrentSnapshotIndex(0);
        }}
      >
        Reset Graph
      </button>
    </>
  );
}
