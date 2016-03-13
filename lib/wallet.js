'use strict';

var common      = require('./common');

// copy relevant convienient constants
var config          = require('../config');
var SATOSHI_FACTOR  = config.SATOSHI_FACTOR;
var FUDGE_FACTOR    = config.FUDGE_FACTOR;

exports.sendBitcoins = function (address, satoshis, fee, callback) {
  var amount = (satoshis / SATOSHI_FACTOR).toFixed(8);

  common.authRequest('bitcoinWithdrawal', {
    amount: amount,
    address: address

  }, function(err, response) {
    if (err) return callback(err);

    if (response.error)
      return callback(processError(response));

    callback(null, response.data.toString());
  });
};


exports.newAddress = function (info, callback) {

  common.authRequest('bitcoinDepositAddresses', null, function(err, response) {
    if (err) return callback(err);

    if (response.error)
      return callback(processError(response));

    if (Object.keys(response.data).length > 0) {
      callback(null, response.data[0]);
    } else {
      callback(null, new Error('No deposit addresses!'));
    }
  });
};

function processError(response) {
  var error = response.errorMessage;
  var err = new Error(error);

  return err;
}

