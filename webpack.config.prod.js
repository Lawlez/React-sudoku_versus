const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const Analyzer = require('webpack-bundle-analyzer')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
module.exports = {
	entry: './src/index.js',
	mode: 'production',
	target: 'web',
	output: {
		path: path.join(__dirname, 'build'),
		filename: 'bundle.js',
	},
	plugins: [
		new HtmlWebpackPlugin({
			template: 'public/index.html',
			title: 'Sudoku Versus',
			meta: {
				viewport:
					'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no',
				'Content-Security-Policy':
					'default-src none; script-src self; connect-src self 192.168.100.211 ws://192.168.100.211:8080 http://www.reddit.com; img-src self http://www.reddit.com https://i.redd.it data: http://192.168.100.211:3000; style-src self unsafe-inline; manifest-src self',
			},
			minify: {
				removeComments: true,
				collapseWhitespace: true,
				useShortDoctypes: true,
				minifyJS: true,
				minifyCSS: true,
				minifyURLs: true,
			},
		}),
		new Analyzer.BundleAnalyzerPlugin({analyzerMode: 'static'}),
		new MiniCssExtractPlugin({
			filename: '[name].[contenthash].css',
		}),
	],
	resolve: {
		alias: {
			'@material-ui/styles': path.resolve(
				__dirname,
				'node_modules',
				'@material-ui/styles',
			),
		},
	},
	module: {
		rules: [
			{
				test: /\.js$/,
				exclude: /node_modules/,
				use: {
					loader: 'babel-loader',
				},
			},
			{
				test: /\.css$/,
				use: [
					MiniCssExtractPlugin.loader,
					{
						loader: 'css-loader',
						options: {
							sourceMap: true,
						},
					},
					{
						loader: 'postcss-loader',
						options: {
							plugins: () => [require('cssnano')],
							sourceMap: true,
						},
					},
				],
			},
			{
				test: /\.html$/,
				use: ['html-loader'],
			},
		],
	},
	devtool: 'source-map',
	devServer: {
		contentBase: path.join(__dirname, 'build'),
		overlay: true,
		hot: true,
		open: true,
		compress: true,
		port: 3000,
		https: false,
	},
}