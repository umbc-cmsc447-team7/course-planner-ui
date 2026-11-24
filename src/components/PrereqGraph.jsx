import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Background,
  Controls,
  Handle,
  Position,
  ReactFlow,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { getPrereqGraph } from "../api/courseAPI";
import { buildPrereqGraph, layoutGraph } from "../graph/buildPrereqGraph";
import "./PrereqGraph.css";

function CourseNode({ data }) {
  const className = ["prereq-node", data.target && "is-target"]
    .filter(Boolean)
    .join(" ");

  return (
    // Every course gets both handles: in a multi-level graph a course can be
    // a prerequisite of one course and have prerequisites of its own.
    <div className={className} title={data.title}>
      <Handle type="target" position={Position.Left} />
      {data.target ? (
        <strong>{data.label}</strong>
      ) : (
        <Link to={`/catalog/${encodeURIComponent(data.label)}`}>
          {data.label}
        </Link>
      )}
      {data.title && <span className="prereq-node-title">{data.title}</span>}
      <Handle type="source" position={Position.Right} />
    </div>
  );
}

function OperatorNode({ data }) {
  return (
    <div
      className="prereq-operator"
      title={
        data.operator === "AND"
          ? "All of these are required"
          : data.operator === "OR"
            ? "One of these is required"
            : undefined
      }
    >
      <Handle type="target" position={Position.Left} />
      {data.operator ?? "?"}
      <Handle type="source" position={Position.Right} />
    </div>
  );
}

const nodeTypes = { course: CourseNode, operator: OperatorNode };

function GraphCanvas({ graphData, courseId }) {
  const navigate = useNavigate();
  const { nodes, edges } = useMemo(() => {
    const graph = buildPrereqGraph(graphData, courseId);
    return { nodes: layoutGraph(graph.nodes, graph.edges), edges: graph.edges };
  }, [graphData, courseId]);

  return (
    <div className="prereq-graph">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        // Without a click handler React Flow disables pointer events on
        // non-selectable nodes, which would also block the links inside them.
        onNodeClick={(event, node) => {
          if (node.type !== "course" || node.data.target) return;
          event.preventDefault();
          navigate(`/catalog/${encodeURIComponent(node.data.label)}`);
        }}
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

// Loads the full prerequisite graph for one course from Team B's graph
// service. It loads on its own so the rest of the course page still works
// when that service is down.
export default function PrereqGraph({ courseId }) {
  const [retry, setRetry] = useState(0);
  // `key` records which request the result belongs to; anything else
  // (a different course, or a retry) means we're still loading.
  const requestKey = `${courseId}:${retry}`;
  const [result, setResult] = useState({
    key: null,
    error: "",
    graphData: null,
  });

  useEffect(() => {
    let active = true;

    getPrereqGraph(courseId)
      .then((graphData) => {
        if (active) setResult({ key: requestKey, error: "", graphData });
      })
      .catch((error) => {
        if (active) {
          setResult({
            key: requestKey,
            error: error.message || "Unable to load the prerequisite graph.",
            graphData: null,
          });
        }
      });

    return () => {
      active = false;
    };
  }, [courseId, requestKey]);

  const loading = result.key !== requestKey;
  const { error, graphData } = result;
  const hasPrerequisites = (graphData?.elements?.edges?.length ?? 0) > 0;

  if (loading) {
    return (
      <p className="courses-muted" role="status">
        Loading prerequisite graph…
      </p>
    );
  }

  if (error) {
    return (
      <div role="alert">
        <p>The prerequisite graph is unavailable right now. ({error})</p>
        <button
          className="courses-button"
          onClick={() => setRetry((value) => value + 1)}
        >
          Try again
        </button>
      </div>
    );
  }

  if (!graphData) {
    return <p>This course is not in the prerequisite graph yet.</p>;
  }

  if (!hasPrerequisites) {
    return <p>This course has no prerequisites.</p>;
  }

  return <GraphCanvas graphData={graphData} courseId={courseId} />;
}
