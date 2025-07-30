module.exports = {
  default: {
    require: ['features/step-definitions/*.js'],
    format: ['progress-bar'],
    formatOptions: { snippetInterface: 'async-await' },
    publishQuiet: true
  }
}; 