/**
 * Pure tree operations for the boxed "layout" block.
 *
 * A layout is a binary split tree:
 *   cell  — { type:"cell", heading, content, borders:{top,right,bottom,left} }
 *   split — { type:"split", direction:"vertical"|"horizontal",
 *             ratio:[a,b], children:[nodeA, nodeB] }
 *
 * Every split is one drawn line: vertical = a vertical line (side-by-side
 * children), horizontal = a horizontal line (stacked children). Cells are
 * addressed by a path of child indexes from the root (e.g. [0,1]); in the DOM
 * the path is serialized as "0.1" (root = "").
 *
 * All operations are immutable — they return a new root.
 */

export function defaultCell() {
  return {
    type: "cell",
    heading: "",
    content: "",
    minHeight: 0,
    borders: { top: true, right: true, bottom: true, left: true },
  };
}

/** Coerce any stored/legacy value into a valid tree node. */
export function normalizeNode(node) {
  if (!node || typeof node !== "object") return defaultCell();
  if (node.type === "split") {
    const children = Array.isArray(node.children) ? node.children : [];
    const ratio =
      Array.isArray(node.ratio) &&
      node.ratio.length === 2 &&
      node.ratio[0] > 0 &&
      node.ratio[1] > 0
        ? node.ratio
        : [50, 50];
    return {
      type: "split",
      direction: node.direction === "horizontal" ? "horizontal" : "vertical",
      ratio,
      children: [normalizeNode(children[0]), normalizeNode(children[1])],
    };
  }
  const b = node.borders || {};
  return {
    type: "cell",
    heading: typeof node.heading === "string" ? node.heading : "",
    content: typeof node.content === "string" ? node.content : "",
    minHeight:
      typeof node.minHeight === "number" && node.minHeight > 0
        ? Math.min(2000, Math.round(node.minHeight))
        : 0,
    borders: {
      top: !!b.top,
      right: !!b.right,
      bottom: !!b.bottom,
      left: !!b.left,
    },
  };
}

export function parsePath(str) {
  if (str == null || str === "") return [];
  return String(str)
    .split(".")
    .map((n) => (n === "1" ? 1 : 0));
}

export function pathToString(path) {
  return (path || []).join(".");
}

export function getNode(root, path) {
  let node = root;
  for (let i = 0; i < path.length; i++) {
    if (!node || node.type !== "split") return null;
    node = node.children[path[i]];
  }
  return node || null;
}

/** Replace the node at `path` with `newNode`; returns a new root. */
export function updateAt(root, path, newNode) {
  if (path.length === 0) return newNode;
  const idx = path[0];
  const children = root.children.slice();
  children[idx] = updateAt(root.children[idx], path.slice(1), newNode);
  return { ...root, children };
}

/**
 * Split the cell at `path` into two: the existing cell keeps its content and
 * an empty cell is added after it (right for vertical, below for horizontal).
 */
export function splitAt(root, path, direction) {
  const node = getNode(root, path);
  if (!node || node.type !== "cell") return root;
  const empty = defaultCell();
  empty.borders = { ...node.borders };
  return updateAt(root, path, {
    type: "split",
    direction: direction === "horizontal" ? "horizontal" : "vertical",
    ratio: [50, 50],
    children: [node, empty],
  });
}

/**
 * Merge the cell at `path` with its sibling: the parent split is replaced by
 * THIS cell, so the clicked cell keeps its content and takes the whole space
 * (the line the split created disappears, along with the sibling subtree).
 * A root cell cannot merge.
 */
export function mergeAt(root, path) {
  if (path.length === 0) return root;
  const parentPath = path.slice(0, -1);
  const parent = getNode(root, parentPath);
  if (!parent || parent.type !== "split") return root;
  const kept = getNode(root, path);
  return updateAt(root, parentPath, kept);
}

/**
 * Width of the cell at `path` as a % of its nearest ancestor vertical split,
 * or null when no ancestor vertical split exists (full-width cell).
 */
export function getWidthAt(root, path) {
  const found = nearestVerticalSplit(root, path);
  if (!found) return null;
  return found.split.ratio[found.childIdx];
}

/** Set the width % of the cell's branch in its nearest ancestor vertical split. */
export function setWidthAt(root, path, pct) {
  const found = nearestVerticalSplit(root, path);
  if (!found) return root;
  const p = Math.min(95, Math.max(5, Number(pct) || 50));
  const ratio = found.childIdx === 0 ? [p, 100 - p] : [100 - p, p];
  return updateAt(root, found.path, { ...found.split, ratio });
}

function nearestVerticalSplit(root, path) {
  let node = root;
  let found = null;
  for (let i = 0; i < path.length; i++) {
    if (!node || node.type !== "split") return null;
    if (node.direction === "vertical") {
      found = { split: node, path: path.slice(0, i), childIdx: path[i] };
    }
    node = node.children[path[i]];
  }
  return found;
}
