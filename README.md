lamassu-coinmate
================

Lamassu ticker and trader plugin for [CoinMate.io](https://coinmate.io) exchange


### Testing

1. Open `test/mockConfig.template.json` file, and input your [Coinmate credentials](https://coinmate.io/pages/secured/accountAPI.page) there (key, secret and clientId)
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
