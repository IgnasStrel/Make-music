// [Smoosic](https://github.com/AaronDavidNewman/Smoosic)
// Copyright (c) Aaron David Newman 2021.
import { SvgHelpers, SvgBuilder } from "./svgHelpers";
import { buildDom } from "../../common/htmlHelpers";
import { SuiScoreViewOperations } from "./scoreViewOperations";
import { SvgBox, Pitch, PitchLetter } from '../../smo/data/common';
declare var $: any;
/**
 * @internal
 */
export interface PianoKey {
  box: SvgBox,
  keyElement: SVGSVGElement
}
/**
 * not used currently
 * @internal
 */
export class SuiPiano {
  renderElement: SVGSVGElement | null;
  view: SuiScoreViewOperations;
  octaveOffset: number = 0;
  chordPedal: boolean = false;
  lastPitch: Pitch = { letter: 'c', octave: 0, accidental: 'n' };
  objects: PianoKey[] = [];
  suggestFadeTimer: NodeJS.Timer | null = null;
  elementId: string = 'piano-svg';
  constructor(view: SuiScoreViewOperations) {
    this.renderElement = (document.getElementById(this.elementId) as any) as SVGSVGElement;
    this.view = view;
    this.render();
  }

  static get dimensions() {
    return {
      wwidth: 36,
      bwidth: 22,
      wheight: 150,
      bheight: 102,
      octaves: 7
    };
  }
  // 7 white keys per octave
  static get wkeysPerOctave() {
    return 7;
  }
  static get owidth() {
    return SuiPiano.dimensions.wwidth * SuiPiano.wkeysPerOctave;
  }
  static createAndDisplay() {
    // Called by ribbon button.
    // $('body').trigger('show-piano-event');
    $('body').trigger('forceScrollEvent');
  }

