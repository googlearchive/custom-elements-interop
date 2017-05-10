
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

const babel = require('rollup-plugin-babel');

module.exports = [{
  entry: 'src/dash-listbox.js',
  format: 'umd',
  moduleName: 'DashListbox',
  dest: 'dist/dash-listbox.umd.js',
  plugins: [
    babel({
      exclude: 'node_modules/**',
    }),
  ],
}, {
  entry: 'src/dash-listbox.js',
  dest: 'dist/dash-listbox.es5.js',
  plugins: [
    babel({
      exclude: 'node_modules/**',
    })
  ],
}, {
  entry: 'src/dash-listbox.js',
  dest: 'dist/dash-listbox.js'
}];
