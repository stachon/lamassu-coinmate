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

  var options = {
    headers: {
      'User-Agent': 'Mozilla/4.0 (compatible; Lamassu ' + NAME + ' node.js client)',
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    json: true,
    payload: querystring.stringify(data)
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
    callback(null, {
      EUR: parseFloat(response.data.EUR.available),
      BTC: parseFloat(response.data.BTC.available)
    });
  });
};
