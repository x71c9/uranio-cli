module.exports = {
	root: true,
	env: {
		node: true
	},
	parser: '@typescript-eslint/parser',
	plugins: [
		'@typescript-eslint'
	],
	extends: [
		'eslint:recommended',
		'plugin:@typescript-eslint/eslint-recommended',
		'plugin:@typescript-eslint/recommended'
	],
	parserOptions: {
		ecmaVersion: 2020,
		sourceType: "module"
	},
	rules: {
		'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
		'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
		'semi': ['warn', 'always'],
		'padded-blocks': ['off', 'always'],
		'no-tabs': ['error', {allowIndentationTabs: true}],
		'indent': ['warn', 'tab', {SwitchCase: 1}],
		'space-before-function-paren': ['off', 'always'],
		'space-before-blocks': ['off', 'always'],
		'object-curly-spacing': ['off', 'always'],
		'no-trailing-spaces': ['warn', {skipBlankLines: true}],
		'no-multiple-empty-lines': ['warn', {max: 3}],
		'keyword-spacing': ['off'],
		'camelcase': ['off'],
		'@typescript-eslint/no-explicit-any': ['off'],
		'@typescript-eslint/no-empty-interface': ['off'],
		'@typescript-eslint/no-namespace': ['off'],
		'@typescript-eslint/no-non-null-assertion': ['off']
	}
};
