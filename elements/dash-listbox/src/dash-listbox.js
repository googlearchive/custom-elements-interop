
/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */

const KEYCODE = {
  UP: 38,
  DOWN: 40,
  LEFT: 37,
  RIGHT: 39,
  HOME: 36,
  END: 35,
};

let listboxTemplate = document.createElement('template');
listboxTemplate.innerHTML = `
  <style>
    :host {
      display: block;
      border: 1px solid #8A8A8A;
      border-radius: 3px;
      width: 300px;
    }

    ::slotted(dash-option) {
      border-bottom: 1px solid #8A8A8A;
    }

    ::slotted(dash-option:last-of-type) {
      border-bottom: none;
    }
  </style>
  <slot></slot>
`.trim();

ShadyCSS.prepareTemplate(listboxTemplate, 'dash-listbox');
export class DashListbox extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    if (!this._mounted) {
      ShadyCSS.styleElement(this);
      this.shadowRoot.appendChild(document.importNode(listboxTemplate.content, true));
      this._mounted = true;
    }

    if (!this.hasAttribute('role'))
      this.setAttribute('role', 'listbox');
    if (!this.hasAttribute('tabindex'))
      this.setAttribute('tabindex', '0');
    
    this.upgradeProperty('value');

    this.addEventListener('focus', this._onFocus);
    this.addEventListener('click', this._onClick);
    this.addEventListener('keydown', this._onKeyDown);
  }

  disconnectedCallback() {
    this.removeEventListener('focus', this._onFocus);
    this.removeEventListener('click', this._onClick);
    this.removeEventListener('keydown', this._onKeyDown);
  }

  /**
   * Check if a property has an instance value. If so, copy the value, and
   * delete the instance property so it doesn't shadow the class property
   * setter. Finally, pass the value to the class property setter so it can
   * trigger any side effects.
   * This is to safe guard against cases where, for instance, a framework
   * may have added the element to the page and set a value on one of its
   * properties, but lazy loaded its definition. Without this guard, the
   * upgraded element would miss that property and the instance property
   * would prevent the class property setter from ever being called.
   */
  upgradeProperty(prop) {
    if (this.hasOwnProperty(prop)) {
      let value = this[prop];
      delete this[prop];
      this[prop] = value;
    }
  }

  /**
   * The `value` property's behavior is modeled after the `<select>` element.
   * If you set the `.value` of a `<select>` it will look for an `<option>`
   * with a corresponding `.value`.
   * However, if you use `setAttribute` to set the `value`, it will be ignored.
   */
  set value(val) {
    const newOption = this._allOptions().find(option => option.value == val);
    if (!newOption) {
      this.reset();
      return;
    } else {
      this._selectOption(newOption);
    }
  }

  get value() {
    const option = this._selectedOption();
    if (option)
      return option.value;
    return '';
  }

  _onFocus(event) {
    const selectedOption = this._selectedOption() || this._firstOption();
    this.setAttribute('aria-activedescendant', selectedOption.id);
    this._dispatch('input');
  }

  _onKeyDown(event) {
    // Don’t handle modifier shortcuts typically used by assistive technology.
    if (event.altKey)
      return;

    let newOption;
    switch (event.keyCode) {
      case KEYCODE.UP:
      case KEYCODE.LEFT:
        newOption = this._prevOption();
        break;

      case KEYCODE.DOWN:
      case KEYCODE.RIGHT:
        newOption = this._nextOption();
        break;

      case KEYCODE.HOME:
        newOption = this._firstOption();
        break;

      case KEYCODE.END:
        newOption = this._lastOption();
        break;

      // Any other key press is ignored and passed back to the browser.
      default:
        return;
    }

    // The browser might have some native functionality bound to the arrow
    // keys, home or end. The element calls `preventDefault` to prevent the
    // browser from taking any actions.
    event.preventDefault();
    this._selectOption(newOption);
    this._dispatch('input');
  }

  _onClick(event) {
    // If the click was not targeted on a option element itself,
    // it was a click inside the a listbox or on empty space. Nothing to do.
    if (event.target.getAttribute('role') !== 'option') return;
    // If it was on a option element, though, select that option.
    this._selectOption(event.target);
    this._dispatch('input');
  }

  _allOptions() {
    return Array.from(this.querySelectorAll('dash-option'));
  }

  _selectedOption() {
    return this._allOptions().find(option => option.selected);
  }

  _prevOption() {
    const options = this._allOptions();
    // Use `findIndex` to find the index of the currently
    // selected option and subtracts one to get the index of the previous
    // option.
    const newIdx = options.findIndex(option => option.selected) - 1;
    // Add `options.length` to make sure the index is a positive number
    // and get the modulus to wrap around if necessary.
    return options[(newIdx + options.length) % options.length];
  }

  _nextOption() {
    const options = this._allOptions();
    // Use `findIndex` to find the index of the currently
    // selected option and subtracts one to get the index of the previous
    // option.
    const newIdx = options.findIndex(option => option.selected) + 1;
    // Add `options.length` to make sure the index is a positive number
    // and get the modulus to wrap around if necessary.
    return options[newIdx % options.length];
  }

  _firstOption() {
    const options = this._allOptions();
    return options[0];
  }

  _lastOption() {
    const options = this._allOptions();
    return options[options.length - 1];
  }

  _selectOption(newOption) {
    // Deselect all options.
    this.reset();

    // Make the option selected/focusable.
    newOption.selected = true;
    this.setAttribute('aria-activedescendant', newOption.id);
  }

  reset() {
    const options = this._allOptions();
    options.forEach(option => {
      option.selected = false;
    });
  }

  _dispatch(event) {
    this.dispatchEvent(new CustomEvent(event, {
      detail: {
        value: this.value,
      },
      bubbles: true,
    }));
  }
}

