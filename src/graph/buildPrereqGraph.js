import dagre from "@dagrejs/dagre";
import { MarkerType, Position } from "@xyflow/react";

const COURSE_SIZE = { width: 170, height: 52 };
const OPERATOR_SIZE = { width: 56, height: 52 };

// Converts Team B's /prereq-graph/{course_id} response (Cytoscape.js JSON)
//  into React Flow nodes and edges.

export function buildPrereqGraph(graphData, targetCourseId) {
  const targetId = String(targetCourseId);
  const rawNodes = graphData?.elements?.nodes ?? [];
  const rawEdges = graphData?.elements?.edges ?? [];

  const nodes = rawNodes.map(({ data }) => {
    const id = String(data.id);

    if (data.node_type === "group") {
      return {
        id,
        type: "operator",
        data: { operator: data.operator?.toUpperCase() },
      };
    }

    return {
      id,
      type: "course",
      data: {
        label: data.course_identifier ?? `Course ${id}`,
        title: data.label,
        target: id === targetId,
      },
    };
  });

  const nodeIds = new Set(nodes.map((node) => node.id));

  const edges = rawEdges
    .map(({ data }, index) => {
      const source = String(data.source);
      const target = String(data.target);
      const labels = [];

      if (data.negative_prerequisite) labels.push("must not have");
      if (data.min_grade) labels.push(`${data.min_grade} or better`);
      if (data.concurrent_allowed) labels.push("can be concurrent");

      return {
        id: `e${index}-${source}-${target}`,
        source,
        target,
        label: labels.length ? labels.join(" · ") : undefined,
        animated: Boolean(data.concurrent_allowed),
        markerEnd: { type: MarkerType.ArrowClosed, width: 16, height: 16 },
        className: data.negative_prerequisite ? "is-negative" : undefined,
      };
    })
    .filter((edge) => nodeIds.has(edge.source) && nodeIds.has(edge.target));

  return { nodes, edges };
}

export function layoutGraph(nodes, edges) {
  const g = new dagre.graphlib.Graph()
    .setGraph({ rankdir: "LR", nodesep: 24, ranksep: 80 })
    .setDefaultEdgeLabel(() => ({}));

  // dagre writes x/y onto the object passed in, so each node needs its own copy.
  nodes.forEach((n) =>
    g.setNode(n.id, {
      ...(n.type === "operator" ? OPERATOR_SIZE : COURSE_SIZE),
    }),
  );
  edges.forEach((e) => g.setEdge(e.source, e.target));
  dagre.layout(g);

  return nodes.map((n) => {
    const { x, y, width, height } = g.node(n.id);
    // Width, height, and handles have to be on the node up front. React Flow
    // will not draw edges until it knows them, and a controlled flow does not
    // keep the measured sizes unless they are already here.
    return {
      ...n,
      width,
      height,
      measured: { width, height },
      handles: [
        {
          type: "target",
          position: Position.Left,
          x: 0,
          y: height / 2,
          width: 1,
          height: 1,
        },
        {
          type: "source",
          position: Position.Right,
          x: width,
          y: height / 2,
          width: 1,
          height: 1,
        },
      ],
      position: { x: x - width / 2, y: y - height / 2 },
    };
  });
}
