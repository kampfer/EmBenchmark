import hljs from 'highlight.js/lib/core';
import javascript from 'highlight.js/lib/languages/javascript';

import 'highlight.js/styles/github.css';
import './index.less';

hljs.registerLanguage('javascript', javascript);

let index = 0;

const { Suite, platform, formatNumber } = window.Benchmark;

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
        this._handleSuiteAbort = this._handleSuiteAbort.bind(this);
        this._handleBenchmarkStart = this._handleBenchmarkStart.bind(this);
        this._handleBenchmarkCycle = this._handleBenchmarkCycle.bind(this);
        this._handleBenchmarkComplete = this._handleBenchmarkComplete.bind(this);
        this._handleBenchmarkAbort = this._handleBenchmarkAbort.bind(this);

        this._suite = new Suite(name, {
            onCycle: this._handleSuiteCycle,
            onComplete: this._handleSuiteComplete,
            onStart: this._handleSuiteStart,
            onAbort: this._handleSuiteAbort,
        });

        benchmarks.forEach(benchmark => 
            this._suite.add(benchmark.name, benchmark.fn, {
                onStart: this._handleBenchmarkStart,
                onCycle: this._handleBenchmarkCycle,
                onComplete: this._handleBenchmarkComplete,
                onAbort: this._handleBenchmarkAbort,
                setup: benchmark.setup
            })
        );

        this._root.addEventListener('click', this._handleClick, false);

        this._render();

    }

    _handleSuiteStart() {
        this._showStopBtn();
        for(let item of this._benchmarkList) {
            let td = item.querySelector('td:last-child');
            td.className = '';
            td.innerHTML = 'pending…';
        }
    }

    _handleSuiteCycle() {
        console.log('suite cycle');
    }

    _handleSuiteComplete() {

        let suite = this._suite;

        if (suite.aborted) return;

        this._statusWrapper.innerHTML = 'Done. Ready to run again.';
        this._showRunBtn();

        this._renderAllResults();

    }

    _handleSuiteAbort() {
        for(let item of this._benchmarkList) {
            let td = item.querySelector('td:last-child');
            td.className = '';
            td.innerHTML = 'Ready';
        }

        this._statusWrapper.innerHTML = 'Ready to run again.';
        this._showRunBtn();
    }

    _handleBenchmarkStart(event) {

        let benchmark = event.target,
            td = this._root.querySelector(`#benchmark-${benchmark.id}>td:last-child`);

        td.className = '';
        td.innerHTML = 'pending…';

        this._showStopBtn();

    }

    _handleBenchmarkCycle(event) {
        let benchmark = event.target,
            name = benchmark.name,
            hz = benchmark.hz,
            size = benchmark.stats.sample.length;

        // direct × 61,481,828 (49 samples)
        this._statusWrapper.innerHTML = `${name} x ${formatNumber(hz.toFixed(hz < 100 ? 2 : 0))} (${size} samples)`;
    }

    _handleBenchmarkComplete(event) {

        let suite = this._suite,
            benchmark = event.target,
            benchmarkTd = this._root.querySelector(`#benchmark-${benchmark.id}>td:last-child`);

        if (benchmark.aborted) return;

        if (suite.running) {
            benchmarkTd.innerHTML = 'completed';
        } else {
            this._statusWrapper.innerHTML = 'Done. Ready to run again.';
            this._showRunBtn();
            this._renderAllResults();
        }

    }

    _handleBenchmarkAbort(event) {
        let benchmark = event.target,
            td = this._root.querySelector(`#benchmark-${benchmark.id}>td:last-child`);

        td.className = '';
        td.innerHTML = 'Ready';

        this._statusWrapper.innerHTML = 'Ready to run again.';
        this._showRunBtn();
    }

    _handleClick(e) {
        switch(e.target.dataset.role) {
            case 'run-button':
                this.run();
                break;
            case 'stop-button':
                this.stop();
                break;
            case 'benchmark-trigger':
                this.toggleBenchMark(e.target.dataset.id);
                break;
        }
    }

    _fixIndent(source, length) {
        let reg = new RegExp(`\\s{${length}}`)
        return source.split('\n').map(code => code.replace(reg, '')).join('\n');
    }

    _render() {

        // 每个embenchmark只能render一次
        if (this._domElem) return;

        let platformStr = platform.toString(),
            suite = this._suite,
            root = this._root,
            domElem = document.createElement('div'),
            benchmarks = suite.map(benchmark => {

                let m = benchmark.fn.toString().match(/\n(\s*)/g),
                    trimLen = m[m.length - 1].length - 1;

                return `
                    <tr id="benchmark-${benchmark.id}">
                        <td width="200" title="Click to run this test again." data-role="benchmark-trigger" data-id="${benchmark.id}">${benchmark.name}</td>
                        <td>
                            <pre><code class="js">${this._fixIndent(benchmark.fn.toString(), trimLen)}</code></pre>
                        </td>
                        <td>Ready</td>
                    </tr>
                `;

            });

        domElem.className = 'embedded-benchmark';

        domElem.innerHTML = `
            <div class="header">
                <div class="status">Ready to run.</div>
                <div class="controls">
                    <button data-role="run-button" class="run-btn">Run tests</button>
                    <button data-role="stop-button" class="stop-btn">Stop running</button>
                </div>
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
        `;

        domElem.querySelectorAll('pre code').forEach((block) => {
            hljs.highlightBlock(block);
        });

        this._runBtn = domElem.querySelector('[data-role="run-button"]');
        this._stopBtn = domElem.querySelector('[data-role="stop-button"]');
        this._statusWrapper = domElem.querySelector('.status');
        this._benchmarkList = domElem.querySelectorAll('table>tbody>tr');

        this._domElem = domElem;

        root.appendChild(domElem);

    }

    _renderResult(benchmark, fastest, slowest) {

        let benchmarkTd = this._root.querySelector(`#benchmark-${benchmark.id}>td:last-child`),
            innerHTML = `${formatNumber(Math.round(benchmark.hz))}<small>±${benchmark.stats.rme.toFixed(2)}%</small>`;

        benchmarkTd.className = '';

        if ((!fastest && !slowest) || benchmark.id === fastest.id) {
            innerHTML += '<small>fastest</small>';
            benchmarkTd.classList.add('fastest')
        } else {
            if (benchmark.id === slowest.id) benchmarkTd.classList.add('slowest')

            let rate = (fastest.hz - benchmark.hz) / fastest.hz;
            innerHTML += `<small>${ Math.round(rate * 100) }% slower</small>`;
        }

        benchmarkTd.innerHTML = innerHTML;

    }

    _renderAllResults() {

        let suite = this._suite,
            fastestBenchmark = null,
            slowestBenchmark = null;

        suite.forEach(benchmark => {

            if (!fastestBenchmark || benchmark.hz > fastestBenchmark.hz) fastestBenchmark = benchmark;
            if (!slowestBenchmark || benchmark.hz < slowestBenchmark.hz) slowestBenchmark = benchmark;

        });

        // 如果没有hz值，表示benchmark还未执行，不修改结果，保持pendding状态
        suite.forEach(benchmark => Object.prototype.hasOwnProperty.call(benchmark, "hz") && this._renderResult(benchmark, fastestBenchmark, slowestBenchmark));

    }

    _showRunBtn() {
        this._stopBtn.style.display = 'none';
        this._runBtn.style.display = 'unset';
    }

    _showStopBtn() {
        this._stopBtn.style.display = 'unset';
        this._runBtn.style.display = 'none';
    }

    run() {
        this._suite.run({ 'async': true });
        return this;
    }

    toggleBenchMark(id) {
        this._suite.forEach(function(benchmark) {
            if (benchmark.id == id) {
                if (benchmark.running) {
                    benchmark.abort();
                } else {
                    benchmark.run({ 'async': true });
                }
            }
        });
    }

    stop() {
        let suite = this._suite;
        if (suite.running) {
            suite.abort();
        } else {
            suite.forEach(benchmark => benchmark.running && benchmark.abort());
        }
        return this;
    }

    destroy() {
        this._root.removeEventListener('click', this._handleClick);
        this._root.removeChild(this._domElem);
    }

}
