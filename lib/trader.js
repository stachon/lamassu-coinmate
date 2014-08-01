'use strict';

var BitstampClient = require('bitstamp');

var SATOSHI_FACTOR = Math.pow(10,8);
var FUDGE_FACTOR = 1.1;

var BitstampTrade = function(config) {
  this.client = new BitstampClient(config.key, config.secret, config.clientId);
  this._currency = config.currency || 'USD';
};

BitstampTrade.factory = function factory(config) {
  return new BitstampTrade(config);
};

// Public functions

BitstampTrade.prototype.balance = function balance(callback) {
  var client = this.client;
  client.balance(function(err, json) {
    if (err) {
      return callback(err);
    }

    if (json.error) {
      if (json.error === 'API key not found' && client.key) {
        var err = 'Please activate your API key on Bitstamp';
        console.dir(err);
        return callback(new Error(err));
      }

      console.dir(json.error); // DEBUG
      return callback(new Error(json.error));
    }

    // jshint camelcase: false
    callback(null, parseFloat(json.usd_available, 10));
    // jshint camelcase: true
  });
};

BitstampTrade.prototype.currency = function currency() {
  return this._currency;
};

BitstampTrade.prototype.purchase = function purchase(satoshis, currentPrice, callback) {
  // TODO DEV
  var bitcoins = satoshis / SATOSHI_FACTOR;
  var price = currentPrice * FUDGE_FACTOR;
  var priceStr = price.toFixed(2);
  var amountStr = bitcoins.toFixed(8);
  this.client.buy(amountStr, priceStr, function(err, json) {
    if (err) {
      return callback(err);
    }

    if (json.error) {
      if (json.error.__all__)
        if (json.error.__all__.isArray)
          return callback(new Error(json.error.__all__).join("; "));
        else
          return callback(new Error(json.error.__all__));
      return callback(new Error(json.error));
    }

    callback();
  });
};

module.exports = BitstampTrade;
