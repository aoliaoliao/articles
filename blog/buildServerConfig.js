const webpack = require('webpack')
const webpackConfig = require('./build/webpack.server.config')

console.log(webpackConfig)


webpack(webpackConfig, (err, stats) => {
  console.error(err)
})