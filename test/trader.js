/* global describe, it, before, afterEach */

'use strict';

var should        = require('chai').should();

var pluginConfig  = require('../config');


// re-reads *uncached* version of config JSON
function requireFresh(file) {
  delete require.cache[require.resolve(file)];
  return require(file);
}


var REQUIRED_MOCK_PROPERTIES = [
  'key',
  'secret',
  'clientId'
];


if(pluginConfig.SUPPORTED_MODULES.indexOf('trader') !== -1 && !process.env.TRAVIS) {
  describe(pluginConfig.NAME + ' Trader', function() {
    var configMock = null;
    var traderPlugin = require('../index');

    describe('Mock config file', function() {

      it('`test/mockConfig.json` should exist', function() {
        should.not.Throw(function() {
          configMock = requireFresh('./mockConfig.json');
        });

        configMock.should.be.an('object');
      });

      if (REQUIRED_MOCK_PROPERTIES.length) {
        REQUIRED_MOCK_PROPERTIES.forEach(function(property) {
          it('should have \'' + property + '\' property', function() {
            configMock.should.have.property(property);
          });
        });
      }
    });

    describe('Credentials', function() {

      it('should have valid and activated API credentials', function(done) {
        should.not.Throw(function() {
          traderPlugin.config(requireFresh('./mockConfig.json'));
        });

        traderPlugin.balance(function(err) {
          should.not.exist(err);
          done();
        });
      });
    });

    describe('Requests', function() {

      var balance = null;
      var minimalAmount = NaN;
      var lastEurPrice = NaN;


      // NOTE: this is Coinmate-specific
      before(function(done) {
        traderPlugin.ticker('EUR', function(err, results) {
          lastEurPrice = results.EUR.rates.ask;

          done(err);
        });
      });

      afterEach(function(done) {
        this.timeout(1500);

        // without it _some_ request _sometimes_ fail
        setTimeout(done, 777);
      });

      it('should return valid balance', function(done) {
        traderPlugin.balance(function(err, localBalance) {
          should.not.exist(err);
          localBalance.EUR.should.be.a('number');
          isNaN(localBalance.EUR).should.not.equal(true);

          localBalance.BTC.should.be.a('number');
          isNaN(localBalance.BTC).should.not.equal(true);

          balance = localBalance;

          done();
        });
      });

      describe('Buy', function() {
        // NOTE: [amount === 0] and [amount < $5] produce different errors
        it('should fail when amount is zero', function(done) {
          traderPlugin.purchase(0, null, function(err) {
            should.exist(err);

            err.message.should.have.string('Minimum Order Size');

            done();
          });
        });

        it('should fail when amount too small', function(done) {

          minimalAmount = 0.00021 *1e8;
          var tooSmallAmount = minimalAmount / 2;

          traderPlugin.purchase(tooSmallAmount, null, function(err) {
            should.exist(err);

            err.message.should.have.string('Minimum');

            done();
          });
        });

        it('should have at least 5 EUR on account', function() {
          balance.EUR.should.be.above(5);

        });

        it('should successfully place order', function(done) {
          traderPlugin.purchase(minimalAmount, null, function(err) {
            should.not.exist(err);

            done();
          });
        });
      });

      describe('Sell', function() {
        // NOTE: [amount === 0] and [amount < $5] produce different errors
        it('should fail when amount is zero', function(done) {
          traderPlugin.sell(0, {price:lastEurPrice}, function(err) {
            should.exist(err);

            err.message.should.have.string('Minimum Order Size');

            done();
          });
        });

        it('should fail when amount too small', function(done) {

          // NOTE: minimum allowed order is 0.0002 BTC;
          minimalAmount = 0.00021*1e8;
          var tooSmallAmount = minimalAmount / 2;

          traderPlugin.sell(tooSmallAmount, null, function(err) {
            should.exist(err);

            err.message.should.have.string('0.0002 BTC');

            done();
          });
        });

        it('should have at least 5 EUR *in BTC* on account', function() {
          (balance.EUR).should.be.above(5/lastEurPrice);

        });

        it('should successfully place order', function(done) {
          traderPlugin.sell(minimalAmount, null, function(err) {
            should.not.exist(err);

            done();
          });
        });
      });

    });
  });
}
