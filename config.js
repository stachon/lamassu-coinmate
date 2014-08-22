'use strict';

var _ = require('lodash');

exports.NAME = 'Bitstamp';
exports.SUPPORTED_MODULES = ['ticker', 'trader'];
exports.API_ENDPOINT = 'https://www.bitstamp.net/api/';


exports.SATOSHI_FACTOR = 1e8;
exports.FUDGE_FACTOR = 1.05;

exports.config = function config(localConfig) {
  if (localConfig) _.merge(exports, localConfig);
};
