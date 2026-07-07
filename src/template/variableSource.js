/**
 * Normalise a variable definition into quill-mention item shape.
 * Accepts a flat map { key: value } or an array [{ id, label }].
 * @returns {Array<{id: string, value: string}>}
 */
export function toVariableList(variables) {
  if (!variables) return [];
  if (Array.isArray(variables)) {
    return variables.map((v) => ({ id: v.id, value: v.label || v.id }));
  }
  return Object.keys(variables).map((key) => ({ id: key, value: key }));
}

/**
 * Build a quill-mention `source` function that filters a variable list by
 * case-insensitive substring match on the display value.
 * @param {Array<{id: string, value: string}>} variableList
 * @returns {(searchTerm: string, renderList: Function) => void}
 */
export function createMentionSource(variableList) {
  return function source(searchTerm, renderList) {
    const term = (searchTerm || "").toLowerCase();
    const matches = variableList.filter((item) =>
      item.value.toLowerCase().includes(term)
    );
    renderList(matches, searchTerm);
  };
}
