const path = require('path')

module.exports = {
    contentBase: path.resolve(__dirname, '../public'),
    port: 8888,
    compress: true,
    historyApiFallback: true,
    hot: true,
    inline: true,
    open: true,
}