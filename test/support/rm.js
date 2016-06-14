'use strict'

const { promisify } = require('bluebird')
const rimraf = promisify(require('rimraf'))

const MAX_RETRY = (process.env.APPVEYOR) ? 10 : 3

module.exports = function rm(file) {
  return rimraf(file, { maxBusyRetry: MAX_RETRY })
}