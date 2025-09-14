// [Smoosic](https://github.com/AaronDavidNewman/Smoosic)
// Copyright (c) Aaron David Newman 2021.

import { buildDom } from '../common/htmlHelpers';
import { SvgHelpers } from '../render/sui/svgHelpers';
import { SmoConfiguration } from './configuration';
import { SuiPiano } from '../render/sui/piano';

declare var $: any;

/**
 * Construct the DOM scaffolding for the application
 * @category SuiApplication
 */
export class SuiDom {
  // Static getter to avoid TS error
  static get scrollRegionId() {
    return 'smo-scroll-region';
  }

  // Splash modal removed
  static splash(config: SmoConfiguration) {
    // Do nothing, splash modal skipped
    console.log('Splash modal skipped');
  }

  static createUiDom(uiDomContainer: HTMLElement | string | undefined) {
    if (!uiDomContainer) return;

    if (typeof uiDomContainer === 'string') {
      uiDomContainer = document.getElementById(uiDomContainer) ?? undefined;
    }
    if (!uiDomContainer) return;

    const b = buildDom;

    // Build main DOM container
    const r = b('div').classes('dom-container')
      .append(
        b('div').classes('workspace language-dir').attr('dir', 'ltr')
          .append(
            b('div').classes('control-bar')
              .append(b('div').classes('titleText').text('Make Music'))
              .append(
                b('div').classes('piano-container')
                  .append(b('div').classes('key-left-ctrl'))
                  .append(b('div').classes('piano-keys'))
                  .append(b('div').classes('key-right-ctrl'))
              )
              .append(b('div').classes('controls-top').attr('id', 'controls-top'))
          )
          .append(
            b('div').classes('media')
              .append(
                b('div').classes('d-flex flex-column flex-shrink-0 p-3 bg-body-tertiary')
                  .append(
                    b('ul').classes('nav nav-pills flex-column mb-auto').attr('id', 'controls-left')
                  )
              )
          )
      );

    uiDomContainer.append(r.dom()[0]);

    // Add scroll region
    const scrollRegion = document.createElement('div');
    $(scrollRegion).attr('id', SuiDom.scrollRegionId).addClass('musicRelief');
    $('.dom-container .media').append(scrollRegion);

    // Create piano SVG
    const pianoDom = $('.piano-keys')[0];
    const svg = document.createElementNS(SvgHelpers.namespace, 'svg');
    svg.id = 'piano-svg';
    svg.setAttributeNS('', 'width', '' + SuiPiano.owidth * SuiPiano.dimensions.octaves);
    svg.setAttributeNS('', 'height', '' + SuiPiano.dimensions.wheight);
    svg.setAttributeNS('', 'viewBox', '0 0 ' + SuiPiano.owidth * SuiPiano.dimensions.octaves + ' ' + SuiPiano.dimensions.wheight);
    pianoDom.appendChild(svg);
  }
}
