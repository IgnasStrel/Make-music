/* MUSICATION teacher module - the data layer (window.MusicationDB).
 *
 * One API for the whole module: the teacher's account, classes, students,
 * lessons and their versions, assignments, results, files, and the
 * functions a student uses with a login code.
 *
 * With a Supabase project in config.js everything is stored there (see
 * supabase/schema.sql for the tables and who may see what). Without one,
 * the same API runs as a demo on this device only (localStorage): one
 * teacher, no email, students "connect" on the same computer.
 *
 * Every call returns a Promise; a failed call rejects with an Error whose
 * message can be shown to the teacher.
 */
(function (global) {
  'use strict';

  var cfg = global.MUSICATION_CONFIG || {};
  var sb = (cfg.supabaseUrl && cfg.supabaseAnonKey && global.supabase)
    ? global.supabase.createClient(cfg.supabaseUrl, cfg.supabaseAnonKey, {
        auth: { persistSession: true, storageKey: 'musication.auth', detectSessionInUrl: true }
      })
    : null;

  var LESSON_FIELDS = ['title', 'title_en', 'grade', 'topic', 'difficulty', 'duration', 'order_mode', 'color_mode', 'language'];
  function pick(o, keys) { var r = {}; keys.forEach(function (k) { if (o[k] !== undefined) { r[k] = o[k]; } }); return r; }
  function now() { return new Date().toISOString(); }
  function byDate(field, desc) {
    return function (a, b) { return (a[field] < b[field] ? -1 : a[field] > b[field] ? 1 : 0) * (desc ? -1 : 1); };
  }

  // ═══════════════════════════ Supabase ═══════════════════════════
  function remote() {
    var user = null, listeners = [];
    function must(res) {
      if (res.error) { throw new Error(res.error.message || String(res.error)); }
      return res.data;
    }
    function me() { if (!user) { throw new Error('not signed in'); } return user.id; }
    // fn(user, event): event 'PASSWORD_RECOVERY' when the page was opened
    // from a "reset password" email.
    sb.auth.onAuthStateChange(function (event, session) {
      user = session ? session.user : null;
      listeners.forEach(function (fn) { fn(user, event); });
    });
    function redirectTo() { return location.href.split('#')[0].split('?')[0]; }

    var api = {
      mode: 'supabase',
      auth: {
        init: function () {
          return sb.auth.getSession().then(function (r) { user = r.data.session ? r.data.session.user : null; return user; });
        },
        current: function () { return user; },
        onChange: function (fn) { listeners.push(fn); },
        signIn: function (email, password) {
          return sb.auth.signInWithPassword({ email: email, password: password }).then(must).then(function (d) { user = d.user; return user; });
        },
        // { confirm: true } when the account waits for the email link.
        signUp: function (name, email, password, language) {
          return sb.auth.signUp({ email: email, password: password,
            options: { data: { name: name, language: language }, emailRedirectTo: redirectTo() } })
            .then(must).then(function (d) { if (d.session) { user = d.user; } return { confirm: !d.session }; });
        },
        signOut: function () { return sb.auth.signOut().then(function () { user = null; }); },
        reset: function (email) { return sb.auth.resetPasswordForEmail(email, { redirectTo: redirectTo() }).then(must); },
        setPassword: function (password) { return sb.auth.updateUser({ password: password }).then(must); }
      },
      profile: {
        get: function () { return sb.from('teachers').select('*').eq('id', me()).single().then(must); },
        save: function (changes) {
          return sb.from('teachers').update(pick(changes, ['name', 'language', 'settings'])).eq('id', me()).select().single().then(must);
        }
      },
      classes: {
        list: function () { return sb.from('classes').select('*').order('created_at').then(must); },
        add: function (name) { return sb.from('classes').insert({ teacher_id: me(), name: name }).select().single().then(must); },
        rename: function (id, name) { return sb.from('classes').update({ name: name }).eq('id', id).then(must); },
        remove: function (id) { return sb.from('classes').delete().eq('id', id).then(must); }
      },
      students: {
        list: function () { return sb.from('students').select('*').order('name').then(must); },
        add: function (name, classId) {
          return sb.from('students').insert({ teacher_id: me(), name: name, class_id: classId || null }).select().single().then(must);
        },
        update: function (id, changes) {
          return sb.from('students').update(pick(changes, ['name', 'class_id', 'remote_enabled'])).eq('id', id).select().single().then(must);
        },
        remove: function (id) { return sb.from('students').delete().eq('id', id).then(must); },
        newCode: function (id) {
          return sb.rpc('new_login_code').then(must).then(function (code) {
            return sb.from('students').update({ login_code: code }).eq('id', id).select().single().then(must);
          });
        }
      },
      lessons: {
        list: function () {
          return sb.from('lessons').select('id,title,title_en,grade,topic,difficulty,duration,source_lesson_id,version,archived,updated_at,created_at,blocks')
            .order('updated_at', { ascending: false }).then(must);
        },
        get: function (id) { return sb.from('lessons').select('*').eq('id', id).single().then(must); },
        create: function (lesson) {
          var row = pick(lesson, LESSON_FIELDS.concat(['source_lesson_id', 'order_mode', 'color_mode']));
          row.author_id = me(); row.blocks = lesson.blocks || []; row.version = 1;
          return sb.from('lessons').insert(row).select().single().then(must).then(function (l) {
            return snapshot(l, 'V1').then(function () { return l; });
          });
        },
        // opts.newVersion: keep the current version as it was and continue as V+1.
        save: function (id, lesson, opts) {
          opts = opts || {};
          return sb.from('lessons').select('version').eq('id', id).single().then(must).then(function (cur) {
            var row = pick(lesson, LESSON_FIELDS);
            row.blocks = lesson.blocks; row.updated_at = now();
            row.version = opts.newVersion ? cur.version + 1 : cur.version;
            return sb.from('lessons').update(row).eq('id', id).select().single().then(must);
          }).then(function (l) { return snapshot(l, opts.note).then(function () { return l; }); });
        },
        archive: function (id, archived) { return sb.from('lessons').update({ archived: archived !== false }).eq('id', id).then(must); },
        remove: function (id) { return sb.from('lessons').delete().eq('id', id).then(must); },
        versions: function (id) {
          return sb.from('lesson_versions').select('version,created_at,note,title').eq('lesson_id', id).order('version', { ascending: false }).then(must);
        },
        version: function (id, v) {
          return sb.from('lesson_versions').select('*').eq('lesson_id', id).eq('version', v).single().then(must);
        }
      },
      assign: {
        create: function (a) {
          return sb.from('assignments').insert({
            teacher_id: me(), lesson_id: a.lessonId || null, program_lesson_id: a.programLessonId || null,
            block_ids: a.blockIds || null, title: a.title, content: a.content, remote: !!a.remote, due_at: a.dueAt || null
          }).select().single().then(must).then(function (row) {
            var rows = a.studentIds.map(function (sid) { return { assignment_id: row.id, student_id: sid }; });
            return sb.from('assignment_students').insert(rows).then(must).then(function () { return row; });
          });
        },
        list: function () {
          return sb.from('assignments').select('*, assignment_students(student_id,status,updated_at)')
            .order('assigned_at', { ascending: false }).then(must).then(function (list) {
              return list.map(function (a) { a.students = a.assignment_students || []; delete a.assignment_students; return a; });
            });
        },
        setStatus: function (assignmentId, studentId, status) {
          return sb.from('assignment_students').update({ status: status, updated_at: now() })
            .eq('assignment_id', assignmentId).eq('student_id', studentId).then(must);
        },
        unassign: function (assignmentId, studentId) {
          return sb.from('assignment_students').delete().eq('assignment_id', assignmentId).eq('student_id', studentId).then(must);
        },
        remove: function (id) { return sb.from('assignments').delete().eq('id', id).then(must); }
      },
      results: {
        attempts: function () { return sb.from('attempts').select('*').order('completed_at', { ascending: false }).then(must); }
      },
      media: {
        upload: function (file) {
          var safe = file.name.replace(/[^a-zA-Z0-9._-]+/g, '_');
          var path = me() + '/' + Date.now() + '_' + safe;
          return sb.storage.from('lesson-media').upload(path, file, { contentType: file.type, upsert: false }).then(must).then(function () {
            return sb.storage.from('lesson-media').getPublicUrl(path).data.publicUrl;
          });
        }
      },
      student: {
        login: function (code, where) { return sb.rpc('student_login', { p_code: code, p_where: where || 'class' }).then(must); },
        tasks: function (code, where) { return sb.rpc('student_tasks', { p_code: code, p_where: where || 'class' }).then(must); },
        setStatus: function (code, assignmentId, status) {
          return sb.rpc('student_set_status', { p_code: code, p_assignment: assignmentId, p_status: status }).then(must);
        },
        submit: function (code, assignmentId, blockId, area, score, errors, startedAt, last) {
          return sb.rpc('student_submit', { p_code: code, p_assignment: assignmentId, p_block: blockId, p_area: area,
            p_score: score, p_errors: errors || [], p_started: startedAt || null, p_last: !!last }).then(must);
        }
      }
    };
    function snapshot(l, note) {
      return sb.from('lesson_versions').upsert({
        lesson_id: l.id, version: l.version, title: l.title, blocks: l.blocks, created_by: l.author_id, note: note || null,
        settings: pick(l, LESSON_FIELDS)
      }, { onConflict: 'lesson_id,version' }).then(must);
    }
    return api;
  }

  // ═══════════════════════════ Demo on this device ═══════════════════════════
  // The same rules as the database functions, kept in localStorage.
  function local() {
    var KEY = 'musication.demo.db.v1';
    var TABLES = ['teachers', 'classes', 'students', 'lessons', 'lesson_versions', 'assignments', 'assignment_students', 'attempts'];
    var listeners = [];
    function load() {
      var d = null;
      try { d = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) {}
      d = d || {};
      TABLES.forEach(function (t) { d[t] = d[t] || []; });
      return d;
    }
    function store(d) { localStorage.setItem(KEY, JSON.stringify(d)); }
    function id() { return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) { var r = Math.random() * 16 | 0; return (c === 'x' ? r : (r & 3 | 8)).toString(16); }); }
    function code(d) {
      var A = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789', c;
      do { c = ''; for (var i = 0; i < 8; i++) { c += A[Math.floor(Math.random() * 32)]; } }
      while (d.students.some(function (s) { return s.login_code === c; }));
      return c;
    }
    function ok(v) { return Promise.resolve(JSON.parse(JSON.stringify(v === undefined ? null : v))); }
    function fail(msg) { return Promise.reject(new Error(msg)); }
    function user() { var d = load(); return d.session || null; }
    function me() { var u = user(); if (!u) { throw new Error('not signed in'); } return u.id; }
    function tx(fn) { try { var d = load(); var r = fn(d); store(d); return ok(r); } catch (e) { return fail(e.message); } }
    function find(list, key, val) { return list.filter(function (r) { return r[key] === val; })[0]; }
    function snapshot(d, l, note) {
      d.lesson_versions = d.lesson_versions.filter(function (v) { return !(v.lesson_id === l.id && v.version === l.version); });
      d.lesson_versions.push({ id: id(), lesson_id: l.id, version: l.version, title: l.title, blocks: l.blocks,
        settings: pick(l, LESSON_FIELDS), note: note || null, created_at: now(), created_by: l.author_id });
    }
    function studentByCode(d, c) { return find(d.students, 'login_code', String(c || '').trim().toUpperCase()); }

    return {
      mode: 'local',
      auth: {
        init: function () { return ok(user()); },
        current: function () { return user(); },
        onChange: function (fn) { listeners.push(fn); },
        signIn: function (email) {
          return tx(function (d) {
            var t = d.teachers[0];
            if (!t) { t = { id: id(), name: '', email: email || '', language: 'lt', settings: {}, created_at: now() }; d.teachers.push(t); }
            d.session = { id: t.id, email: t.email };
            return d.session;
          }).then(function (u) { listeners.forEach(function (fn) { fn(u); }); return u; });
        },
        signUp: function (name, email, password, language) {
          return tx(function (d) {
            var t = d.teachers[0] || { id: id(), settings: {}, created_at: now() };
            t.name = name; t.email = email; t.language = language || 'lt';
            if (!d.teachers.length) { d.teachers.push(t); }
            d.session = { id: t.id, email: t.email };
            return { confirm: false };
          }).then(function (r) { listeners.forEach(function (fn) { fn(user()); }); return r; });
        },
        signOut: function () { return tx(function (d) { d.session = null; }).then(function () { listeners.forEach(function (fn) { fn(null); }); }); },
        reset: function () { return ok(true); },
        setPassword: function () { return ok(true); }
      },
      profile: {
        get: function () { return tx(function (d) { return find(d.teachers, 'id', me()); }); },
        save: function (changes) {
          return tx(function (d) { var t = find(d.teachers, 'id', me()); Object.assign(t, pick(changes, ['name', 'language', 'settings'])); return t; });
        }
      },
      classes: {
        list: function () { return tx(function (d) { return d.classes.filter(function (c) { return c.teacher_id === me(); }).sort(byDate('created_at')); }); },
        add: function (name) { return tx(function (d) { var c = { id: id(), teacher_id: me(), name: name, created_at: now() }; d.classes.push(c); return c; }); },
        rename: function (cid, name) { return tx(function (d) { find(d.classes, 'id', cid).name = name; }); },
        remove: function (cid) {
          return tx(function (d) {
            d.classes = d.classes.filter(function (c) { return c.id !== cid; });
            d.students.forEach(function (s) { if (s.class_id === cid) { s.class_id = null; } });
          });
        }
      },
      students: {
        list: function () {
          return tx(function (d) {
            return d.students.filter(function (s) { return s.teacher_id === me(); })
              .sort(function (a, b) { return a.name.localeCompare(b.name); });
          });
        },
        add: function (name, classId) {
          return tx(function (d) {
            var s = { id: id(), teacher_id: me(), class_id: classId || null, name: name, login_code: code(d),
              remote_enabled: false, last_seen: null, seen_from: null, created_at: now() };
            d.students.push(s); return s;
          });
        },
        update: function (sid, changes) {
          return tx(function (d) { var s = find(d.students, 'id', sid); Object.assign(s, pick(changes, ['name', 'class_id', 'remote_enabled'])); return s; });
        },
        remove: function (sid) {
          return tx(function (d) {
            d.students = d.students.filter(function (s) { return s.id !== sid; });
            d.assignment_students = d.assignment_students.filter(function (x) { return x.student_id !== sid; });
            d.attempts = d.attempts.filter(function (x) { return x.student_id !== sid; });
          });
        },
        newCode: function (sid) { return tx(function (d) { var s = find(d.students, 'id', sid); s.login_code = code(d); return s; }); }
      },
      lessons: {
        list: function () { return tx(function (d) { return d.lessons.filter(function (l) { return l.author_id === me(); }).sort(byDate('updated_at', true)); }); },
        get: function (lid) { return tx(function (d) { var l = find(d.lessons, 'id', lid); if (!l) { throw new Error('not found'); } return l; }); },
        create: function (lesson) {
          return tx(function (d) {
            var l = Object.assign({ order_mode: 'fixed', color_mode: 'color', language: 'lt' },
              pick(lesson, LESSON_FIELDS.concat(['source_lesson_id'])));
            l.id = id(); l.author_id = me(); l.blocks = lesson.blocks || []; l.version = 1; l.archived = false;
            l.created_at = l.updated_at = now();
            d.lessons.push(l); snapshot(d, l, 'V1'); return l;
          });
        },
        save: function (lid, lesson, opts) {
          opts = opts || {};
          return tx(function (d) {
            var l = find(d.lessons, 'id', lid);
            Object.assign(l, pick(lesson, LESSON_FIELDS));
            l.blocks = lesson.blocks; l.updated_at = now();
            if (opts.newVersion) { l.version += 1; }
            snapshot(d, l, opts.note); return l;
          });
        },
        archive: function (lid, archived) { return tx(function (d) { find(d.lessons, 'id', lid).archived = archived !== false; }); },
        remove: function (lid) {
          return tx(function (d) {
            d.lessons = d.lessons.filter(function (l) { return l.id !== lid; });
            d.lesson_versions = d.lesson_versions.filter(function (v) { return v.lesson_id !== lid; });
          });
        },
        versions: function (lid) {
          return tx(function (d) {
            return d.lesson_versions.filter(function (v) { return v.lesson_id === lid; })
              .sort(function (a, b) { return b.version - a.version; })
              .map(function (v) { return pick(v, ['version', 'created_at', 'note', 'title']); });
          });
        },
        version: function (lid, v) {
          return tx(function (d) { return d.lesson_versions.filter(function (x) { return x.lesson_id === lid && x.version === v; })[0]; });
        }
      },
      assign: {
        create: function (a) {
          return tx(function (d) {
            var row = { id: id(), teacher_id: me(), lesson_id: a.lessonId || null, program_lesson_id: a.programLessonId || null,
              block_ids: a.blockIds || null, title: a.title, content: a.content, remote: !!a.remote, assigned_at: now(), due_at: a.dueAt || null };
            d.assignments.push(row);
            a.studentIds.forEach(function (sid) { d.assignment_students.push({ assignment_id: row.id, student_id: sid, status: 'assigned', updated_at: now() }); });
            return row;
          });
        },
        list: function () {
          return tx(function (d) {
            return d.assignments.filter(function (a) { return a.teacher_id === me(); }).sort(byDate('assigned_at', true)).map(function (a) {
              var r = Object.assign({}, a);
              r.students = d.assignment_students.filter(function (x) { return x.assignment_id === a.id; })
                .map(function (x) { return pick(x, ['student_id', 'status', 'updated_at']); });
              return r;
            });
          });
        },
        setStatus: function (aid, sid, status) {
          return tx(function (d) {
            d.assignment_students.forEach(function (x) { if (x.assignment_id === aid && x.student_id === sid) { x.status = status; x.updated_at = now(); } });
          });
        },
        unassign: function (aid, sid) {
          return tx(function (d) { d.assignment_students = d.assignment_students.filter(function (x) { return !(x.assignment_id === aid && x.student_id === sid); }); });
        },
        remove: function (aid) {
          return tx(function (d) {
            d.assignments = d.assignments.filter(function (a) { return a.id !== aid; });
            d.assignment_students = d.assignment_students.filter(function (x) { return x.assignment_id !== aid; });
            d.attempts = d.attempts.filter(function (x) { return x.assignment_id !== aid; });
          });
        }
      },
      results: {
        attempts: function () {
          return tx(function (d) {
            var mine = d.assignments.filter(function (a) { return a.teacher_id === me(); }).map(function (a) { return a.id; });
            return d.attempts.filter(function (x) { return mine.indexOf(x.assignment_id) >= 0; }).sort(byDate('completed_at', true));
          });
        }
      },
      media: {
        // On this device only: the file is kept inside the lesson as a data URL.
        upload: function (file) {
          if (file.size > 3 * 1024 * 1024) { return fail('too_big'); }
          return new Promise(function (res, rej) {
            var r = new FileReader();
            r.onload = function () { res(r.result); };
            r.onerror = function () { rej(new Error('read_failed')); };
            r.readAsDataURL(file);
          });
        }
      },
      student: {
        login: function (c, where) {
          return tx(function (d) {
            var s = studentByCode(d, c);
            if (!s) { return { error: 'bad_code' }; }
            if (where === 'home' && !s.remote_enabled) { return { error: 'remote_disabled' }; }
            s.last_seen = now(); s.seen_from = where === 'home' ? 'home' : 'class';
            var t = find(d.teachers, 'id', s.teacher_id);
            return { id: s.id, name: s.name, remote: s.remote_enabled, teacher: t ? t.name : '' };
          });
        },
        tasks: function (c, where) {
          return tx(function (d) {
            var s = studentByCode(d, c);
            if (!s || (where === 'home' && !s.remote_enabled)) { return null; }
            s.last_seen = now(); s.seen_from = where === 'home' ? 'home' : 'class';
            return d.assignment_students.filter(function (x) { return x.student_id === s.id; }).map(function (x) {
              var a = find(d.assignments, 'id', x.assignment_id);
              return { id: a.id, title: a.title, content: a.content, assigned_at: a.assigned_at, due_at: a.due_at, status: x.status };
            }).sort(byDate('assigned_at', true));
          });
        },
        setStatus: function (c, aid, status) {
          return tx(function (d) {
            var s = studentByCode(d, c);
            if (!s || ['started', 'in_progress'].indexOf(status) < 0) { return false; }
            var x = d.assignment_students.filter(function (r) { return r.assignment_id === aid && r.student_id === s.id; })[0];
            if (!x || x.status === 'completed') { return false; }
            x.status = status; x.updated_at = now(); return true;
          });
        },
        submit: function (c, aid, blockId, area, score, errors, startedAt, last) {
          return tx(function (d) {
            var s = studentByCode(d, c);
            if (!s) { return null; }
            var x = d.assignment_students.filter(function (r) { return r.assignment_id === aid && r.student_id === s.id; })[0];
            if (!x) { return null; }
            if (score !== null && score !== undefined) {
              d.attempts.push({ id: id(), assignment_id: aid, student_id: s.id, block_id: blockId, area: area,
                started_at: startedAt || null, completed_at: now(), score: Math.max(0, Math.min(1, score)), errors: errors || [] });
            }
            if (last) {
              // The newest attempt of each block (like the database function).
              var latest = {};
              d.attempts.forEach(function (t) {
                if (t.assignment_id !== aid || t.student_id !== s.id) { return; }
                var k = t.block_id || '';
                if (!latest[k] || latest[k].completed_at <= t.completed_at) { latest[k] = t; }
              });
              var mine = Object.keys(latest).map(function (k) { return latest[k]; });
              var avg = mine.length ? mine.reduce(function (sum, t) { return sum + t.score; }, 0) / mine.length : null;
              x.status = avg !== null && avg < 0.6 ? 'repeat' : 'completed';
            } else { x.status = 'in_progress'; }
            x.updated_at = now();
            return x.status;
          });
        }
      }
    };
  }

  global.MusicationDB = sb ? remote() : local();
})(window);
