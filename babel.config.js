const BABEL_ENV = process.env.BABEL_ENV
const isEsModule = BABEL_ENV != null && BABEL_ENV !== 'cjs'
const isDev = process.env.NODE_ENV === 'development'

module.exports = function (api) {
  api.cache(true);
  let plugins = [
    ["@babel/plugin-proposal-class-properties"]//for static prop
  ];
  let presets = [
    [
      "@babel/preset-env",
      {
        // loose: true,
        // targets: {
        //   browsers: ['last 2 versions', 'ie >= 9'],
        //   node: 'current'
        // },
        modules: isEsModule ? false : 'commonjs'
      },
    ],
    "@babel/preset-react"];
  // if (!isDev) presets.unshift("minify")
  return {
    presets,
    plugins
  };
}
