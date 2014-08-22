'use strict';

var _ = require('lodash');

exports.NAME = 'Bitstamp';
exports.SUPPORTED_MODULES = ['ticker', 'trader'];
exports.API_ENDPOINT = 'https://www.bitstamp.net/api/';


exports.SATOSHI_FACTOR = 1e8;
exports.FUDGE_FACTOR = .05;

exports.config = function config(config) {
  if (config) _.merge(exports, config);
};
