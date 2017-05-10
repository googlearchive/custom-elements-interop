
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

/**
 * Define key codes to help with handling keyboard events.
 */
const KEYCODE = {
  SPACE: 32,
};

/**
 * The `DashCheckbox` exposes a single `checked` attribute/property for
 * toggling its state. Changes to the `checked` property will also be
 * reflected to an `aria-checked` attribute. Similarly, the `disabled`
 * property is reflected to an `aria-disabled` attribute. This controls
 * whether the element is operable or not. Although native checkbox elements
 * also provide a `value` attribute, because it is only used for `<form>`
 * submissions, and this element can't take part in that process, it has
 * been omitted.
 */
export class DashCheckbox extends HTMLElement {
  static get observedAttributes() {
    return ['checked', 'disabled'];
  }

  /**
   * `connectedCallback` sets the initial `role`, `tabindex`,
   * internal state, and installs event listeners.
   */
  connectedCallback() {
    if (!this.hasAttribute('role'))
      this.setAttribute('role', 'checkbox');
    if (!this.hasAttribute('tabindex'))
      this.setAttribute('tabindex', 0);

    this.addEventListener('keydown', this._onKeyDown);
    this.addEventListener('click', this._onClick);
  }

  /**
   * `disconnectedCallback` fires whenever the element is removed from
   * the DOM. It's a good place to do clean up work like releasing
   * references and removing event listeners.
   */
  disconnectedCallback() {
    this.removeEventListener('keydown', this._onKeyDown);
    this.removeEventListener('click', this._onClick);
  }

  /**
   * The `checked` property reflects its state to the `checked` and
   * attributes. This element supports setting properties to falsey values
   * like `undefined`, `null`, or `''` which are then converted to
   * `true|false`. This is done to match the behavior of native HTML Elements.
   */
  set checked(value) {
    const isChecked = Boolean(value);
    if (isChecked)
      this.setAttribute('checked', '');
    else
      this.removeAttribute('checked');
  }

  get checked() {
    return this.hasAttribute('checked');
  }

  /**
   * The `disabled` property reflects its state to the `disabled` attribute.
   */
  set disabled(value) {
    const isDisabled = Boolean(value);
    if (isDisabled)
      this.setAttribute('disabled', '');
    else
      this.removeAttribute('disabled');
    // The `tabindex` attribute does not provide a way to fully remove
    // focusability from an element.
    // Elements with `tabindex=-1` can still be focused with
    // a mouse or by calling `focus()`.
    // To make sure an element is disabled and not focusable, remove the
    // `tabindex` attribute.
    if (isDisabled) {
      this.removeAttribute('tabindex');
      // If the focus is currently on this element, unfocus it by
      // calling the `HTMLElement.blur()` method.
      if (document.activeElement === this)
        this.blur();
    } else {
      this.setAttribute('tabindex', '0');
    }
  }

  get disabled() {
    return this._disabled;
  }

  /**
   * `attributeChangedCallback` watches for changes to the `checked`
   * and `disabled` attributes and triggers any side effects.
   * It will be called at startup time if either attribute has been set.
   */
  attributeChangedCallback(name, oldValue, newValue) {
    switch (name) {

      case 'checked':
        this.setAttribute('aria-checked', newValue !== null);
        break;

      case 'disabled':
        const isDisabled = newValue !== null;
        this.setAttribute('aria-disabled', isDisabled);
        // Also remove the `tabindex` attribute if disabled is true.
        // This means a disabled checkbox will be visible, but no longer
        // operable.
        if (isDisabled) {
          this.removeAttribute('tabindex');
          // If the focus is currently on this element, unfocus it by
          // calling the `HTMLElement.blur()` method.
          if (document.activeElement === this)
            this.blur();
        } else {
          this.setAttribute('tabindex', '0');
        }
        break;

    }
  }

  _onKeyDown(event) {
    // Don’t handle modifier shortcuts typically used by assistive technology.
    if (event.altKey)
      return;

    switch (event.keyCode) {
      case KEYCODE.SPACE:
        event.preventDefault();
        this._toggleChecked();
        break;
      // Any other key press is ignored and passed back to the browser.
      default:
        return;
    }
  }

  _onClick(event) {
    this._toggleChecked();
  }

  /**
   * `_toggleChecked` calls the `checked` setter and flips its state.
   * Because `_toggleChecked` is only caused by a user action, it will
   * also dispatch a change event. This event bubbles in order to mimic
   * the native behavior of `<input type=checkbox>`.
   */
  _toggleChecked() {
    if (this.disabled)
      return;
    this.checked = !this.checked;
    this.dispatchEvent(new CustomEvent('change', {
      detail: {
        checked: this.checked,
      },
      bubbles: true,
    }));
  }
}

window.customElements.define('dash-checkbox', DashCheckbox);
