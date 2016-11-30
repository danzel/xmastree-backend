module.exports = function (w) {

	return {
		files: [
			'src/**/*.ts',
			'test/util.ts'
		],

		tests: [
			'test/**/*Spec.ts'
		],

		testFramework: 'ava',
		env: {
			type: 'node'
		},

		delays: {
			run: 500
		}
	};
};