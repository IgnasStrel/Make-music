/* MUSICATION teacher module texts in Lithuanian and English (window.I18N).
 *
 *   I18N.t('key', { n: 3 })    the text in the current language
 *   I18N.set('en')             switch language (remembered on this device)
 *   I18N.apply(root)           fill [data-i18n], [data-i18n-ph] (placeholder), [data-i18n-title]
 *   I18N.onChange(fn)          after a switch
 *
 * In a text, {name} is replaced by vars.name, and {n|form|forms|formų}
 * picks the plural form for vars.n (Lithuanian has three, English two).
 */
(function (global) {
  'use strict';

  var KEY = 'musication.lang';
  var DICT = {
    lt: {
      // Block types
      'bt.text': 'Tekstas', 'bt.notes': 'Natos', 'bt.audio': 'Garso įrašas', 'bt.video': 'Vaizdo įrašas', 'bt.image': 'Paveikslėlis',
      'bt.rhythm': 'Ritmas', 'bt.piano': 'Pianinas', 'bt.listening': 'Klausymas', 'bt.task': 'Klausimas', 'bt.game': 'Žaidimas', 'bt.recording': 'Įrašymas',
      // Games
      'game.kagirdi': 'Ką girdi?', 'game.judek': 'Judėk kartu', 'game.orkestras': 'Gyvūnų orkestras', 'game.orkestras2': 'Gyvūnų orkestras 2',
      'game.ritmas': 'Ritmo žaidimai', 'game.melodija': 'Melodijos žaidimas', 'game.klausa': 'Klausymo žaidimai', 'game.lasas': 'Klausos lašas',
      'game.gyvunai': 'Gyvūnų muzika', 'game.atmintis': 'Natų atmintis',
      // Topics, grades, areas
      'topic.rhythm': 'Ritmas', 'topic.notation': 'Natų raštas', 'topic.melody': 'Melodija ir gama', 'topic.listening': 'Klausymas', 'topic.movement': 'Judesys',
      'g.pre': 'Priešmokyklinė', 'g.n': '{n} klasė',
      'area.notes': 'Natos', 'area.rhythm': 'Ritmas', 'area.listening': 'Klausa', 'area.piano': 'Pianinas', 'area.other': 'Kita',

      // Player (for children)
      'e.listen': 'Paklausyk', 'e.again': 'Pakartok', 'e.tempo': 'Tempas', 'e.tempo0': 'LĖTA', 'e.tempo1': 'VIDUTINĖ', 'e.tempo2': 'GREITA',
      'e.next': 'Toliau', 'e.finish': 'Baigti', 'e.great': 'Puikiai!', 'e.tryAgain': 'Pabandykime dar kartą', 'e.yourTurn': 'Dabar tu!',
      'e.yourTurnPlay': 'Dabar tu! Pagrok', 'e.tapWhen': 'Paplok, kai pasirodys „Dabar tu!“', 'e.missing': 'Pabandykime dar kartą – trūko {n} 👏',
      'e.almost': 'Beveik! Paklausyk 🎧 ir pabandyk dar kartą', 'e.pressKeys': 'Spausk spalvotus klavišus', 'e.notAll': 'Pabandykime dar kartą – dar ne visos natos',
      'e.tryListen': 'Pabandykime dar kartą 🎧', 'e.notesRight': 'Natos teisingos! Dar tolygiau 🐢', 'e.fiveLines': 'Penkios linijos!',
      'e.treble': 'Smuiko raktas', 'e.bass': 'Boso raktas', 'e.trebleYes': 'Smuiko raktas!', 'e.bassYes': 'Boso raktas!',
      'e.high': '🐦 Aukštas', 'e.low': '🐻 Žemas', 'e.right': 'Teisingai!', 'e.found': 'Radai!', 'e.listenAgain': 'Paklausyk dar kartą',
      'e.newSound': 'Kitas garsas', 'e.thinkAgain': 'Pagalvok dar kartą', 'e.playAgain': 'Žaisti dar', 'e.gameHint': 'Paklausyk 🎧 ir paspausk paveikslėlį, kurį girdi!',
      'e.gameEmpty': 'Žaidimui reikia bent dviejų pavyzdžių.', 'e.gameDone': 'Puikiai pažaidei!', 'e.play': 'Žaisti', 'e.close': 'Uždaryti',
      'e.tapHere': 'Plok čia!', 'e.orSpace': 'arba tarpo klavišas', 'e.lessonDone': 'Pamoka baigta! Puikiai!', 'e.restart': '🔁 Iš naujo',
      'e.empty': 'Šioje pamokoje dar nėra blokų.', 'e.recStart': 'Paspausk 🎤 ir dainuok ar grok', 'e.recListen': 'Paklausyk savo įrašo ▶',
      'e.recLocal': 'Įrašas lieka tik šiame įrenginyje.', 'e.recNo': 'Šis įrenginys negali įrašinėti.', 'e.recDenied': 'Mikrofonas neleidžiamas.',
      // Summaries and error places
      'sum.lines': 'Penkios penklinės linijos', 'sum.meter': '{n} dūžiai takte', 'sum.options': '{n|pavyzdys|pavyzdžiai|pavyzdžių}',
      'sum.rec': 'Įrašas iki {s} s', 'sum.nofile': 'Failas dar nepridėtas',
      'err.time': '{bar} taktas, {beat} dūžis: ne laiku', 'err.few': 'Trūko {n} {n|plojimo|plojimų|plojimų}',
      'err.many': '{n} {n|plojimas|plojimai|plojimų} per daug', 'err.note': '{pos}-a nata: {got} vietoj {exp}',
      'err.noteMissing': '{pos}-a nata ({exp}) nepagrota', 'err.round': '{n} raundas: neatspėjo ({exp})', 'err.choice': 'Pasirinko „{got}“, teisingai – „{exp}“',

      // Block editor
      'ed.title': 'Pavadinimas', 'ed.text': 'Paaiškinimas vaikui', 'ed.textMain': 'Tekstas', 'ed.textPh': 'Ką vaikas turi padaryti?', 'ed.question': 'Klausimas',
      'ed.meter': 'Dūžiai takte', 'ed.fromProgram': 'Iš programos pavyzdžių', 'ed.addSigns': 'Spausk ženklus – jie atsiras čia', 'ed.addNotes': 'Spausk natas – jos atsiras čia',
      'ed.clear': 'Išvalyti', 'ed.accent': 'Rodyti pulsą ir stiprią takto dalį', 'ed.names': 'Rodyti natų pavadinimus', 'ed.checkPlay': 'Vaikas groja pianinu (vertinama)',
      'ed.notesMode': 'Ką rodyti', 'ed.modeMelody': 'Melodija penklinėje', 'ed.modeLines': 'Penklinės linijos', 'ed.modeClef': 'Raktas',
      'ed.clef': 'Raktas', 'ed.showKeys': 'Grojant rodyti klavišus', 'ed.random': 'Kiekvieną kartą atsitiktinis garsas',
      'ed.right': 'teisingas', 'ed.remove': 'Išimti', 'ed.noItems': 'Dar nėra pavyzdžių.', 'ed.itemKind': 'Pavyzdžio rūšis', 'ed.kindRhythm': '👏 Ritmas',
      'ed.kindMelody': '🎹 Melodija', 'ed.kindClef': '🎼 Aukštas / žemas', 'ed.addItem': 'Pridėti pavyzdį', 'ed.itemsMax': 'Iki {n} pavyzdžių.',
      'ed.choices': 'Atsakymai', 'ed.choice': '{n} atsakymas', 'ed.addChoice': 'Pridėti atsakymą', 'ed.game': 'Žaidimas', 'ed.rounds': 'Raundai',
      'ed.gamePage': 'Žaidimas atsidarys visame ekrane.', 'ed.seconds': 'Įrašo trukmė',
      'ed.url': 'Nuoroda į failą', 'ed.urlVideo': 'Nuoroda (YouTube arba failas)', 'ed.upload': 'Įkelti failą', 'ed.uploading': 'Įkeliama…',
      'ed.tooBig': 'Failas per didelis (iki 3 MB demo režime).', 'ed.uploadFail': 'Nepavyko įkelti:', 'ed.inLesson': 'failas pamokoje',
      // Lesson editor
      'ed.newTitle': 'Nauja pamoka', 'ed.unsaved': 'Neišsaugota', 'ed.versions': 'Versijos', 'ed.saveNew': 'Nauja versija', 'ed.save': 'Išsaugoti',
      'ed.origSafe': 'originalas nekeičiamas', 'ed.addBlock': 'Pridėti bloką', 'ed.settings': 'Pamokos nustatymai', 'ed.titleEn': 'Pavadinimas angliškai',
      'ed.duration': 'Trukmė (min.)', 'ed.order': 'Blokų eiga', 'ed.orderFixed': 'Iš eilės', 'ed.orderFree': 'Bet kuria tvarka',
      'ed.color': 'Natų spalvos', 'ed.colorOn': 'Spalvotos', 'ed.colorOff': 'Juodos', 'ed.leave': 'Pamokos pakeitimai neišsaugoti. Išeiti?',
      'ed.noBlocks': 'Pridėk pirmą bloką žemiau.', 'ed.drag': 'Tempk, kad perkeltum', 'ed.up': 'Aukštyn', 'ed.down': 'Žemyn', 'ed.dup': 'Dubliuoti',
      'ed.delBlock': 'Ištrinti {n} bloką?', 'ed.tryBlock': 'Išbandyti šį bloką', 'ed.saved': 'Išsaugota', 'ed.savedNew': 'Išsaugota kaip V{v}',
      'ed.newVerHelp': 'Dabartinė versija liks tokia, kokia yra, o pakeitimai bus išsaugoti kaip V{v}.', 'ed.note': 'Pastaba', 'ed.notePh': 'pvz. pridėtas žaidimas',
      'ed.version': 'Versija', 'ed.date': 'Data', 'ed.current': '(dabartinė)', 'ed.restore': 'Atkurti', 'ed.restored': 'Atkurta V{v}. Išsaugok, kad liktų.',

      // Teacher: general
      't.room': 'Mokytojo kambarys', 't.loginTitle': 'Mokytojo prisijungimas', 't.email': 'El. paštas', 't.password': 'Slaptažodis',
      't.passwordNew': 'Naujas slaptažodis (bent 6 simboliai)', 't.signIn': 'Prisijungti', 't.signUp': 'Sukurti paskyrą', 't.forgot': 'Pamiršau slaptažodį',
      't.name': 'Vardas', 't.language': 'Kalba', 't.createAccount': 'Sukurti paskyrą', 't.haveAccount': '← Jau turiu paskyrą',
      't.forgotHelp': 'Įvesk el. paštą – atsiųsime nuorodą naujam slaptažodžiui.', 't.sendLink': 'Siųsti nuorodą', 't.back': 'Atgal',
      't.savePassword': 'Išsaugoti slaptažodį', 't.demo': 'DEMO', 't.demoNote': 'Demo režimas: duomenys saugomi tik šiame įrenginyje. Įvesk bet kokį el. paštą.',
      't.errLogin': 'Neteisingas el. paštas arba slaptažodis.', 't.errConfirm': 'Pirmiausia patvirtink el. paštą (nuoroda laiške).',
      't.errExists': 'Toks el. paštas jau užregistruotas.', 't.errShort': 'Slaptažodis turi būti bent 6 simbolių.',
      't.checkEmail': 'Paskyra sukurta! Patvirtink el. paštą paspaudęs nuorodą laiške ir prisijunk.', 't.linkSent': 'Nuoroda išsiųsta – patikrink el. paštą.',
      't.passSaved': 'Slaptažodis pakeistas', 't.sure': 'Ar tikrai?', 't.cancel': 'Atšaukti', 't.ok': 'Gerai', 't.yes': 'Taip', 't.no': 'Ne',
      't.copy': 'Kopijuoti', 't.copied': 'Nukopijuota', 't.untitled': 'Be pavadinimo', 't.refresh': 'Atnaujinti',
      'nav.library': 'Biblioteka', 'nav.mine': 'Mano pamokos', 'nav.classes': 'Klasės', 'nav.results': 'Rezultatai', 'nav.new': 'Nauja pamoka', 'nav.settings': 'Nustatymai',
      'home.hello': 'Labas, {name}!', 'home.program': 'programos pamokos', 'home.mine': 'mano pamokos', 'home.students': 'mokiniai',
      'home.active': 'vykdomos užduotys', 'home.studentLink': 'Mokinių prisijungimo nuoroda',
      // Library and cards
      'f.grade': 'Klasė', 'f.topic': 'Tema', 'f.diff': 'Sudėtingumas', 'f.search': 'Paieška', 'f.searchPh': 'Ieškoti…', 'f.all': 'Visos',
      'lib.help': 'Programos pamokos. Peržiūrėk, vesk klasėje, paskirk mokiniams arba nusikopijuok ir keisk savo kopiją.',
      'lib.none': 'Tokių pamokų nėra.', 'lib.blocks': '{n} {n|blokas|blokai|blokų}', 'lib.blocksTitle': 'Pamokos blokai', 'lib.original': 'Originalas',
      'a.preview': 'Peržiūra', 'a.live': 'Vesti pamoką', 'a.copy': 'Kopijuoti', 'a.assign': 'Paskirti', 'a.edit': 'Redaguoti', 'a.archive': 'Archyvuoti',
      'a.unarchive': 'Grąžinti iš archyvo', 'a.delete': 'Ištrinti', 'a.copySuffix': '(kopija)', 'a.copied': 'Kopija sukurta – ją rasi „Mano pamokos“',
      'mine.archived': 'Rodyti archyvą', 'mine.none': 'Savo pamokų dar neturi. Nusikopijuok pamoką iš 📚 bibliotekos arba sukurk naują.',
      'mine.from': 'Kopija iš: {name}', 'mine.isArchived': 'archyve', 'mine.delAsk': 'Ištrinti pamoką „{name}“ ir visas jos versijas?', 'mine.deleted': 'Ištrinta',
      // Assigning
      'as.noStudents': 'Dar nėra mokinių. Pridėk juos skiltyje 👥 Klasės.', 'as.toClasses': '👥 Į klases', 'as.what': 'Ką siunčiame',
      'as.whole': 'Visa pamoka', 'as.who': 'Kam', 'as.class': 'Klasė', 'as.noClasses': 'Dar nėra klasių – pasirink mokinius.',
      'as.remote': 'Galima atlikti namuose', 'as.count': 'Gaus: {n} {n|mokinys|mokiniai|mokinių} · {b} {b|blokas|blokai|blokų}.',
      'as.noHome': '{n} iš jų dar negali prisijungti namuose (🏠 įjunk 👥 Klasės).', 'as.send': 'Siųsti', 'as.sent': 'Išsiųsta: {n} {n|mokiniui|mokiniams|mokinių}',
      'as.pickSomeone': 'Pasirink bent vieną mokinį.', 'as.pickBlock': 'Pasirink bent vieną bloką.', 'as.part': '{n} {n|blokas|blokai|blokų}',
      // Classes
      'cl.print': 'Kodų lapeliai', 'cl.add': 'Nauja klasė', 'cl.all': 'Visi mokiniai', 'cl.none': 'Be klasės', 'cl.rename': 'Pervadinti', 'cl.delete': 'Ištrinti klasę',
      'cl.addStudents': 'Pridėti mokinius', 'cl.namesPh': 'Vardai – po vieną eilutėje', 'cl.addBtn': 'Pridėti', 'cl.name': 'Mokinys', 'cl.code': 'Prisijungimo kodas',
      'cl.remote': 'Namuose', 'cl.remoteHelp': 'Ar mokinys gali prisijungti iš namų', 'cl.state': 'Būsena', 'cl.class': 'Klasė',
      'cl.noStudents': 'Mokinių dar nėra.', 'cl.newName': 'Naujas pavadinimas', 'cl.delAsk': 'Ištrinti klasę „{name}“? Mokiniai liks, bet be klasės.',
      'cl.added': 'Pridėta: {n}', 'cl.newCode': 'Naujas kodas', 'cl.codeAsk': 'Sukurti naują kodą mokiniui {name}? Senasis nebetiks.',
      'cl.delStudent': 'Ištrinti mokinį {name} ir visus jo rezultatus?', 'cl.className': 'Klasės pavadinimas, pvz. 1A',
      'st.on': 'prisijungęs klasėje', 'st.home': 'prisijungęs namuose', 'st.off': 'neprisijungęs', 'st.never': 'dar nebuvo',
      // Statuses
      's.assigned': 'išsiųsta', 's.started': 'pradėta', 's.in_progress': 'vykdoma', 's.completed': 'atlikta', 's.repeat': 'kartoti', 's.none': 'nepaskirta',
      // Results
      'r.tabResults': 'Rezultatai', 'r.tabTasks': 'Užduotys', 'r.allTasks': 'Visos užduotys',
      'r.help': 'Skaičiuojami tik mokinio paties atlikti bandymai. „—“ reiškia, kad mokinys to dar nedarė (tai ne nulis).',
      'r.overall': 'Bendras', 'r.done': 'Atlikta', 'r.last': 'Paskutinį kartą', 'r.noAttempts': 'Šis mokinys dar neatliko vertinamų užduočių.',
      'r.task': 'Užduotis', 'r.block': 'Blokas', 'r.score': 'Rezultatas', 'r.where': 'Kur suklydo', 'r.noErrors': 'be klaidų',
      'r.noTasks': 'Užduočių dar nesiuntei.', 'r.markRepeat': 'Pažymėti „kartoti“', 'r.unassign': 'Atšaukti šiam mokiniui', 'r.delTask': 'Ištrinti užduotį „{name}“ ir jos rezultatus?',
      // Settings
      'set.cloud': '☁️ Duomenys saugomi debesyje (Supabase).', 'set.local': '💻 Demo režimas: duomenys saugomi tik šiame įrenginyje.',
      'set.toApp': 'Į MUSICATION', 'set.signOut': 'Atsijungti',
      // Live lesson
      'p.title': 'Mokinių dalyvavimas', 'p.full': 'Visas ekranas', 'p.class': 'Visa klasė', 'p.pick': 'Pasirinkti mokiniai', 'p.remote': 'Nuotolinis',
      'p.sendBlock': 'Siųsti šį bloką', 'p.sendAll': 'Siųsti visą pamoką', 'p.nobody': 'Čia mokinių nėra.',

      // Student page
      's.title': 'Mano užduotys', 's.codeLabel': 'Įvesk kodą, kurį gavai iš mokytojo', 's.inClass': 'Klasėje', 's.atHome': 'Namuose',
      's.enter': 'Pradėti', 's.codeShort': 'Kodas per trumpas.', 's.badCode': 'Tokio kodo nėra. Paklausk mokytojo.',
      's.noHome': 'Namuose dirbti dar negalima. Paklausk mokytojo.', 's.notMe': 'Ne aš', 's.hello': 'Labas, {name}!',
      's.noTasks': 'Užduočių dar nėra. Kai mokytojas atsiųs, jos atsiras čia.', 's.start': 'Pradėti', 's.again': 'Dar kartą', 's.redo': 'Pakartoti',
      's.toTasks': 'Į užduotis', 's.sending': 'siunčiama…', 's.sent': 'Išsiųsta mokytojui', 's.notSent': 'Nepavyko išsiųsti',
      's.demoNote': 'Demo režimas: veikia tik šiame įrenginyje, kuriame mokytojas sukūrė mokinius.',
      's.st.assigned': 'Nauja užduotis', 's.st.started': 'Pradėta', 's.st.in_progress': 'Dar nebaigta', 's.st.completed': 'Atlikta', 's.st.repeat': 'Mokytojas prašo pakartoti'
    },
    en: {
      'bt.text': 'Text', 'bt.notes': 'Notes', 'bt.audio': 'Audio', 'bt.video': 'Video', 'bt.image': 'Picture',
      'bt.rhythm': 'Rhythm', 'bt.piano': 'Piano', 'bt.listening': 'Listening', 'bt.task': 'Question', 'bt.game': 'Game', 'bt.recording': 'Recording',
      'game.kagirdi': 'What do you hear?', 'game.judek': 'Move together', 'game.orkestras': 'Animal orchestra', 'game.orkestras2': 'Animal orchestra 2',
      'game.ritmas': 'Rhythm games', 'game.melodija': 'Melody game', 'game.klausa': 'Listening games', 'game.lasas': 'Ear drop',
      'game.gyvunai': 'Animal music', 'game.atmintis': 'Note memory',
      'topic.rhythm': 'Rhythm', 'topic.notation': 'Notation', 'topic.melody': 'Melody and scale', 'topic.listening': 'Listening', 'topic.movement': 'Movement',
      'g.pre': 'Pre-school', 'g.n': 'Grade {n}',
      'area.notes': 'Notes', 'area.rhythm': 'Rhythm', 'area.listening': 'Ear', 'area.piano': 'Piano', 'area.other': 'Other',

      'e.listen': 'Listen', 'e.again': 'Again', 'e.tempo': 'Tempo', 'e.tempo0': 'SLOW', 'e.tempo1': 'MEDIUM', 'e.tempo2': 'FAST',
      'e.next': 'Next', 'e.finish': 'Finish', 'e.great': 'Great!', 'e.tryAgain': 'Let’s try again', 'e.yourTurn': 'Your turn!',
      'e.yourTurnPlay': 'Your turn! Play', 'e.tapWhen': 'Clap when you see “Your turn!”', 'e.missing': 'Let’s try again – {n} 👏 missing',
      'e.almost': 'Almost! Listen 🎧 and try again', 'e.pressKeys': 'Press the coloured keys', 'e.notAll': 'Let’s try again – not all the notes yet',
      'e.tryListen': 'Let’s try again 🎧', 'e.notesRight': 'Right notes! Now more evenly 🐢', 'e.fiveLines': 'Five lines!',
      'e.treble': 'Treble clef', 'e.bass': 'Bass clef', 'e.trebleYes': 'Treble clef!', 'e.bassYes': 'Bass clef!',
      'e.high': '🐦 High', 'e.low': '🐻 Low', 'e.right': 'Right!', 'e.found': 'You found it!', 'e.listenAgain': 'Listen again',
      'e.newSound': 'Next sound', 'e.thinkAgain': 'Think again', 'e.playAgain': 'Play again', 'e.gameHint': 'Listen 🎧 and tap the picture you hear!',
      'e.gameEmpty': 'The game needs at least two examples.', 'e.gameDone': 'Well played!', 'e.play': 'Play', 'e.close': 'Close',
      'e.tapHere': 'Clap here!', 'e.orSpace': 'or the space bar', 'e.lessonDone': 'Lesson done! Great!', 'e.restart': '🔁 Start over',
      'e.empty': 'This lesson has no blocks yet.', 'e.recStart': 'Press 🎤 and sing or play', 'e.recListen': 'Listen to your recording ▶',
      'e.recLocal': 'The recording stays on this device only.', 'e.recNo': 'This device cannot record.', 'e.recDenied': 'The microphone is not allowed.',
      'sum.lines': 'The five lines of the staff', 'sum.meter': '{n} beats in a bar', 'sum.options': '{n|example|examples}',
      'sum.rec': 'Recording up to {s} s', 'sum.nofile': 'No file yet',
      'err.time': 'Bar {bar}, beat {beat}: off the beat', 'err.few': '{n} {n|clap|claps} missing', 'err.many': '{n} {n|clap|claps} too many',
      'err.note': 'Note {pos}: {got} instead of {exp}', 'err.noteMissing': 'Note {pos} ({exp}) not played', 'err.round': 'Round {n}: missed ({exp})',
      'err.choice': 'Chose “{got}”, right answer “{exp}”',

      'ed.title': 'Title', 'ed.text': 'Explanation for the child', 'ed.textMain': 'Text', 'ed.textPh': 'What should the child do?', 'ed.question': 'Question',
      'ed.meter': 'Beats in a bar', 'ed.fromProgram': 'From the program examples', 'ed.addSigns': 'Press the signs – they appear here', 'ed.addNotes': 'Press the notes – they appear here',
      'ed.clear': 'Clear', 'ed.accent': 'Show the pulse and the strong beat', 'ed.names': 'Show note names', 'ed.checkPlay': 'The child plays it on the piano (scored)',
      'ed.notesMode': 'What to show', 'ed.modeMelody': 'Melody on the staff', 'ed.modeLines': 'Staff lines', 'ed.modeClef': 'Clef',
      'ed.clef': 'Clef', 'ed.showKeys': 'Show the keys while playing', 'ed.random': 'A random sound every time',
      'ed.right': 'right', 'ed.remove': 'Remove', 'ed.noItems': 'No examples yet.', 'ed.itemKind': 'Kind of example', 'ed.kindRhythm': '👏 Rhythm',
      'ed.kindMelody': '🎹 Melody', 'ed.kindClef': '🎼 High / low', 'ed.addItem': 'Add example', 'ed.itemsMax': 'Up to {n} examples.',
      'ed.choices': 'Answers', 'ed.choice': 'Answer {n}', 'ed.addChoice': 'Add answer', 'ed.game': 'Game', 'ed.rounds': 'Rounds',
      'ed.gamePage': 'The game opens full screen.', 'ed.seconds': 'Recording length',
      'ed.url': 'Link to the file', 'ed.urlVideo': 'Link (YouTube or a file)', 'ed.upload': 'Upload a file', 'ed.uploading': 'Uploading…',
      'ed.tooBig': 'The file is too big (up to 3 MB in demo mode).', 'ed.uploadFail': 'Upload failed:', 'ed.inLesson': 'file in the lesson',
      'ed.newTitle': 'New lesson', 'ed.unsaved': 'Not saved', 'ed.versions': 'Versions', 'ed.saveNew': 'New version', 'ed.save': 'Save',
      'ed.origSafe': 'the original stays unchanged', 'ed.addBlock': 'Add a block', 'ed.settings': 'Lesson settings', 'ed.titleEn': 'Title in English',
      'ed.duration': 'Length (min)', 'ed.order': 'Block order', 'ed.orderFixed': 'One after another', 'ed.orderFree': 'Any order',
      'ed.color': 'Note colours', 'ed.colorOn': 'Coloured', 'ed.colorOff': 'Black', 'ed.leave': 'The lesson has unsaved changes. Leave?',
      'ed.noBlocks': 'Add the first block below.', 'ed.drag': 'Drag to move', 'ed.up': 'Up', 'ed.down': 'Down', 'ed.dup': 'Duplicate',
      'ed.delBlock': 'Delete block {n}?', 'ed.tryBlock': 'Try this block', 'ed.saved': 'Saved', 'ed.savedNew': 'Saved as V{v}',
      'ed.newVerHelp': 'The current version stays as it is; the changes are saved as V{v}.', 'ed.note': 'Note', 'ed.notePh': 'e.g. added a game',
      'ed.version': 'Version', 'ed.date': 'Date', 'ed.current': '(current)', 'ed.restore': 'Restore', 'ed.restored': 'V{v} restored. Save to keep it.',

      't.room': 'Teacher’s room', 't.loginTitle': 'Teacher sign in', 't.email': 'Email', 't.password': 'Password',
      't.passwordNew': 'New password (at least 6 characters)', 't.signIn': 'Sign in', 't.signUp': 'Create an account', 't.forgot': 'Forgot password',
      't.name': 'Name', 't.language': 'Language', 't.createAccount': 'Create account', 't.haveAccount': '← I have an account',
      't.forgotHelp': 'Enter your email – we will send a link to set a new password.', 't.sendLink': 'Send link', 't.back': 'Back',
      't.savePassword': 'Save password', 't.demo': 'DEMO', 't.demoNote': 'Demo mode: the data stays on this device only. Enter any email.',
      't.errLogin': 'Wrong email or password.', 't.errConfirm': 'Please confirm your email first (link in the message).',
      't.errExists': 'This email is already registered.', 't.errShort': 'The password needs at least 6 characters.',
      't.checkEmail': 'Account created! Confirm your email with the link in the message, then sign in.', 't.linkSent': 'Link sent – check your email.',
      't.passSaved': 'Password changed', 't.sure': 'Are you sure?', 't.cancel': 'Cancel', 't.ok': 'OK', 't.yes': 'Yes', 't.no': 'No',
      't.copy': 'Copy', 't.copied': 'Copied', 't.untitled': 'Untitled', 't.refresh': 'Refresh',
      'nav.library': 'Library', 'nav.mine': 'My lessons', 'nav.classes': 'Classes', 'nav.results': 'Results', 'nav.new': 'New lesson', 'nav.settings': 'Settings',
      'home.hello': 'Hello, {name}!', 'home.program': 'program lessons', 'home.mine': 'my lessons', 'home.students': 'students',
      'home.active': 'tasks in progress', 'home.studentLink': 'Student sign-in link',
      'f.grade': 'Grade', 'f.topic': 'Topic', 'f.diff': 'Difficulty', 'f.search': 'Search', 'f.searchPh': 'Search…', 'f.all': 'All',
      'lib.help': 'The program’s lessons. Preview them, teach them in class, assign them, or copy one and change your copy.',
      'lib.none': 'No such lessons.', 'lib.blocks': '{n} {n|block|blocks}', 'lib.blocksTitle': 'Lesson blocks', 'lib.original': 'Original',
      'a.preview': 'Preview', 'a.live': 'Teach', 'a.copy': 'Copy', 'a.assign': 'Assign', 'a.edit': 'Edit', 'a.archive': 'Archive',
      'a.unarchive': 'Restore from archive', 'a.delete': 'Delete', 'a.copySuffix': '(copy)', 'a.copied': 'Copy made – find it in “My lessons”',
      'mine.archived': 'Show archive', 'mine.none': 'No lessons of your own yet. Copy one from the 📚 library or make a new one.',
      'mine.from': 'Copy of: {name}', 'mine.isArchived': 'archived', 'mine.delAsk': 'Delete the lesson “{name}” and all its versions?', 'mine.deleted': 'Deleted',
      'as.noStudents': 'No students yet. Add them under 👥 Classes.', 'as.toClasses': '👥 To classes', 'as.what': 'What we send',
      'as.whole': 'The whole lesson', 'as.who': 'To whom', 'as.class': 'Class', 'as.noClasses': 'No classes yet – pick students.',
      'as.remote': 'May be done at home', 'as.count': 'Receives: {n} {n|student|students} · {b} {b|block|blocks}.',
      'as.noHome': '{n} of them cannot sign in at home yet (turn on 🏠 in 👥 Classes).', 'as.send': 'Send', 'as.sent': 'Sent to {n} {n|student|students}',
      'as.pickSomeone': 'Pick at least one student.', 'as.pickBlock': 'Pick at least one block.', 'as.part': '{n} {n|block|blocks}',
      'cl.print': 'Code cards', 'cl.add': 'New class', 'cl.all': 'All students', 'cl.none': 'No class', 'cl.rename': 'Rename', 'cl.delete': 'Delete class',
      'cl.addStudents': 'Add students', 'cl.namesPh': 'Names – one per line', 'cl.addBtn': 'Add', 'cl.name': 'Student', 'cl.code': 'Sign-in code',
      'cl.remote': 'At home', 'cl.remoteHelp': 'May the student sign in from home', 'cl.state': 'State', 'cl.class': 'Class',
      'cl.noStudents': 'No students yet.', 'cl.newName': 'New name', 'cl.delAsk': 'Delete the class “{name}”? The students stay, without a class.',
      'cl.added': 'Added: {n}', 'cl.newCode': 'New code', 'cl.codeAsk': 'Make a new code for {name}? The old one will stop working.',
      'cl.delStudent': 'Delete {name} and all their results?', 'cl.className': 'Class name, e.g. 1A',
      'st.on': 'online in class', 'st.home': 'online at home', 'st.off': 'offline', 'st.never': 'not yet',
      's.assigned': 'sent', 's.started': 'started', 's.in_progress': 'in progress', 's.completed': 'done', 's.repeat': 'repeat', 's.none': 'not assigned',
      'r.tabResults': 'Results', 'r.tabTasks': 'Tasks', 'r.allTasks': 'All tasks',
      'r.help': 'Only the student’s own attempts count. “—” means the student has not done it yet (it is not zero).',
      'r.overall': 'Overall', 'r.done': 'Done', 'r.last': 'Last time', 'r.noAttempts': 'This student has no scored attempts yet.',
      'r.task': 'Task', 'r.block': 'Block', 'r.score': 'Score', 'r.where': 'Where it went wrong', 'r.noErrors': 'no mistakes',
      'r.noTasks': 'You have not sent any tasks yet.', 'r.markRepeat': 'Mark “repeat”', 'r.unassign': 'Withdraw for this student', 'r.delTask': 'Delete the task “{name}” and its results?',
      'set.cloud': '☁️ The data is kept in the cloud (Supabase).', 'set.local': '💻 Demo mode: the data stays on this device only.',
      'set.toApp': 'To MUSICATION', 'set.signOut': 'Sign out',
      'p.title': 'Student participation', 'p.full': 'Full screen', 'p.class': 'Whole class', 'p.pick': 'Chosen students', 'p.remote': 'Remote',
      'p.sendBlock': 'Send this block', 'p.sendAll': 'Send the whole lesson', 'p.nobody': 'No students here.',

      's.title': 'My tasks', 's.codeLabel': 'Enter the code from your teacher', 's.inClass': 'In class', 's.atHome': 'At home',
      's.enter': 'Start', 's.codeShort': 'The code is too short.', 's.badCode': 'There is no such code. Ask your teacher.',
      's.noHome': 'Working at home is not allowed yet. Ask your teacher.', 's.notMe': 'Not me', 's.hello': 'Hello, {name}!',
      's.noTasks': 'No tasks yet. When your teacher sends one, it appears here.', 's.start': 'Start', 's.again': 'Again', 's.redo': 'Redo',
      's.toTasks': 'To my tasks', 's.sending': 'sending…', 's.sent': 'Sent to the teacher', 's.notSent': 'Could not send',
      's.demoNote': 'Demo mode: works only on the device where the teacher made the students.',
      's.st.assigned': 'New task', 's.st.started': 'Started', 's.st.in_progress': 'Not finished yet', 's.st.completed': 'Done', 's.st.repeat': 'Your teacher asks you to redo it'
    }
  };

  var lang = 'lt', listeners = [];
  try { var s = localStorage.getItem(KEY); if (s === 'lt' || s === 'en') { lang = s; } } catch (e) {}

  function plural(n, forms) {
    n = Math.abs(Number(n)) || 0;
    if (lang === 'en') { return forms[n === 1 ? 0 : 1] || forms[0]; }
    var d = n % 10, h = n % 100;
    if (d === 1 && h !== 11) { return forms[0]; }
    if (d >= 2 && (h < 10 || h >= 20)) { return forms[1] || forms[0]; }
    return forms[2] || forms[1] || forms[0];
  }
  function t(key, vars) {
    var s = (DICT[lang] && DICT[lang][key]) || DICT.lt[key];
    if (s === undefined) { return key; }
    vars = vars || {};
    return s.replace(/\{(\w+)\|([^}]+)\}/g, function (_, k, forms) { return plural(vars[k], forms.split('|')); })
      .replace(/\{(\w+)\}/g, function (_, k) { return vars[k] === undefined || vars[k] === null ? '' : String(vars[k]); });
  }
  function apply(root) {
    root = root || document;
    root.querySelectorAll('[data-i18n]').forEach(function (el) { el.textContent = t(el.getAttribute('data-i18n')); });
    root.querySelectorAll('[data-i18n-ph]').forEach(function (el) { el.placeholder = t(el.getAttribute('data-i18n-ph')); });
    root.querySelectorAll('[data-i18n-title]').forEach(function (el) { el.title = t(el.getAttribute('data-i18n-title')); el.setAttribute('aria-label', el.title); });
  }
  function set(l) {
    if (l !== 'lt' && l !== 'en') { return; }
    lang = l;
    api.lang = l;
    try { localStorage.setItem(KEY, l); } catch (e) {}
    document.documentElement.lang = l;
    apply(document);
    listeners.forEach(function (fn) { fn(l); });
  }

  var api = {
    lang: lang, t: t, set: set, apply: apply,
    onChange: function (fn) { listeners.push(fn); },
    has: function (key) { return DICT.lt[key] !== undefined; },
    keys: function (l) { return Object.keys(DICT[l || 'lt']); }
  };
  document.documentElement.lang = lang;
  global.I18N = api;
})(window);
