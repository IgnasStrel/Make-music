/* Shared MUSICATION I solfège data: the rhythm signs, the coloured
   DO-DO keyboard and the eight topics with the program author's own
   examples. Used by solfedzis.html and by the teacher module's lesson
   library (programLessons.js), so the content lives in one place. */
(function (global) {
  'use strict';

  // One token = one sign a child learns. parts: [length in beats, sounds?]
  var TOK = {
    q:  { beats: 1, parts: [[1, 1]], syl: 'TA', name: 'Ketvirtinė' },
    ee: { beats: 1, parts: [[0.5, 1], [0.5, 1]], syl: 'ti-ti', name: 'Dvi aštuntinės' },
    qr: { beats: 1, parts: [[1, 0]], syl: 'ša', name: 'Ketvirtinė pauzė' },
    eR: { beats: 1, parts: [[0.5, 1], [0.5, 0]], syl: 'ti ša', name: 'Aštuntinė + pauzė' },
    Re: { beats: 1, parts: [[0.5, 0], [0.5, 1]], syl: 'ša ti', name: 'Pauzė + aštuntinė' },
    h:  { beats: 2, parts: [[2, 1]], syl: 'TA-A', name: 'Pusinė' },
    hr: { beats: 2, parts: [[2, 0]], syl: 'ša-a', name: 'Pusinė pauzė' },
    w:  { beats: 4, parts: [[4, 1]], syl: 'TA-A-A-A', name: 'Sveikoji' },
    wr: { beats: 4, parts: [[4, 0]], syl: 'ša-a-a-a', name: 'Sveikoji pauzė' },
    s4: { beats: 1, parts: [[0.25, 1], [0.25, 1], [0.25, 1], [0.25, 1]], syl: 'ri-ri-ri-ri', name: 'Šešioliktinės' }
  };

  // The coloured DO-DO keyboard.
  var KEYS = [
    { n: 'C4', name: 'DO',  c: '#f25757', ico: '🥁' },
    { n: 'D4', name: 'RE',  c: '#f7932f', ico: '🪈' },
    { n: 'E4', name: 'MI',  c: '#fcd440', ico: '🎺' },
    { n: 'F4', name: 'FA',  c: '#4cc36b', ico: '🎻' },
    { n: 'G4', name: 'SOL', c: '#62bdf2', ico: '🪇' },
    { n: 'A4', name: 'LA',  c: '#3a74e6', ico: '🔔', light: true },
    { n: 'B4', name: 'SI',  c: '#b06ae3', ico: '🎸' },
    { n: 'C5', name: 'DO',  c: '#f25757', ico: '🪘' }
  ];
  var BLACK = [{ n: 'C#4', after: 0 }, { n: 'D#4', after: 1 }, { n: 'F#4', after: 3 }, { n: 'G#4', after: 4 }, { n: 'A#4', after: 5 }];

  // The eight topics. presets: the program author's own examples; the
  // built-in lesson of a topic is its first `base` presets.
  var TOPICS = [
    { no: 1, ico: '👣', color: '#e8333a', kind: 'rhythm', tokens: ['q', 'ee'],
      name: 'Ritmas. Ketvirtinė ir aštuntinė natos',
      goal: 'Pajusti ir atkartoti paprastą ritmą: ketvirtinę natą TA ir dvi aštuntines TI-TI.',
      presets: [
        { type: 'rhythm', meter: 4, pattern: ['q', 'q', 'q', 'q'], text: 'Ketvirtinė nata – vienas ramus žingsnis: TA. Paklausyk ir paplok.' },
        { type: 'rhythm', meter: 4, pattern: ['ee', 'ee', 'ee', 'ee'], text: 'Dvi aštuntinės – du greiti žingsneliai: ti-ti.' },
        { type: 'rhythm', meter: 2, pattern: ['q', 'ee', 'q', 'ee'], text: 'Paspausk 🎧 ir paklausyk, kaip skamba natos. Tada paplok pats!' },
        { type: 'rhythm', meter: 2, pattern: ['ee', 'q', 'ee', 'q'], text: 'Kur greiti žingsneliai, o kur ramūs? Paplok!' },
        { type: 'rhythm', meter: 4, pattern: ['q', 'q', 'ee', 'q'], text: 'TA, TA, ti-ti, TA – kaip einantis meškiukas.' },
        { type: 'rhythm', meter: 4, pattern: ['ee', 'ee', 'ee', 'q'], text: 'Bėgame, bėgame, bėgame – ir sustojame!' }
      ] },
    { no: 2, ico: '🎼', color: '#f26a1b', kind: 'staff',
      name: 'Penklinė ir raktai',
      goal: 'Atpažinti penklinę, suskaičiuoti jos penkias linijas ir susipažinti su smuiko bei boso raktais.',
      presets: [
        { type: 'lines', text: 'Penklinė turi penkias linijas. Paspausk kiekvieną liniją ir suskaičiuok!' },
        { type: 'clef', clef: 'treble', text: 'Smuiko raktas gyvena penklinės pradžioje. Juo rašomi aukšti garsai. Paspausk raktą!' },
        { type: 'clef', clef: 'bass', text: 'Boso raktas skirtas žemiems garsams – kaip lokio balsas. Paspausk raktą!' },
        { type: 'clefs', text: 'Paklausyk garso. Aukštas – smuiko raktas, žemas – boso raktas. Kuris?' }
      ] },
    { no: 3, ico: '🪜', color: '#fbad04', kind: 'melody',
      name: 'C-dur gama',
      goal: 'Išgirsti C-dur gamos garsų kilimą bei leidimąsi ir susieti garsus su natų pavadinimais bei pianino klavišais.',
      presets: [
        { type: 'melody', notes: ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5'], text: 'Gama kyla aukštyn kaip laipteliai: DO, RE, MI, FA, SOL, LA, SI, DO.' },
        { type: 'melody', notes: ['C5', 'B4', 'A4', 'G4', 'F4', 'E4', 'D4', 'C4'], text: 'O dabar lipame žemyn: DO, SI, LA, SOL, FA, MI, RE, DO.' },
        { type: 'melody', notes: ['C4', 'D4', 'E4'], text: 'DO, RE, MI – trys laipteliai. Pagrok juos pianinu!' },
        { type: 'melody', notes: ['G4', 'F4', 'E4', 'D4', 'C4'], text: 'SOL, FA, MI, RE, DO – nusileisk pianinu žemyn.' },
        { type: 'melody', notes: ['C4', 'E4', 'G4', 'C5'], text: 'Šokinėjame per laiptelį: DO, MI, SOL, DO.' },
        { type: 'melody', notes: ['E4', 'D4', 'C4'], text: 'MI, RE, DO – trys žingsniai žemyn.' }
      ] },
    { no: 4, ico: '🤫', color: '#22a83a', kind: 'rhythm', tokens: ['q', 'ee', 'qr', 'eR', 'Re'],
      name: 'Pauzės: ketvirtinė ir aštuntinė',
      goal: 'Suprasti, kad pauzė reiškia tylą, ir pajusti skirtingą pauzių trukmę.',
      presets: [
        { type: 'rhythm', meter: 4, pattern: ['q', 'q', 'q', 'qr'], text: 'Pauzė – tai tyla. Pauzės metu neplok, tik tyliai pagalvok „ša“.' },
        { type: 'rhythm', meter: 4, pattern: ['q', 'qr', 'q', 'qr'], text: 'Ketvirtinė pauzė tyli tiek pat, kiek skamba TA.' },
        { type: 'rhythm', meter: 4, pattern: ['eR', 'eR', 'q', 'qr'], text: 'Aštuntinė pauzė trumpa – kaip vienas ti.' },
        { type: 'rhythm', meter: 4, pattern: ['ee', 'qr', 'ee', 'qr'], text: 'ti-ti, tyla, ti-ti, tyla. Paplok!' },
        { type: 'rhythm', meter: 4, pattern: ['qr', 'q', 'qr', 'q'], text: 'Pradedame tyla! Palauk ir tik tada plok.' },
        { type: 'rhythm', meter: 4, pattern: ['q', 'Re', 'q', 'qr'], text: 'Pasislėpęs ti – po trumpos tylos.' }
      ] },
    { no: 5, ico: '💓', color: '#1e88e5', kind: 'rhythm', tokens: ['q', 'ee', 'qr'], meters: [2, 3, 4],
      name: 'Metras, taktas ir takto brūkšnys',
      goal: 'Pajusti tolygų pulsą, atpažinti taktų grupavimą ir takto brūkšnį.',
      presets: [
        { type: 'rhythm', meter: 2, accent: true, pattern: ['q', 'q', 'q', 'q', 'q', 'q'], text: 'Muzikos pulsas tolygus kaip širdis. Taktai po du: STIP-rus, silp-nas.' },
        { type: 'rhythm', meter: 3, accent: true, pattern: ['q', 'q', 'q', 'q', 'q', 'q'], text: 'Taktai po tris – kaip valsas: STIP-rus, silp-nas, silp-nas.' },
        { type: 'rhythm', meter: 4, accent: true, pattern: ['q', 'q', 'q', 'q', 'q', 'q', 'q', 'q'], text: 'Taktai po keturis. Takto brūkšnys atskiria taktus.' },
        { type: 'rhythm', meter: 3, accent: true, pattern: ['q', 'ee', 'q', 'q', 'ee', 'q'], text: 'Kiek pulso dūžių viename takte? Suskaičiuok ir paplok!' },
        { type: 'rhythm', meter: 2, accent: true, pattern: ['ee', 'q', 'ee', 'q'], text: 'Du taktai po du dūžius.' },
        { type: 'rhythm', meter: 3, accent: true, pattern: ['q', 'qr', 'q', 'q', 'qr', 'q'], text: 'Valsas su tyla.' }
      ] },
    { no: 6, ico: '🐢', color: '#56317d', kind: 'rhythm', tokens: ['q', 'ee', 'qr', 'h', 'hr'],
      name: 'Pusinė nata ir pusinė pauzė',
      goal: 'Pajusti ilgesnę pusinės natos trukmę ir atpažinti tokios pačios trukmės tylą.',
      presets: [
        { type: 'rhythm', meter: 4, pattern: ['h', 'h', 'h', 'h'], text: 'Pusinė nata skamba ilgai – per du žingsnius: TA-A.' },
        { type: 'rhythm', meter: 4, pattern: ['q', 'q', 'h', 'q', 'q', 'h'], text: 'TA, TA, TA-A – trumpi ir ilgas.' },
        { type: 'rhythm', meter: 4, pattern: ['h', 'hr', 'h', 'hr'], text: 'Pusinė pauzė tyli per du žingsnius.' },
        { type: 'rhythm', meter: 4, pattern: ['ee', 'ee', 'h', 'q', 'qr', 'h'], text: 'Paklausyk, kur greita, kur ilga ir kur tylu.' },
        { type: 'rhythm', meter: 4, pattern: ['h', 'q', 'q', 'hr', 'h'], text: 'Ilgas garsas, du trumpi, ilga tyla ir vėl ilgas garsas.' }
      ] },
    { no: 7, ico: '🐋', color: '#012a5f', kind: 'rhythm', tokens: ['q', 'h', 'hr', 'w', 'wr'],
      name: 'Sveikoji nata ir sveikoji pauzė',
      goal: 'Susipažinti su sveikosios natos ir sveikosios pauzės trukme, išlaikant tolygų pulsą.',
      presets: [
        { type: 'rhythm', meter: 4, pattern: ['w', 'w'], text: 'Sveikoji nata – pati ilgiausia: TA-A-A-A, keturi žingsniai.' },
        { type: 'rhythm', meter: 4, pattern: ['q', 'q', 'q', 'q', 'w'], text: 'Keturi trumpi ir vienas labai ilgas.' },
        { type: 'rhythm', meter: 4, pattern: ['w', 'wr'], text: 'Sveikoji pauzė – visas taktas tylos.' },
        { type: 'rhythm', meter: 4, pattern: ['h', 'h', 'w', 'q', 'q', 'h'], text: 'Paklausyk: pusinės, sveikoji, ketvirtinės.' },
        { type: 'rhythm', meter: 4, pattern: ['w', 'q', 'q', 'h'], text: 'Ilgas banginio balsas ir maži žingsneliai.' }
      ] },
    { no: 8, ico: '🐝', color: '#d11264', kind: 'rhythm', tokens: ['q', 'ee', 's4'],
      name: 'Šešioliktinių natų ritmo grupė',
      goal: 'Pajusti ir atkartoti šešioliktinių ritmą: ri-ri-ri-ri.',
      presets: [
        { type: 'rhythm', meter: 4, pattern: ['s4', 's4', 's4', 's4'], text: 'Keturios šešioliktinės – keturi greiti žingsneliai: ri-ri-ri-ri.' },
        { type: 'rhythm', meter: 4, pattern: ['q', 's4', 'q', 's4'], text: 'TA ir ri-ri-ri-ri. Pradėk lėtai 🐌!' },
        { type: 'rhythm', meter: 4, pattern: ['ee', 's4', 'ee', 'q'], text: 'ti-ti, ri-ri-ri-ri, ti-ti, TA.' },
        { type: 'rhythm', meter: 4, pattern: ['s4', 'ee', 's4', 'q'], text: 'Bitutė zvimbia: ri-ri-ri-ri!' },
        { type: 'rhythm', meter: 4, pattern: ['s4', 'q', 's4', 'q'], text: 'Greitai ir ramiai, greitai ir ramiai.' }
      ] }
  ];
  TOPICS.forEach(function (t) { t.base = t.base || 4; });

  global.SolfedzioData = { TOK: TOK, KEYS: KEYS, BLACK: BLACK, TOPICS: TOPICS };
})(window);
