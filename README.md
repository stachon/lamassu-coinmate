lamassu-coinmate
================

[![Build Status](https://travis-ci.org/lamassu/lamassu-bitstamp.svg)](https://travis-ci.org/lamassu/lamassu-bitstamp)

Lamassu Coinmate ticker and trader


### Testing

1. Open `mockConfig.template.json` file, and input your [Coinmate credentials](https://coinmate.io/pages/secured/accountAPI.page) there,
2. Make sure to check there:
  - [x] Trading enabled,
2. Rename `mockConfig.template.json` to `mockConfig.json`,
3. Type this into your terminal:

```bash
npm update # in case you cloned via git
npm test
```

> NOTE: Two last tests depend on your account having 5 EUR of available balance (both in EUR and BTC).
