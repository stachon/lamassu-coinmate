'use strict';

var Wreck = require('wreck');
var async = require('async');


// copy relevant convienient constants
var config        = require('../config');
var API_ENDPOINT  = config.API_ENDPOINT;


function getTickerUrls(currencies) {
  var urls = [];

  if (currencies.indexOf('EUR') !== -1) {
    urls.push(API_ENDPOINT + 'ticker?currencyPair=BTC_EUR');
  }

  return urls;
}

function formatResponse(currencies, results, callback) {
  
  

  var response = {};
  if (currencies.indexOf('EUR') !== -1) {
    var rate = {
      ask: parseFloat(results[0].data.ask),
      bid: parseFloat(results[0].data.bid)
    };
    response.EUR = {
      currency: 'EUR',
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

  var urls = getTickerUrls(currencies);

  // change each url on the list into a download job
  var downloadList = urls.map(function(url) {
    return function(cb) {
      Wreck.get(url, { json:true }, function(err, res, payload) {
        cb(err, payload);
      });
    };
  });

  async.parallel(downloadList, function(err, results) {
    if (err) return callback(err);

    formatResponse(currencies, results, callback);
  });
};

