'use strict';

var Wreck = require('wreck');
var async = require('async');


// copy relevant convienient constants
var config        = require('../config');

var API_ENDPOINT  = config.API_ENDPOINT;
var COINMATE_CURRENCIES = config.COINMATE_CURRENCIES;

function getTickerUrl(currency) {
  return API_ENDPOINT + 'ticker?currencyPair=' + config.currencyPairName(currency);
}

function formatResponse(currencies, results, callback) {
    
  var response = {};
  
  for (var i=0; i<currencies.length; i++) {
    var currency = currencies[i];
    
    if (COINMATE_CURRENCIES.indexOf(currency) == -1) {
      return callback(new Error('Unsupported currency'));
    }
    
    var rate = {
      ask: parseFloat(results[i].data.ask),
      bid: parseFloat(results[i].data.bid)
    };
    response[currency] = {
      currency: currency,
      rates: {
        ask: rate.ask.toFixed(2),
        bid: rate.bid.toFixed(2)
      }
    };
  }


  if (currencies.length !== Object.keys(response).length)
    return callback(new Error('Unsupported currency'));

  callback(null, response);
}


exports.ticker = function ticker(currencies, callback) {
  if (typeof currencies === 'string')
    currencies = [currencies];

  currencies.sort();

  if(currencies.length === 0)
    return callback(new Error('Currency not specified'));

  // change each currency on the list into a download job
  var downloadList = currencies.map(function(currency) {
    return function(cb) {
      var url = getTickerUrl(currency);
      
      Wreck.get(url, { json:true, rejectUnauthorized: false /*FIXME TODO REMOVE!!!*/ }, function(err, res, payload) {
        cb(err, payload);
      });
    };
  });

  async.parallel(downloadList, function(err, results) {
    if (err) return callback(err);

    formatResponse(currencies, results, callback);
  });
};

