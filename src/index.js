import hljs from 'highlight.js/lib/core';
import javascript from 'highlight.js/lib/languages/javascript';

import 'highlight.js/styles/github.css';
import './index.less';

hljs.registerLanguage('javascript', javascript);

let index = 0;

const { Suite, platform } = window.Benchmark;

export default class EmBenchmark {

    constructor({
        root = document.body,
        benchmarks = [],
        name = 'benchmark' + index++,
    } = {}) {

        this._root = root;

        this._handleClick = this._handleClick.bind(this);
        this._handleSuiteStart = this._handleSuiteStart.bind(this);
        this._handleSuiteCycle = this._handleSuiteCycle.bind(this);
        this._handleSuiteComplete = this._handleSuiteComplete.bind(this);
        this._handleBenchmarkStart = this._handleBenchmarkStart.bind(this);
        this._handleBenchmarkCycle = this._handleBenchmarkCycle.bind(this);
        this._handleBenchmarkComplete = this._handleBenchmarkComplete.bind(this);

        this._suite = new Suite(name, {
            onCycle: this._handleSuiteCycle,
            onComplete: this._handleSuiteComplete,
            onStart: this._handleSuiteStart,
        });

        benchmarks.forEach(benchmark => 
            this._suite.add(benchmark.name, benchmark.fn, {
                onStart: this._handleBenchmarkStart,
                onCycle: this._handleBenchmarkCycle,
                onComplete: this._handleBenchmarkComplete
            })
        );

        this._root.addEventListener('click', this._handleClick, false);

        this._render();

    }

    _handleSuiteStart() {
        console.log('suite start');
    }

    _handleSuiteCycle(event) {
        console.log('suite cycle', String(event.target));
    }

    _handleSuiteComplete() {
        console.log('suite complete');
    }

    _handleBenchmarkStart() {
        console.log('benchmark start');
    }

    _handleBenchmarkCycle(event) {
        console.log('benchmark cycle', String(event.target));
    }

    _handleBenchmarkComplete() {
        console.log('benchmark complete');
    }

    _handleClick(e) {
        switch(e.target.dataset.role) {
            case 'run-button':
                this.run({ 'async': true });
                break;
        }
    }

    _fixIndent(source, length) {
        let reg = new RegExp(`\\s{${length}}`)
        return source.split('\n').map(code => code.replace(reg, '')).join('\n');
    }

    _render() {

        let platformStr = platform.toString(),
            suite = this._suite,
            root = this._root,
            benchmarks = suite.map(benchmark => {

                let m = benchmark.fn.toString().match(/\n(\s*)/g),
                    trimLen = m[m.length - 1].length - 1;

                return `
                    <tr>
                        <td title="Click to run this test again.">${benchmark.name}</td>
                        <td>
                            <pre><code class="js">${this._fixIndent(benchmark.fn.toString(), trimLen)}</code></pre>
                        </td>
                        <td>Ready</td>
                    </tr>
                `;

            });

        root.innerHTML = `
            <div class="embedded-benchmark">
                <div class="header">
                    <div class="status">Ready to run.</div>
                    <div class="controls"><button data-role="run-button">Run tests</button></div>
                </div>
                <table>
                    <caption>Testing in ${platformStr}</caption>
                    <thead>
                        <tr>
                            <th colspan="2">Test</th>
                            <th title="Operations per second (higher is better)">Ops/sec</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${ benchmarks.join('') }
                    </tbody>
                </table>
            </div>
        `;

        root.querySelectorAll('pre code').forEach((block) => {
            hljs.highlightBlock(block);
        });

    }

    add(...args) {
        this._suite.add(...args);
        return this;
    }

    on() {
        return this;
    }

    run(...args) {
        this._suite.run(...args);
        return this;
    }

    destroy() {
        this._root.removeEventListener('click', this._handleClick);
    }

}
