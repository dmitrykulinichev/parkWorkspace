// Спільне для інструментів: змінні сценарію й тривалість кадру під репліку.
export const fillVars = (scenario) => {
  const vars = scenario.vars ?? {}
  const text = (t) => String(t ?? '').replace(/\{(\w+)\}/g, (m, k) => (k in vars ? String(vars[k]) : m))
  const deep = (n) => (typeof n === 'string' ? text(n) : Array.isArray(n) ? n.map(deep) : n && typeof n === 'object' ? Object.fromEntries(Object.entries(n).map(([k, v]) => [k, deep(v)])) : n)
  return deep
}
export const words = (text) => String(text).split(/\s+/).filter((w) => /[\p{L}\p{N}]/u.test(w)).length
/** Скільки кадр стоїть після дії: репліка за темпом + запас, або явно `hold` у кроці (с). */
export const holdMs = (scenario, step) =>
  Math.round((step.hold ?? words(fillVars(scenario)(step.say)) / (scenario.wordsPerSecond ?? 2.5) + (scenario.tailSeconds ?? 0.7)) * 1000)
