'use strict';

const fetch = require('node-fetch');
const mongoose = require('mongoose');

mongoose.connect(process.env.DB, {useNewUrlParser: true, useUnifiedTopology: true});

const STOCK_SCHEMA = new mongoose.Schema({
  stock: {type: String, required: true},
  price: Number,
  likes: [String]
});

const STOCKS = new mongoose.model('Stock-Prices', STOCK_SCHEMA);

module.exports = function (app) {

  app.route('/api/stock-prices')
    .get(function (req, res){
      const ip = (req.headers['x-forwarded-for'] || '').split(',')[0] || req.connection.remoteAddress;
      const { stock, like } = req.query;
      
      if(typeof stock === 'string') {
        const response = (obj) => {
          console.log(obj);
          return res.json(obj);
        }

        update(ip, stock, like === 'true', 1, response);
      }
      else {
        let response = [];
        const resp = (obj) => {
          response.push(obj.stockData);
          if(response.length === 2) {
            response[0].rel_likes = response[0].likes - response[1].likes;
            response[1].rel_likes = response[1].likes - response[0].likes;
            
            delete response[0].likes;
            delete response[1].likes;
            
            console.log({ stockData: response});
            return res.json({ stockData: response });
          }
        }

        update(ip, stock[0], like === 'true', 2, resp);
        update(ip, stock[1], like === 'true', 2, resp);
      }
    });
    
};

async function update(ip, stock, like, option=1, cb) {
  let response;
  return await fetch(`https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/${stock}/quote`)
    .then(response => response.json())
    .then(stock_data => {
      const { symbol: stock, latestPrice: price } = stock_data // latest data taken from the stock variable

      STOCKS.findOne({stock}, (err, data_exist) => {
        if(err) return console.log(err);
        if(data_exist) {
          if(like && !data_exist.likes.includes(ip)) data_exist.likes.push(ip);
          if(!like && option == 1 && data_exist.likes.includes(ip)) data_exist.likes = data_exist.likes.filter(a => a !== ip);

          data_exist.save((err, ndata) => {
            if(err) return console.log(err);

            response = { stockData: { stock, price, likes: ndata.likes.length } };
            cb(response);
          });
        }
        else {
          STOCKS.create({ stock, price, likes: like ? [ip] : []}, (err, data) => {
            if(err) return console.log(err);

            response = { stockData: { stock, price, likes: data.likes.length } };
            cb(response);
          });
        }
      });
    });
}
