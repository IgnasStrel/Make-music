/* Local (localStorage-backed) lesson save/load for MUSICATION.
   No backend in this phase - everything lives in the browser profile. */
(function (global) {
  'use strict';

  var INDEX_KEY = 'musication.lessons.v1';
  var LESSON_KEY_PREFIX = 'musication.lesson.';

  function readIndex() {
    try {
      return JSON.parse(localStorage.getItem(INDEX_KEY) || '[]');
    } catch (e) {
      return [];
    }
  }

  function writeIndex(list) {
    localStorage.setItem(INDEX_KEY, JSON.stringify(list));
  }

  function makeId() {
    return 'lsn_' + Date.now() + '_' + Math.floor(Math.random() * 1e6);
  }

  var LessonLibrary = {
    save: function (title, state) {
      var id = makeId();
      var now = Date.now();
      localStorage.setItem(LESSON_KEY_PREFIX + id, JSON.stringify(state));
      var list = readIndex();
      list.unshift({ id: id, title: title, createdAt: now, updatedAt: now });
      writeIndex(list);
      return id;
    },

    list: function () {
      return readIndex();
    },

    search: function (query) {
      var q = (query || '').trim().toLowerCase();
      if (!q) { return readIndex(); }
      return readIndex().filter(function (rec) {
        return rec.title.toLowerCase().indexOf(q) !== -1;
      });
    },

    load: function (id) {
      var raw = localStorage.getItem(LESSON_KEY_PREFIX + id);
      if (!raw) { return null; }
      try {
        return JSON.parse(raw);
      } catch (e) {
        return null;
      }
    },

    remove: function (id) {
      localStorage.removeItem(LESSON_KEY_PREFIX + id);
      writeIndex(readIndex().filter(function (rec) { return rec.id !== id; }));
    }
  };

  global.LessonLibrary = LessonLibrary;
})(window);
