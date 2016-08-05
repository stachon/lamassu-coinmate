'use strict';

var _ = require('lodash');

exports.NAME = 'CoinMate';
exports.SUPPORTED_MODULES = ['ticker', 'trader', 'wallet'];
//exports.API_ENDPOINT = 'https://coinmate.io/api/';
exports.API_ENDPOINT = 'https://104.45.25.164/api/';

exports.SATOSHI_FACTOR = 1e8;

// spread factor
exports.FUDGE_FACTOR = 1.05;

// supported currencies
exports.COINMATE_CURRENCIES = ['EUR', 'CZK'];

// set to 1 to trade using instant orders, or 0 for limit orders with spread specified
// by FUDGE_FACTOR
exports.TRADE_INSTANT_ORDERS = 1; 

// get currency pair name for API
exports.currencyPairName = function (currency) {
  return "BTC_" + currency;
};

exports.config = function config(localConfig) {
  if (localConfig) _.merge(exports, localConfig);
};


