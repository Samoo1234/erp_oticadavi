// Arquivo de entrada para Vercel Serverless Functions
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const app = require('../src/server');

module.exports = app;

