lamassu-coinmate
================

Lamassu plugin for [CoinMate.io](https://coinmate.io) exchange. This plugin provides all of the "ticker", "trader", and "wallet" functionalities by using CoinMate services.


### Testing

1. Open `test/mockConfig.template.json` file, and input your [Coinmate credentials](https://coinmate.io/pages/secured/accountAPI.page) there (key, secret and clientId). For wallet testin also set `dest_address` to a bitcoin address to send the withdrawal to.
2. Make sure to check on CoinMate API page:
  - [x] Trading enabled,
2. Rename `mockConfig.template.json` to `mockConfig.json`,
3. Type this into your terminal:

```bash
npm update # in case you cloned via git
npm test
```

> NOTE: Two last tests depend on your account having 5 EUR of available balance (both in EUR and BTC).

### Installation

To install the module, go to your lamassu-machine folder and install lamassu-coinmate via npm:

```bash
cd /usr/local/lib/node_modules/lamassu-server/
npm install lamassu-coinmate
```

Next, execute setup:

```bash
node_modules/lamassu-coinmate/setup
```

You will be asked to provide your CoinMate ID and keys. This will configure lamassu-server to use CoinMate for ticker and trading. The price will be ---.-- in admin panel, this is normal. The script will set coinmate as provider for for ticker,trader and wallet. If you wish to use another plugin for some of the functions, you need to modify the setup script.

You should also execute lamassu-set-locale to change the fiat currency to EUR.

```bash
lamassu-set-locale EUR
```

### Configuration

There are a few options you can configure in `node_modules/lamassu-coinmate/config.js`:

* `TRADE_INSTANT_ORDERS` set to 1 to trade using instant orders, or 0 for limit orders with spread specified
* `FUDGE_FACTOR` controls the spread of price for buying in instant mode, and both buying and selling in limit mode.
