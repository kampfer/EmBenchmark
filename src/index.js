let content = `<div class="embedded-benchmark">
  <div class="header">
    <div class="status">Ready to run.</div>
    <div class="controls">Run tests</div>
  </div>
  <table>
    <caption>Testing in Chrome 83.0.4103 / Windows 10 0.0.0</caption>
    <thead>
      <tr>
        <td colspan="2">Test</td>
        <td title="Operations per second (higher is better)">Ops/sec</td>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td title="Click to run this test again.">TypedArray create</td>
        <td>some code</td>
        <td title="Ran 46,212 times in 0.104 seconds.">445,043</td>
      </tr>
    </tbody>
  </table>
</div>`;

import { Suite } from 'Benchmark';

export default class EmBenchmark {

    constructor({
        root = document.body
    } = {}) {

        this._suite = new Suite();

        this._root = root;

        this._render();

    }

    _render() {
        this._root.innerHTML = content;
    }

    add(...args) {
        this._suite.add(...args);
        return this;
    }

    on() {
        return this;
    }

    run() {

        return this;
    }

}
