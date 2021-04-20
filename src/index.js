const ccxt = require('ccxt');
require('dotenv').config();

const fs = require('fs');
// const tickers = require('../sample-tickers.json');

const storeData = (data, path) => {
  try {
    fs.writeFileSync(path, JSON.stringify(data));
  } catch (err) {
    console.error(err);
  }
};

const fee = 0.0005;
const tip = 0.02;

(async () => {
  // eslint-disable-next-line new-cap
  const upbit = new ccxt.upbit({
    apiKey: process.env.UPBIT_OPEN_API_ACCESS_KEY,
    secret: process.env.UPBIT_OPEN_API_SECRET_KEY,
    enableRateLimit: true,
    timeout: 30000,
  });
  let budget = 1000000;
  let coins = 0;
  let entryValue = 0;
  let jonbur = false;
  await upbit.loadMarkets();
  // console.log(await upbit.fetchBalance());
  // console.log(await upbit.market('DOGE/KRW'));
  // console.log(await upbit.marketId('DOGE/KRW'));
  // console.log(await upbit.fetchTickers());
  const tickers = await upbit.fetchOHLCV('DOGE/KRW', '30m', undefined, 200);

  console.log(tickers[199]);

  let isPrevDrop = false;
  tickers.forEach((ticker) => {
    const [ts, open, high, low, close, vol] = ticker;
    if (jonbur) {
      if (close > entryValue * (1 + tip)) {
        console.log(`존버끝 : ${ticker}`);
        jonbur = false;
        budget += coins * close * (1 - tip) * (1 - fee);
        coins = 0;

        console.log(`보유 코인 : ${coins}, 자산 : ${budget}`);
      }
      return;
    }
    if (((open - close) / open) * 100 > 5) {
      // console.log(`떡락 : ${ticker}`);
      isPrevDrop = true;
    } else {
      if (isPrevDrop && close > open) {
        console.log(`진입 : ${ticker}`);
        entryValue = close * (1 + tip);
        jonbur = true;
        coins = parseInt(budget / entryValue, 10) * (1 - fee);
        budget -= coins * entryValue;
      }
      isPrevDrop = false;
    }
  });
  console.log(`보유 코인 : ${coins}, 자산 : ${budget}`);
  // console.log(upbit.currencies);
  // console.log(await upbit.fetchOrderBook('BTC/KRW'));

  // const order = await upbit.createOrder('DOGE/KRW', 'market', 'buy', 15, tickers[199][4]);
  // console.log(order);

  // const order = await upbit.createOrder('DOGE/KRW', 'market', 'sell', 15, 405);
  // console.log(order);
})();
