import { useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Background,
  Controls,
  Handle,
  Position,
  ReactFlow,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { buildPrereqGraph, layoutGraph } from "../graph/buildPrereqGraph";
import "./PrereqGraph.css";

function CourseNode({ data }) {
  const className = [
    "prereq-node",
    data.target && "is-target",
    data.negative && "is-negative",
    data.status && `status-${data.status}`,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={className} title={data.title}>
      {!data.target && <Handle type="source" position={Position.Right} />}
      {data.target && <Handle type="target" position={Position.Left} />}

      {data.negative && <span className="prereq-node-flag">Must not have</span>}
      {data.target ? (
        <strong>{data.label}</strong>
      ) : (
        <Link to={`/catalog/${encodeURIComponent(data.label)}`}>
          {data.label}
        </Link>
      )}
      {data.title && <span className="prereq-node-title">{data.title}</span>}
    </div>
  );
}

function OperatorNode({ data }) {
  return (
    <div className="prereq-operator">
      <Handle type="target" position={Position.Left} />
      {data.operator ?? "?"}
      <Handle type="source" position={Position.Right} />
    </div>
  );
}

const nodeTypes = { course: CourseNode, operator: OperatorNode };

export default function PrereqGraph({ course, groups, prerequisiteCourses }) {
  const { nodes, edges } = useMemo(() => {
    const graph = buildPrereqGraph(course, groups, prerequisiteCourses);
    return { nodes: layoutGraph(graph.nodes, graph.edges), edges: graph.edges };
  }, [course, groups, prerequisiteCourses]);

  return (
    <div className="prereq-graph">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        minZoom={0.2}
        fitView
        fitViewOptions={{ padding: 0.1 }}
        proOptions={{ hideAttribution: true }}
      >
        <Background />
        <Controls position="top-right" showInteractive={false} />
      </ReactFlow>
    </div>
  );
}
