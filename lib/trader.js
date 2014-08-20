'use strict';

var querystring = require('querystring');
var Wreck       = require('wreck');
var crypto      = require('crypto');

var common      = require('./common');


// copy relevant convienient constants
var config          = require('../config');
var SATOSHI_FACTOR  = config.SATOSHI_FACTOR;
var API_ENDPOINT    = config.API_ENDPOINT;
var FUDGE_FACTOR    = config.FUDGE_FACTOR;


function processError(response) {
  var errs = [];
  for (var type in response.error) {
    var typeName = type === '__all__' ? 'Other' : type;
    errs.push(typeName + ': ' + response.error[type]);
  }

  return new Error(errs.join('; '));
};


exports.purchase = function purchase(satoshis, opts, callback) {
  opts = opts || {};

  var bitcoins = satoshis / SATOSHI_FACTOR;
  var price = opts.price * FUDGE_FACTOR;

  var priceStr = price.toFixed(2);
  var amountStr = bitcoins.toFixed(8);

  common.authRequest('buy/', {
    amount:amountStr,
    price:priceStr

  }, function(err, response) {
    if (err) return callback(err);

    if (response.error)
      return callback(processError(response));

    callback(null, response);
  });

};
exports.sell = function sell(satoshis, opts, callback) {
  opts = opts || {};

  var bitcoins = satoshis / SATOSHI_FACTOR;
  var price = opts.price * FUDGE_FACTOR;

  var priceStr = price.toFixed(2);
  var amountStr = bitcoins.toFixed(8);

  common.authRequest('sell/', {
    amount:amountStr,
    price:priceStr

  }, function(err, response) {
    if (err) return callback(err);

    if (response.error)
      return callback(processError(response));

    callback(null, response);
  });

};