  _mapKeys() {
    this.objects = [];
    var keys: SVGSVGElement[] = [].slice.call(this.renderElement!.getElementsByClassName('piano-key'));
    keys.forEach((key) => {
      var rect = SvgHelpers.smoBox(key.getBoundingClientRect());
      var id = key.getAttributeNS('', 'id');
      var artifact = {
        keyElement: key,
        box: rect,
        id: id
      };
      this.objects.push(artifact);
    });
  }
  _removeClass(classes: string) {
    Array.from(this.renderElement!.getElementsByClassName('piano-key')).forEach((el) => {
      $(el).removeClass(classes);
    });
  }
  _removeGlow() {
    this._removeClass('glow-key');
  }
  _fadeGlow(el: SVGSVGElement) {
    if (this.suggestFadeTimer) {
      clearTimeout(this.suggestFadeTimer as any);
    }
    // Make selection fade if there is a selection.
    this.suggestFadeTimer = setTimeout(() => {
      $(el).removeClass('glow-key');
    }, 1000);
  }
  bind() {
    // The menu option to toggle piano state
    $('body').off('show-piano-event').on('show-piano-event', () => {
      const isVisible = $('body').hasClass('show-piano');
      $('body').toggleClass('show-piano');
      this._mapKeys();
    });
    $('#piano-8va-button').off('click').on('click', (ev: any) => {
      $('#piano-8vb-button').removeClass('activated');
      if (this.octaveOffset === 0) {
        $(ev.currentTarget).addClass('activated');
        this.octaveOffset = 1;
      } else {
        $(ev.currentTarget).removeClass('activated');
        this.octaveOffset = 0;
      }
    });
    $('#piano-8vb-button').off('click').on('click', (ev: any) => {
      $('#piano-8va-button').removeClass('activated');
      if (this.octaveOffset === 0) {
        $(ev.currentTarget).addClass('activated');
        this.octaveOffset = -1;
      } else {
        $(ev.currentTarget).removeClass('activated');
        this.octaveOffset = 0;
      }
    });
    $('#piano-xpose-up').off('click').on('click', () => {
      this.view.transposeSelections(1);
    });
    $('#piano-xpose-down').off('click').on('click', () => {
      this.view.transposeSelections(-1);
    });
    $('#piano-enharmonic').off('click').on('click', () => {
      this.view.toggleEnharmonic();
    });
    $('button.jsLeft').off('click').on('click', () => {
      this.view.tracker.moveSelectionLeft();
    });
    $('button.jsRight').off('click').on('click', () => {
      this.view.tracker.moveSelectionRight();
    });
    $('button.jsAddNote').off('click').on('click', async () => {
      const before = this.view.tracker.selections[0]?.selector;
      const pitch: Pitch = {
        letter: this.lastPitch.letter,
        accidental: this.lastPitch.accidental,
        octave: this.lastPitch.octave
      };
      await this.view.setPitchPiano(pitch, false);
      this.view.tracker.moveSelectionRight();
      const after = this.view.tracker.selections[0]?.selector;
      const atEnd = !!before && !!after &&
        before.staff === after.staff &&
        before.measure === after.measure &&
        before.voice === after.voice &&
        before.tick === after.tick;
      if (atEnd) {
        await this.view.addMeasure(true);
        this.view.tracker.moveSelectionRight();
      }
    });
    $('.piano-ctrl-toggle').off('click').on('click', () => {
      $('.piano-ctrl-bar').toggleClass('expanded');
      $('.piano-ctrl-toggle').toggleClass('expanded');
    });
    $('button.jsGrowDuration').off('click').on('click', () => {
      this.view.batchDurationOperation('doubleDuration');
    });
    $('button.jsGrowDot').off('click').on('click', () => {
      this.view.batchDurationOperation('dotDuration');
    });
    $('button.jsShrinkDuration').off('click').on('click', () => {
      this.view.batchDurationOperation('halveDuration');
    });
    $('button.jsShrinkDot').off('click').on('click', () => {
      this.view.batchDurationOperation('undotDuration');
    });
    $('button.jsChord').off('click').on('click', (ev: any) => {
      $(ev.currentTarget).toggleClass('activated');
      this.chordPedal = !this.chordPedal;
    });
    $(this.renderElement).off('mousemove').on('mousemove', (ev: any) => {
      if (Math.abs(this.objects[0].box.x - this.objects[0].keyElement.getBoundingClientRect().x)
        > this.objects[0].box.width / 2) {
        console.log('remap piano');
        this._mapKeys();
      }
      if (!this.renderElement) {
        return;
      }
      const clientBox = SvgHelpers.smoBox(SvgHelpers.boxPoints(ev.clientX, ev.clientY, 1, 1)); // last param is scroll offset

      var keyPressed = SvgHelpers.findSmallestIntersection(
        clientBox, this.objects) as PianoKey;
      if (!keyPressed) {
        return;
      }
      const el: SVGSVGElement = this.renderElement!.getElementById(keyPressed.keyElement.id) as SVGSVGElement;
      if ($(el).hasClass('glow-key')) {
        return;
      }
      this._removeGlow();
      $(el).addClass('glow-key');
      this._fadeGlow(el);
    });
    $(this.renderElement).off('blur').on('blur', () => {
      this._removeGlow();
    });
    $(this.renderElement).off('click').on('click', (ev: any) => {
      this._updateSelections(ev);
    });
    // the close button on piano itself
    $('.close-piano').off('click').on('click', () => {
      this.view.score.preferences.showPiano = false;
      this.view.updateScorePreferences(this.view.score.preferences);
    });
  }
  static hidePiano() {
    if ($('body').hasClass('show-piano')) {
      $('body').removeClass('show-piano');
    }
  }
  static showPiano() {
    if ($('body').hasClass('show-piano') === false) {
      $('body').addClass('show-piano');
      // resize the work area.
      // $('body').trigger('forceResizeEvent');
    }
  }
  static get isShowing() {
    return $('body').hasClass('show-piano');
  }
  _updateSelections(ev: any) {
    // fake a scroller (piano scroller w/b cool tho...)
    if (!this.renderElement) {
      return;
    }
    const logicalBox = SvgHelpers.smoBox({ x: ev.clientX, y: ev.clientY });

    var keyPressed =
      SvgHelpers.findSmallestIntersection(logicalBox, this.objects) as PianoKey;
    if (!keyPressed) {
      return;
    }
    if (!ev.shiftKey && !this.chordPedal) {
      this._removeClass('glow-key pressed-key');
    } else {
      var el = this.renderElement!.getElementById(keyPressed.keyElement.id) as SVGSVGElement;
      $(el).addClass('pressed-key');
    }
    const keyToken = keyPressed.keyElement.id.substr(6, keyPressed.keyElement.id.length - 6);
    const key = keyToken.split('-')[0];
    const pitch: Pitch = {
      letter: key[0].toLowerCase() as PitchLetter,
      octave: this.octaveOffset,
      accidental: key.length > 1 ? key[1] : 'n'
    };
    this.lastPitch = {
      letter: pitch.letter,
      octave: pitch.octave,
      accidental: pitch.accidental
    };

    const beforeSel = this.view.tracker.selections[0]?.selector;
    this.view.setPitchPiano(pitch, this.chordPedal).then(() => {
      if (!this.chordPedal) {
        // Temporarily disable autoPlay so moveSelectionRight doesn't play the note again
        const wasAutoPlay = this.view.score.preferences.autoPlay;
        this.view.score.preferences.autoPlay = false;
        this.view.tracker.moveSelectionRight();
        this.view.score.preferences.autoPlay = wasAutoPlay;
        const afterSel = this.view.tracker.selections[0]?.selector;
        const atEnd = !!beforeSel && !!afterSel &&
          beforeSel.staff === afterSel.staff &&
          beforeSel.measure === afterSel.measure &&
          beforeSel.voice === afterSel.voice &&
          beforeSel.tick === afterSel.tick;
        if (atEnd) {
          this.view.addMeasure(true).then(() => {
            this.view.score.preferences.autoPlay = false;
            this.view.tracker.moveSelectionRight();
            this.view.score.preferences.autoPlay = wasAutoPlay;
          });
        }
      }
    });
  }
  _renderControls() {
    var b = buildDom;
    var r = b('button').classes('piano-ctrl').attr('id', 'piano-8va-button').append(
      b('span').classes('bold-italic').text('8')).append(
        b('sup').classes('italic').text('va'));
    $('.piano-container .key-left-ctrl').append(r.dom());
    r = b('button').classes('piano-ctrl ').attr('id', 'piano-8vb-button').append(
      b('span').classes('bold-italic').text('8')).append(
        b('sup').classes('italic').text('vb'));
    $('.piano-container .key-left-ctrl').append(r.dom());
    r = b('button').classes('piano-ctrl jsXposeUp').attr('id', 'piano-xpose-up').append(
      b('span').classes('bold').text('+'));
    $('.piano-container .key-left-ctrl').append(r.dom());
    r = b('button').classes('piano-ctrl jsXposeDown').attr('id', 'piano-xpose-down').append(
      b('span').classes('bold').text('-'));
    $('.piano-container .key-left-ctrl').append(r.dom());
    r = b('button').classes('piano-ctrl jsEnharmonic').attr('id', 'piano-enharmonic').append(
      b('span').classes('bold icon icon-accident'));

    $('.piano-container .key-left-ctrl').append(r.dom());
    r = b('button').classes('piano-ctrl jsChord')
      .append(b('span').classes('icon icon-chords'));
    $('.piano-container .key-left-ctrl').append(r.dom());
    r = b('button').classes('piano-ctrl jsAddNote').attr('id', 'piano-add-note').append(
      b('span').classes('bold').text('+'))
      .append(b('span').attr('id', 'piano-add-note-text').text('Note'));
    $('.piano-container .key-left-ctrl').append(r.dom());
  }
  handleResize() {
    this._mapKeys();
  }
  playNote() {
  }
  render() {
    var b = SvgBuilder.b;
    var d = SuiPiano.dimensions;
    // https://www.mathpages.com/home/kmath043.htm

    // Width of white key at back for C,D,E
    var b1off = d.wwidth - (d.bwidth * 2 / 3);

    // Width of other white keys at the back.
    var b2off = d.wwidth - (d.bwidth * 3) / 4;

    var xwhite = [{
      note: 'C',
      x: 0
    }, {
      note: 'D',
      x: d.wwidth
    }, {
      note: 'E',
      x: 2 * d.wwidth
    }, {
      note: 'F',
      x: 3 * d.wwidth
    }, {
      note: 'G',
      x: 4 * d.wwidth
    }, {
      note: 'A',
      x: 5 * d.wwidth
    }, {
      note: 'B',
      x: 6 * d.wwidth
    }
    ];
    var xblack = [{
      note: 'Db',
      x: b1off
    }, {
      note: 'Eb',
      x: 2 * b1off + d.bwidth
    }, {
      note: 'Gb',
      x: 3 * d.wwidth + b2off
    }, {
      note: 'Ab',
      x: (3 * d.wwidth + b2off) + b2off + d.bwidth
    }, {
      note: 'Bb',
      x: SuiPiano.owidth - (b2off + d.bwidth)
    }
    ];
    var wwidth = d.wwidth;
    var bwidth = d.bwidth;
    var wheight = d.wheight;
    var bheight = d.bheight;
    var owidth = SuiPiano.wkeysPerOctave * wwidth;

    var x = 0;
    var y = 0;
    var r = b('g');
    for (var i = 0; i < d.octaves; ++i) {
      x = i * owidth;
      xwhite.forEach((key) => {
        var nt = key.note;
        var keyId = nt + '-o' + i;
        var classes = 'piano-key white-key';
        if (nt == 'C4') {
          classes += ' middle-c';
        }
        var rect = b('rect').attr('id', 'keyId-' + keyId).rect(x + key.x, y, wwidth, wheight, classes);
        r.append(rect);

        var tt = b('text').text(x + key.x + (wwidth / 5), bheight + 16, 'note-text', nt);
        r.append(tt);
      });
      xblack.forEach((key) => {
        var nt = key.note;
        var keyId = nt + '-o' + i;
        var classes = 'piano-key black-key';
        var rect = b('rect').attr('id', 'keyId-' + keyId).rect(x + key.x, 0, bwidth, bheight, classes);
        r.append(rect);
      });
    }
    var el = (document.getElementById(this.elementId) as any) as SVGSVGElement;
    SvgHelpers.gradient(el, 'piano-grad', 'vertical', [{ color: '#000', offset: '0%', opacity: 1 },
    { color: '#777', offset: '50%', opacity: 1 }, { color: '#ddd', offset: '100%', opacity: 1 }]);
    el.appendChild(r.dom());
    this._renderControls();
    this._mapKeys();
    this.bind();
  }
}
