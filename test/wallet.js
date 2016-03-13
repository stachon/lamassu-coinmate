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
  'clientId',
  'dest_address'
];


if(pluginConfig.SUPPORTED_MODULES.indexOf('wallet') !== -1 && !process.env.TRAVIS) {
  describe(pluginConfig.NAME + ' Wallet', function() {
    var configMock = null;
    var plugin = require('../index');

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

    describe('Requests', function() {

      it('should fail to send bitcoins to an invalid address', function(done) {
        plugin.sendBitcoins('1abc', 0.001 * 1e8, null, function(err) {
          should.exist(err);

          err.message.should.have.string('Invalid bitcoin address');

          done();
        });
      });

      it('should fail to send 0 bitcoins', function(done) {
        plugin.sendBitcoins('email@example.com', 0, null, function(err) {
          should.exist(err);

          done();
        });
      });

      it('should successfully send bitcoins', function(done) {
        plugin.sendBitcoins(configMock.dest_address, 0.001 * 1e8, null, function(err, txid) {
          should.not.exist(err);

	  // txid is a transaction id from CoinMate.
          txid.should.be.a('string');

          done();
        });
      });

      it('should return a bitcoin address', function(done) {
        plugin.newAddress({}, function(err, addy) {
	  should.not.exist(err);

	  addy.should.be.a('string');

	  done();
	});
      });
    });

  });
}
