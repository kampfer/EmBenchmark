import { Suite, platform } from 'Benchmark';

import './index.less';

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

    _render() {

        let platformStr = platform.toString(),
            suite = this._suite,
            root = this._root,
            benchmarks = suite.map(benchmark => `
                <tr>
                    <td title="Click to run this test again.">${benchmark.name}</td>
                    <td>${benchmark.fn.toString()}</td>
                    <td>Ready</td>
                </tr>
            `);

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
