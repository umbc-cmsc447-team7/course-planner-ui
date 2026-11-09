import dagre from "@dagrejs/dagre";

export function buildPrereqGraph(course, groups, prerequisiteCourses) {
    const targetId = `course-${course.course_id}`;
    const nodes = [
      { id: targetId, type: "course", data: { label: course.course_identifier, title: course.course_title, target: true } },
    ];
    const edges = [];
    const seen = new Set();
  
    function addGroup(group, parentId) {
      const id = `group-${group.prerequisite_group_id}`;
      if (seen.has(id)) return;
      seen.add(id);
  
      nodes.push({ id, type: "operator", data: { operator: group.group_operator?.toUpperCase() } });
      edges.push({ id: `${id}->${parentId}`, source: id, target: parentId });
  
      for (const p of group.prerequisites ?? []) {
        const c = prerequisiteCourses[p.prerequisite_course_id];
        const pid = `prereq-${p.prerequisite_id}`;
        nodes.push({
          id: pid,
          type: "course",
          data: {
            label: c?.course_identifier ?? `Course ${p.prerequisite_course_id}`,
            title: c?.course_title,
            negative: p.negative_prerequisite,
            status: "unknown",
          },
        });
        edges.push({
          id: `${pid}->${id}`,
          source: pid,
          target: id,
          label: p.min_grade ? `${p.min_grade} or better` : undefined,
          animated: p.concurrent_allowed,
        });
      }
  
      groups
        .filter((g) => g.parent_group_id === group.prerequisite_group_id)
        .forEach((child) => addGroup(child, id));
    }
  
    groups.filter((g) => g.parent_group_id == null).forEach((root) => addGroup(root, targetId));
    return { nodes, edges };
  }


  export function layoutGraph(nodes, edges) {
    const g = new dagre.graphlib.Graph()
      .setGraph({ rankdir: "LR", nodesep: 24, ranksep: 70 })
      .setDefaultEdgeLabel(() => ({}));
  
    nodes.forEach((n) => g.setNode(n.id, { width: n.type === "operator" ? 56 : 170, height: 52 }));
    edges.forEach((e) => g.setEdge(e.source, e.target));
    dagre.layout(g);
  
    return nodes.map((n) => {
      const { x, y, width, height } = g.node(n.id);
      return { ...n, position: { x: x - width / 2, y: y - height / 2 } };
    });
  }