import EmBenchmark from './EmBenchmark';

export { EmBenchmark };

export function createEmBenchmark(name, root) {

    let setup,
        benchmarks = [],
        scripts = document.body.getElementsByTagName('script');

    for(let script of scripts) {

        if (script.type === "text/code") {

            if (script.dataset.setup !== undefined) {

                setup = script.innerText;

            }

            if (script.dataset.test !== undefined) {

                benchmarks.push({
                    name: script.dataset.test,
                    fn: script.innerText,
                    defer: script.dataset.defer === 'true',
                    setup
                });

            }

        }

    }

    return new EmBenchmark({
        root,
        name,
        benchmarks
    });

}