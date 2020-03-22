const rp = require('request-promise');
const requestOptions = {
  method: 'GET',
  uri: 'https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest',
  qs: {
    'start': '1',
    'limit': '100',
  },
  headers: {
    'X-CMC_PRO_API_KEY': '0c94fb96-1496-48af-8259-d3b84579b957'
  },
  json: true,
  gzip: true
};



const getMarketcap = (callback) => {
  rp(requestOptions).then(response => {
    callback(response.data);
  }).catch((err) => {
    console.log('API call error:', err.message);
  });
}

module.exports = getMarketcap;