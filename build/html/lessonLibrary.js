/* Local (localStorage-backed) lesson storage for MUSICATION.
   No backend in this phase - everything lives in the browser profile.

   Two kinds of files live here:
     - 'natos'    : a note sheet written on rasymas.html
     - 'pamokele' : a lesson a teacher builds on pamokeles.html (picture,
                    text, and the tasks / games / note sheets / music
                    excerpts attached to it)
   Every file can sit in a folder (aplankas) and can be moved to the
   library (biblioteka) when it is not needed any more - "archived": it is
   kept, but no longer shown among the teacher's lessons. */
(function (global) {
  'use strict';

  var INDEX_KEY = 'musication.lessons.v1';
  var LESSON_KEY_PREFIX = 'musication.lesson.';
  var FOLDERS_KEY = 'musication.folders.v1';

  function readJson(key, fallback) {
    try {
      var v = JSON.parse(localStorage.getItem(key) || 'null');
      return v == null ? fallback : v;
    } catch (e) {
      return fallback;
    }
  }

  // Files saved before folders existed have no kind/folder/archived yet.
  function readIndex() {
    return readJson(INDEX_KEY, []).map(function (rec) {
      if (!rec.kind) { rec.kind = 'natos'; }
      if (rec.folderId === undefined) { rec.folderId = null; }
      rec.archived = !!rec.archived;
      return rec;
    });
  }

  function writeIndex(list) {
    localStorage.setItem(INDEX_KEY, JSON.stringify(list));
  }

  function makeId(prefix) {
    return prefix + Date.now() + '_' + Math.floor(Math.random() * 1e6);
  }

  var LessonLibrary = {
    // extra: { kind, folderId }
    save: function (title, state, extra) {
      extra = extra || {};
      var id = makeId('lsn_');
      var now = Date.now();
      localStorage.setItem(LESSON_KEY_PREFIX + id, JSON.stringify(state));
      var list = readIndex();
      list.unshift({
        id: id, title: title, createdAt: now, updatedAt: now,
        kind: extra.kind || 'natos', folderId: extra.folderId || null, archived: false
      });
      writeIndex(list);
      return id;
    },

    // changes: { title, state, folderId, archived } - any of them.
    update: function (id, changes) {
      var list = readIndex();
      var rec = list.filter(function (r) { return r.id === id; })[0];
      if (!rec) { return false; }
      if (changes.state !== undefined) {
        localStorage.setItem(LESSON_KEY_PREFIX + id, JSON.stringify(changes.state));
      }
      ['title', 'folderId', 'archived'].forEach(function (k) {
        if (changes[k] !== undefined) { rec[k] = changes[k]; }
      });
      rec.updatedAt = Date.now();
      writeIndex(list);
      return true;
    },

    duplicate: function (id, newTitle) {
      var rec = this.get(id);
      if (!rec) { return null; }
      return this.save(newTitle || rec.title, this.load(id) || {}, { kind: rec.kind, folderId: rec.folderId });
    },

    get: function (id) {
      return readIndex().filter(function (r) { return r.id === id; })[0] || null;
    },

    // filter: { kind, archived } - leave a field out to accept any value.
    list: function (filter) {
      filter = filter || {};
      return readIndex().filter(function (r) {
        return (filter.kind === undefined || r.kind === filter.kind) &&
               (filter.archived === undefined || r.archived === filter.archived);
      });
    },

    search: function (query, filter) {
      var q = (query || '').trim().toLowerCase();
      return this.list(filter).filter(function (rec) {
        return !q || rec.title.toLowerCase().indexOf(q) !== -1;
      });
    },

    load: function (id) {
      return readJson(LESSON_KEY_PREFIX + id, null);
    },

    remove: function (id) {
      localStorage.removeItem(LESSON_KEY_PREFIX + id);
      writeIndex(readIndex().filter(function (rec) { return rec.id !== id; }));
    },

    // ── Folders (aplankai) ──
    folders: function () {
      return readJson(FOLDERS_KEY, []);
    },

    addFolder: function (name, color) {
      var list = this.folders();
      var f = { id: makeId('fld_'), name: name, color: color || '#009D9D' };
      list.push(f);
      localStorage.setItem(FOLDERS_KEY, JSON.stringify(list));
      return f;
    },

    updateFolder: function (id, changes) {
      var list = this.folders().map(function (f) {
        if (f.id === id) {
          if (changes.name !== undefined) { f.name = changes.name; }
          if (changes.color !== undefined) { f.color = changes.color; }
        }
        return f;
      });
      localStorage.setItem(FOLDERS_KEY, JSON.stringify(list));
    },

    // The files inside are kept - they just no longer belong to a folder.
    removeFolder: function (id) {
      localStorage.setItem(FOLDERS_KEY, JSON.stringify(this.folders().filter(function (f) { return f.id !== id; })));
      writeIndex(readIndex().map(function (r) {
        if (r.folderId === id) { r.folderId = null; }
        return r;
      }));
    }
  };

  // ── What a teacher can attach to a lesson (pamokėlė). To offer another
  // task or game, add one line here. ──
  var MusicationCatalog = {
    TASKS: [
      { id: 'natos',  ico: '🌈', name: 'Natų pažinimas', href: 'testai.html#natos' },
      { id: 'ritmas', ico: '👏', name: 'Ritmo užduotis', href: 'testai.html#ritmas' },
      { id: 'garsai', ico: '🔊', name: 'Garsų užduotis', href: 'testai.html#garsai' }
    ],
    GAMES: [
      { id: 'judek', ico: '💃', name: 'Judėk kartu', href: 'judek.html' }
    ],
    find: function (list, id) {
      return list.filter(function (x) { return x.id === id; })[0] || null;
    }
  };

  global.LessonLibrary = LessonLibrary;
  global.MusicationCatalog = MusicationCatalog;
})(window);
