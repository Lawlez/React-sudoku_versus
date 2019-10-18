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
			{
				test: /\.(png|jp(e*)g|svg)$/,
				use: [
					{
						loader: 'url-loader',
						options: {
							limit: 8000, // Convert images < 8kb to base64 strings
							name: 'images/[hash]-[name].[ext]',
						},
					},
				],
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