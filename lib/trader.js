'use strict';

var common      = require('./common');
var ticker      = require('./ticker').ticker;

// copy relevant convienient constants
var config          = require('../config');
var SATOSHI_FACTOR  = config.SATOSHI_FACTOR;
var FUDGE_FACTOR    = config.FUDGE_FACTOR;
var TRADE_INSTANT_ORDERS = config.TRADE_INSTANT_ORDERS;

function getProperPrice(price, type, callback) {

  if (price !== null) {
    if (typeof price === 'string') {
      try {
        price = parseFloat(price);
      } catch(e) {
        return callback(new Error('invalid price'));
      }
    }

    return callback(null, price.toFixed(2));
  }

  ticker('EUR', function(err, response) {
    if (err) return callback(err);

    price = response.EUR.rates[type];

    if (type === 'ask') price *= FUDGE_FACTOR;
    else price /= FUDGE_FACTOR;

    callback(null, price.toFixed(2));
  });
}

function purchaseInstant(satoshis, opts, callback) {

  // buy is specified in EUR so we need to get price to convert from satoshis
  getProperPrice(null, 'ask', function(err, price) {

    if (err) return callback(err);

    common.authRequest('buyInstant', {
      total: (price * satoshis / SATOSHI_FACTOR).toFixed(2),
      currencyPair: 'BTC_EUR'

    }, function(err, response) {
      if (err) return callback(err);

      if (response.error)
        return callback(processError(response));

      callback(null, response);
    });
  });


};

function sellInstant(satoshis, opts, callback) {
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

function purchaseLimit(satoshis, opts, callback) {

  // buy is specified in EUR so we need to get price to convert from satoshis
  getProperPrice(null, 'ask', function(err, price) {

    if (err) return callback(err);

    common.authRequest('buyLimit', {
      total: (price * satoshis / SATOSHI_FACTOR).toFixed(2),
      price: price,
      currencyPair: 'BTC_EUR'

    }, function(err, response) {
      if (err) return callback(err);

      if (response.error)
        return callback(processError(response));

      callback(null, response);
    });
  });


};

function sellLimit(satoshis, opts, callback) {
  getProperPrice(null, 'bid', function(err, price) { 
    common.authRequest('sellLimit', {
      amount: (satoshis / SATOSHI_FACTOR).toFixed(8),
      price: price,
      currencyPair: 'BTC_EUR'

    }, function(err, response) {
      if (err) return callback(err);

      if (response.error)
        return callback(processError(response));

      callback(null, response);
    });
  });
};

exports.purchase = function purchase(satoshis, opts, callback) {

  if (TRADE_INSTANT_ORDERS == 1) {
    purchaseInstant(satoshis, opts, callback);
  } else {
    purchaseLimit(satoshis, opts, callback);
  }


};

exports.sell = function sell(satoshis, opts, callback) {
  
  if (TRADE_INSTANT_ORDERS == 1) {
    sellInstant(satoshis, opts, callback);
  } else {
    sellLimit(satoshis, opts, callback);
  }

};


function processError(response) {
  var error = response.errorMessage;
  var err = new Error(error);
  if (error.indexOf('Minimum Order Size') !== -1)
    err.name = 'orderTooSmall';
  return err;
}