window.customElements.define('dash-listbox', DashListbox);

// `dashOptionCounter` counts the number of `<dash-option>` instances created.
// The number is used to generated new, unique IDs for `aria-activedescendant`.
let dashOptionCounter = 0;

let optionTemplate = document.createElement('template');
optionTemplate.innerHTML = `
  <style>
    :host {
      display: block;
      padding: 8px;
      user-select: none;
      cursor: default;
    }

    :host([selected]) {
      color: white;
      background: #0E9688;
    }
  </style>
  <slot></slot>
`.trim();

ShadyCSS.prepareTemplate(optionTemplate, 'dash-option');
export class DashOption extends HTMLElement {
  static get observedAttributes() {
    // There's no need to observe the `value` attribute because there's no
    // side effects from setting it.
    return ['selected'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    if (!this._mounted) {
      ShadyCSS.styleElement(this);
      this.shadowRoot.appendChild(document.importNode(optionTemplate.content, true));
      this._mounted = true;
    }

    if (!this.hasAttribute('role'))
      this.setAttribute('role', 'option');

    if (!this.id)
      this.id = `dash-option-generated-${dashOptionCounter++}`;
    
    this.upgradeProperty('selected');
    this.upgradeProperty('value');
  }

  upgradeProperty(prop) {
    if (this.hasOwnProperty(prop)) {
      let value = this[prop];
      delete this[prop];
      this[prop] = value;
    }
  }

  set selected(value) {
    const isSelected = Boolean(value);
    if (isSelected)
      this.setAttribute('selected', '');
    else
      this.removeAttribute('selected');
  }

  get selected() {
    return this.hasAttribute('selected');
  }

  set value(val) {
    // Quick and dirty. Probably need to handle
    // null/undefined/""/[object Object] better buuut ¯\_(ツ)_/¯
    this.setAttribute('value', val);
  }

  get value() {
    return this.getAttribute('value');
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'selected')
      this.setAttribute('aria-selected', newValue !== null);
  }
}

window.customElements.define('dash-option', DashOption);
