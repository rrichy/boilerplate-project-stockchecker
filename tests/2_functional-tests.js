const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {
    test('Viewing one stock: GET request to /api/stock-prices/', (done) => {
        chai.request(server)
            .get('/api/stock-prices?stock=GOOGL')
            .end((err, res) => {
                assert.equal(res.status, 200);
                assert.hasAllKeys(res.body, ['stockData'], 'The response should have the "stockData" key.');
                assert.equal(res.body.stockData.stock, 'GOOGL');
                done();
            });
    });
    
    let currentLike;
    test('Viewing one stock and liking it: GET request to /api/stock-prices/', (done) => {
        chai.request(server)
            .get('/api/stock-prices?stock=GOOGL&like=true')
            .end((err, res) => {
                assert.equal(res.status, 200);
                assert.hasAllKeys(res.body, ['stockData'], 'The response should have the "stockData" key.');
                assert.equal(res.body.stockData.stock, 'GOOGL');
                currentLike = res.body.stockData.likes;
                assert.isAtLeast(currentLike, 1);
                done();
            });
    });
    
    test('Viewing the same stock and liking it again: GET request to /api/stock-prices/', (done) => {
        chai.request(server)
            .get('/api/stock-prices?stock=GOOGL&like=true')
            .end((err, res) => {
                assert.equal(res.status, 200);
                assert.hasAllKeys(res.body, ['stockData'], 'The response should have the "stockData" key.');
                assert.equal(res.body.stockData.stock, 'GOOGL');
                assert.equal(res.body.stockData.likes, currentLike);
                done();
            });
    });

    test('Viewing two stocks: GET request to /api/stock-prices/', (done) => {
        chai.request(server)
            .get('/api/stock-prices?stock=GOOGL&stock=GOOG')
            .end((err, res) => {
                assert.equal(res.status, 200);
                assert.hasAllKeys(res.body, ['stockData'], 'The response should have the "stockData" key.');
                assert.isArray(res.body.stockData, 'The response for the request of 2 Stocks should be an array.');
                assert.hasAllKeys(res.body.stockData[0], ['stock', 'price', 'rel_likes']);
                done();
            });
    });

    test('Viewing two stocks and liking them: GET request to /api/stock-prices/', (done) => {
        chai.request(server)
            .get('/api/stock-prices?stock=GOOGL&stock=GOOG&like=true')
            .end((err, res) => {
                assert.equal(res.status, 200);
                assert.hasAllKeys(res.body, ['stockData'], 'The response should have the "stockData" key.');
                assert.isArray(res.body.stockData, 'The response for the request of 2 Stocks should be an array.');
                assert.hasAllKeys(res.body.stockData[0], ['stock', 'price', 'rel_likes']);
                done();
            });
    });
});
