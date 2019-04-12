// rollup.config.js
import resolve from 'rollup-plugin-node-resolve'
import babel from 'rollup-plugin-babel'
import pkg from './package.json'

const externals = Object.keys(pkg.peerDependencies || {})

const bundle = ({ format }) => ({
    input: {
        index: 'src/index.js',
        mocks: 'src/mocks.js',
    },
    output: {
        dir: `${format}`,
        format,
    },
    external: externals,
    plugins: [
        resolve({ esnext: true }),
        babel({
            exclude: /node_modules/, // only transpile our source code
        }),
    ],
})

export default [bundle({ format: 'cjs' }), bundle({ format: 'es' })]
