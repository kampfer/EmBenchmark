import { Suite, platform } from 'Benchmark';
import hljs from 'highlight.js/lib/core';
import javascript from 'highlight.js/lib/languages/javascript';
import 'highlight.js/styles/github.css';

import './index.less';

// hljs.configure({useBR: true});
hljs.registerLanguage('javascript', javascript);

export default class EmBenchmark {

    constructor({
        root = document.body,
        benchmarks = [],
    } = {}) {

        this._suite = new Suite();

        this._root = root;

        benchmarks.forEach(benchmark => this._suite.add(benchmark.name, benchmark.fn));

        this._render();

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
                        <td><pre><code class="js">${/*hljs.fixMarkup(benchmark.fn.toString())*/this._fixIndent(benchmark.fn.toString(), trimLen)}</code></pre></td>
                        <td>Ready</td>
                    </tr>
                `;

            });

        root.innerHTML = `
            <div class="embedded-benchmark">
                <div class="header">
                    <div class="status">Ready to run.</div>
                    <div class="controls"><button>Run tests</button></div>
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

    run() {
        console.log(this);
        return this;
    }

}
