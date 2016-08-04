'use strict';

var querystring = require('querystring');
var Wreck       = require('wreck');
var crypto      = require('crypto');
var _           = require('lodash');


// copy relevant convienient constants
var config          = require('../config');
var API_ENDPOINT    = config.API_ENDPOINT;
var NAME            = config.NAME;
var SATOSHI_FACTOR  = config.SATOSHI_FACTOR;

var COINMATE_CURRENCIES = config.COINMATE_CURRENCIES;

exports.authRequest = function authRequest(path, data, callback) {

  // TODO: check for credentials existance
  if (!config.key || !config.secret || !config.clientId)
    return callback(new Error('Must provide key, secret and client ID to make this API request'));

  data = data || {};

  var nonce = Date.now();
  var msg = nonce + config.clientId + config.key;

  var signature = crypto
    .createHmac('sha256', new Buffer(config.secret, 'utf8'))
    .update(msg)
    .digest('hex')
    .toUpperCase();

  _.merge(data, {
    signature: signature,
    clientId: config.clientId,
    nonce: nonce
  });
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"; // FIXME
  var options = {
    headers: {
      'User-Agent': 'Mozilla/4.0 (compatible; Lamassu ' + NAME + ' node.js client)',
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    json: true,
    payload: querystring.stringify(data),
    rejectUnauthorized: false, //TODO FIXME remove before release!!!
  };

  var uri = API_ENDPOINT + path;

  Wreck.post(uri, options, function(err, res, payload) {
    callback(err, payload);
  });
};


// required by either Wallet or Trader
exports.balance = function balance(callback) {
  exports.authRequest('balances', null, function(err, response) {
    if (err) return callback(err);
    // BTC balance
    result = {
      BTC: Math.round(parseFloat(response.data.BTC.available)*SATOSHI_FACTOR)
    }
    // other currencies
    for (var i=0; i<COINMATE_CURRENCIES.length; i++) {
      var currency = COINMATE_CURRENCIES[i];
      result[currency] = parseFloat(response.data[currency].available)
    }
    callback(null, result);
  });
};
