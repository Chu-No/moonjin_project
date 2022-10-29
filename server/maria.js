const maria = require('mysql');

const conn = maria.createConnection({
    host:'localhost',
    user:'root',
    password:'154131',
    database:'bookmark'
});

module.exports = conn;