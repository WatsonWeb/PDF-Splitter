module.exports = {
	'env': {
		'browser': true
	},
	'extends': 'eslint:recommended',
	'globals': {
		'app': 'readonly',
		'documentFileName': 'readonly'
	},
	'rules': {
		'indent': [
			'error',
			'tab'
		],
		'linebreak-style': [
			'error',
			'unix'
		],
		'quotes': [
			'error',
			'single'
		],
		'semi': [
			'error',
			'always'
		],
		'no-unused-vars': [
			'error',
			{'varsIgnorePattern': 'rdExtractAndEmail'}
		]
	}
};