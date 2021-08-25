const CracoAntDesignPlugin = require('craco-antd')

module.exports = {
  plugins: [{ plugin: CracoAntDesignPlugin }],
  webpack: {
    configure: {
      optimization: {
        splitChunks: false,
      },
      // See https://github.com/webpack/webpack/issues/6725
      module: {
        rules: [
          {
            test: /\.wasm$/,
            type: 'javascript/auto',
          },
        ],
      },
    },
  },
}
