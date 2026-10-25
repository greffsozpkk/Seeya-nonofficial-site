/* Shared scoring for the approved 20/60/MAX fan questionnaire. Not a validated clinical scale. */
(function(root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.ClinicMaxScore = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function() {
  'use strict';
  function inventory(q, value) {
    const answers = value && typeof value === 'object' && !Array.isArray(value) ? value : {};
    const allowed = new Set(q.states.map(s => s.value));
    const groups = [...new Set(q.items.map(i => i.group))];
    let selected = 0, unused = 0, unanswered = 0;
    for (const item of q.items) {
      const v = answers[item.id];
      if (!allowed.has(v)) unanswered++;
      else if (v === 'seeya') selected++;
      else if (v === 'unused') unused++;
    }
    const domains = groups.map(name => {
      const values = q.items.filter(i => i.group === name).map(i => answers[i.id]);
      if (values.includes('seeya')) return {name, low: 1, high: 1, known: 1};
      if (values.some(v => !allowed.has(v)) || values.every(v => v === 'unused')) return {name, low: 0, high: 0, known: 0};
      return {name, low: 0, high: 0, known: 1};
    });
    const mean = key => domains.reduce((n, d) => n + d[key], 0) / domains.length;
    return {selected, unused, unanswered, complete: unanswered === 0, domains,
      low: mean('low'), high: mean('high'), known: mean('known')};
  }
  function answered(q, value) {
    if (q.kind === 'inventory') return inventory(q, value).complete;
    return q.choices.some(c => c.value === value);
  }
  function bound(q, value) {
    if (q.kind === 'inventory') return inventory(q, value);
    if (Object.prototype.hasOwnProperty.call(q.scoreValues || {}, value) && typeof value === 'string') {
      const n = q.scoreValues[value];
      return {low: n, high: n, known: 1};
    }
    return {low: 0, high: 0, known: 0};
  }
  function range(low, high) {
    const exact = Math.abs(high - low) < 1e-8;
    return {low: exact ? Math.round(low) : Math.floor(low + 1e-8),
      high: exact ? Math.round(high) : Math.ceil(high - 1e-8), exact};
  }
  function forForm(data, mode = 'max') {
    if (!data.forms) return data;
    const form = data.forms[mode];
    if (!form) throw new Error('알 수 없는 문항 구성입니다.');
    const bank = Object.fromEntries(data.questions.map(q => [q.id, q]));
    const questions = form.ids.map((id, index) => {
      const q = bank[id];
      if (!q) throw new Error('선정 문항을 찾을 수 없습니다.');
      return {...q, number:index+1, ...(Object.prototype.hasOwnProperty.call(form.weights,id) ? {weight:form.weights[id]} : {})};
    });
    return {...data, questions, counts:form.counts, selectedForm:form, selectedMode:mode};
  }
  function score(source, answers = {}, mode = 'max') {
    const data = forForm(source, mode);
    const axisResults = {};
    for (const [axis, def] of Object.entries(data.axes)) {
      const qs = data.questions.filter(q => q.axis === axis);
      const left = qs.filter(q => answers[q.id] === 'left').length;
      const right = qs.filter(q => answers[q.id] === 'right').length;
      const valid = left + right, ready = valid >= Math.ceil(qs.length * .8);
      const rawTie = ready && left === right;
      const policy = data.scoring?.preferenceTieBreak || {};
      const preferred = policy.priority?.[axis] || [];
      const candidates = [...preferred, ...qs.map(q => q.id).sort()];
      const availableIds = new Set(qs.map(q => q.id));
      const tieBreakQuestionId = rawTie ? candidates.find(id => availableIds.has(id) && ['left','right'].includes(answers[id])) || null : null;
      const tieBreakSide = tieBreakQuestionId ? answers[tieBreakQuestionId] : null;
      const tieBreakWeight = tieBreakSide ? (Number.isFinite(policy.bonus) && policy.bonus > 0 && policy.bonus < 1 ? policy.bonus : .5) : 0;
      // Only resolve exact ties. A representative answer never overturns a majority.
      const weightedLeft = left + (tieBreakSide === 'left' ? tieBreakWeight : 0);
      const weightedRight = right + (tieBreakSide === 'right' ? tieBreakWeight : 0);
      const weightTotal = weightedLeft + weightedRight;
      const leftPercent = ready ? Math.round(weightedLeft / weightTotal * 100) : null;
      axisResults[axis] = {left, right, valid, total: qs.length, ready,
        rawTie, tieResolved: !!tieBreakSide, tieBreakQuestionId, tieBreakSide, tieBreakWeight,
        weightedLeft, weightedRight, weightTotal,
        rawLeftPercent: ready ? Math.round(left / valid * 100) : null,
        rawRightPercent: ready ? 100 - Math.round(left / valid * 100) : null,
        leftPercent, rightPercent: ready ? 100 - leftPercent : null,
        pole: ready && weightedLeft !== weightedRight ? (weightedLeft > weightedRight ? def.left : def.right) : null,
        nearBoundary: ready && Math.abs(left - right) <= 2};
    }
    const codes = Object.values(axisResults).map(a => a.pole);
    const typeCode = codes.every(Boolean) ? codes.join('') : null;
    const typeName = data.types.find(t => t.code === typeCode)?.name || null;
    function part(name) {
      const qs = data.questions.filter(q => q.scorePart === name);
      let low = 0, high = 0, known = 0;
      const groups = {}, rows = {};
      for (const q of qs) {
        const b = bound(q, answers[q.id]);
        rows[q.id] = b;
        low += b.low * q.weight; high += b.high * q.weight; known += b.known * q.weight;
        groups[q.scoringGroup] = (groups[q.scoringGroup] || 0) + b.known;
      }
      const max = qs.reduce((n, q) => n + q.weight, 0);
      // Unanswered / unavailable points stay at zero; the denominator stays fixed.
      return {low, high:low, known, max, ready:true, groups, rows, display:range(low,low)};
    }
    const emotion = part('emotion'), behavior = part('behavior');
    const ready = emotion.ready && behavior.ready;
    const observed = data.questions.filter(q => answered(q, answers[q.id])).length;
    return {mode, formLabel:data.selectedForm?.label || 'MAX', typeCode, typeName, axisResults, emotion, behavior, ready,
      total: range(emotion.display.low + behavior.display.low, emotion.display.low + behavior.display.low),
      answered: observed, totalQuestions: data.questions.length};
  }
  return {inventory, answered, bound, range, forForm, score};
});
