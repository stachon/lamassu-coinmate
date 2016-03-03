'use strict';

var common      = require('./common');
var ticker      = require('./ticker').ticker;

// copy relevant convienient constants
var config          = require('../config');
var SATOSHI_FACTOR  = config.SATOSHI_FACTOR;
var FUDGE_FACTOR    = config.FUDGE_FACTOR;

exports.purchase = function purchase(satoshis, opts, callback) {
  common.authRequest('buyInstant', {
    total: (satoshis / SATOSHI_FACTOR).toFixed(2),
    currencyPair: 'BTC_EUR'

  }, function(err, response) {
    if (err) return callback(err);

    if (response.error)
      return callback(processError(response));

    callback(null, response);
  });
};

exports.sell = function sell(satoshis, opts, callback) {
  common.authRequest('sellInstant', {
    amount: (satoshis / SATOSHI_FACTOR).toFixed(8),
    currencyPair: 'BTC_EUR'

  }, function(err, response) {
    if (err) return callback(err);

    if (response.error)
      return callback(processError(response));

    callback(null, response);
  });
};



function processError(response) {
  var error = response.errorMessage;
  var err = new Error(error);
  if (error.indexOf('Minimum Order Size') !== -1)
    err.name = 'orderTooSmall';
  return err;
}
