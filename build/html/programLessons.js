/* MUSICATION program lessons (window.ProgramLessons): the lessons that come
   with the program. They are read-only - a teacher copies one (⧉) to change
   it, and the copy remembers where it came from (source_lesson_id).
   Block ids are fixed, so results and assignments keep pointing at the
   same block. Built from solfedzioData.js and the game pages. */
(function (global) {
  'use strict';

  var LE = global.LessonEngine, D = global.SolfedzioData;

  var TOPICS = [
    { id: 'rhythm', ico: '👏' },
    { id: 'notation', ico: '🎼' },
    { id: 'melody', ico: '🎹' },
    { id: 'listening', ico: '👂' },
    { id: 'movement', ico: '💃' }
  ];
  var GRADES = [0, 1, 2, 3, 4];

  var SOLF_EN = {
    1: 'Rhythm: quarter and eighth notes',
    2: 'The staff and clefs',
    3: 'The C major scale',
    4: 'Rests: quarter and eighth',
    5: 'Metre, bar and bar line',
    6: 'Half note and half rest',
    7: 'Whole note and whole rest',
    8: 'Sixteenth-note group'
  };
  var SOLF_TOPIC = { 2: 'notation', 3: 'melody' };
  var SOLF_LEVEL = { 1: 1, 2: 1, 3: 2, 4: 2, 5: 2, 6: 2, 7: 3, 8: 3 };

  function fixed(b, id) { b.id = id; return b; }

  // ♩ ♪ ♫ for the text answers of a question block.
  function noteText(tokens) { return (tokens || []).map(function (t) { return { q: '♩', e: '♪', ee: '♪♪' }[t] || t; }).join(' '); }

  // A topic filled in from the lesson template: its explanation, the staff
  // example, 🔄, and the written tasks, as blocks.
  function templateBlocks(tp) {
    var id = function (x) { return 'p' + tp.no + '-' + x; };
    var b = [
      { id: id('goal'), type: 'text', title: '🎯', text: tp.goal },
      { id: id('explain'), type: 'text', title: '📖', text: tp.explain },
      { id: id('staff'), type: 'rhythm', meter: 4, accent: false, pattern: tp.staff.pattern.slice(),
        text: (tp.legend || []).map(function (l) { return (l.notes ? noteText(l.notes) + ' ' : '') + l.text; }).join(' · ') }
    ];
    if (tp.repeat) { b.push({ id: id('repeat'), type: 'rhythm', meter: 4, accent: false, pattern: tp.repeat.pattern.slice(), text: 'Paklausyk ir pakartok šį ritmą.' }); }
    (tp.tasks || []).forEach(function (t, i) {
      if (t.listen) {
        b.push({ id: id('task' + (i + 1)), type: 'listening', title: t.title, text: t.question, answer: t.answer, random: false,
          options: t.options.map(function (o) { return { type: 'rhythm', meter: 4, pattern: o.rhythm.slice() }; }) });
      } else {
        b.push({ id: id('task' + (i + 1)), type: 'task', title: t.title, answer: t.answer,
          text: t.question + (t.show ? '  ' + noteText(t.show.notes) : ''),
          choices: t.options.map(function (o) { return o.text || noteText(o.notes); }) });
      }
    });
    return b;
  }

  var list = [];
  D.TOPICS.forEach(function (tp) {
    var blocks = [fixed({ type: 'text', title: '🎯', text: tp.goal }, 'p' + tp.no + '-goal')];
    if (tp.staff && tp.tasks) { blocks = templateBlocks(tp); }
    else { tp.presets.slice(0, tp.base).forEach(function (st, i) { blocks.push(fixed(LE.fromStep(st), 'p' + tp.no + '-' + (i + 1))); }); }
    var pool = tp.kind === 'staff'
      ? [{ type: 'clef', clef: 'treble' }, { type: 'clef', clef: 'bass' }]
      : tp.presets.map(LE.itemFromStep).filter(Boolean);
    blocks.push({ id: 'p' + tp.no + '-game', type: 'game', game: 'kagirdi', rounds: 5, pool: pool, text: '' });
    list.push({
      id: 'program:solf-' + tp.no, program: true, ico: tp.ico, color: tp.color,
      title: tp.no + '. ' + tp.name, title_en: tp.no + '. ' + SOLF_EN[tp.no],
      grade: 1, topic: SOLF_TOPIC[tp.no] || 'rhythm', difficulty: SOLF_LEVEL[tp.no], duration: 15,
      order_mode: 'fixed', color_mode: 'color', language: 'lt', goal: tp.goal, blocks: blocks
    });
  });

  function gameLesson(id, game, o) {
    list.push({
      id: 'program:' + id, program: true, ico: o.ico, color: o.color,
      title: o.title, title_en: o.title_en, grade: o.grade, topic: o.topic, difficulty: o.difficulty, duration: 10,
      order_mode: 'fixed', color_mode: 'color', language: 'lt', goal: o.goal,
      blocks: [
        { id: id + '-goal', type: 'text', title: '🎯', text: o.goal },
        { id: id + '-game', type: 'game', game: game, text: o.how }
      ]
    });
  }
  gameLesson('judek', 'judek', {
    ico: '💃', color: '#2fa36b', title: 'Judėk kartu', title_en: 'Move together', grade: 1, topic: 'movement', difficulty: 1,
    goal: 'Išgirsti ir judesiu parodyti skirtingą muzikos charakterį: lėtą ir greitą, sunkų ir lengvą – kaip gyvūnėliai.',
    how: 'Klausyk muzikos ir judėk kaip gyvūnėlis, kurį girdi.'
  });
  gameLesson('orkestras', 'orkestras', {
    ico: '🎼', color: '#f26a1b', title: 'Gyvūnų orkestras', title_en: 'Animal orchestra', grade: 1, topic: 'listening', difficulty: 1,
    goal: 'Klausytis gyvūnų orkestro ir atpažinti instrumentų skambėjimą.',
    how: 'Paspausk ▶ Žaisti ir klausyk orkestro.'
  });
  gameLesson('orkestras2', 'orkestras2', {
    ico: '🦁', color: '#d11264', title: 'Gyvūnų orkestras 2', title_en: 'Animal orchestra 2', grade: 2, topic: 'listening', difficulty: 2,
    goal: 'Atpažinti instrumentus orkestre ir jų skambėjimą.',
    how: 'Paspausk ▶ Žaisti ir klausyk orkestro.'
  });

  function get(id) { return list.filter(function (l) { return l.id === id; })[0] || null; }

  global.ProgramLessons = {
    TOPICS: TOPICS, GRADES: GRADES,
    list: function () { return list.map(LE.clone); },
    get: function (id) { var l = get(id); return l ? LE.clone(l) : null; },
    isProgram: function (id) { return String(id || '').indexOf('program:') === 0; }
  };
})(window);
