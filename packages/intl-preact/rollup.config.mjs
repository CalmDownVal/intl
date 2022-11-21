import typescript from '@rollup/plugin-typescript';
import deleteBeforeBuild from 'rollup-plugin-delete';
import definitions from 'rollup-plugin-dts';
import externals from 'rollup-plugin-node-externals';
import { terser } from 'rollup-plugin-terser';

const codeOutputOpts = {
	exports: 'named',
	sourcemap: true
};

// eslint-disable-next-line import/no-default-export
export default [
	{
		input: './src/index.ts',
		output: [
			{
				...codeOutputOpts,
				file: './build/index.min.js',
				format: 'cjs'
			},
			{
				...codeOutputOpts,
				file: './build/index.min.mjs',
				format: 'esm'
			}
		],
		plugins: [
			deleteBeforeBuild({
				targets: './build/*',
				runOnce: true
			}),
			externals(),
			typescript(),
			terser({
				output: {
					comments: false
				}
			})
		]
	},
	{
		input: './src/index.ts',
		output: {
			file: './build/index.d.ts',
			format: 'es'
		},
		plugins: [
			typescript(),
			definitions()
		]
	}
];
