const r = require('express').Router();
r.post('/login', require('../controllers/auth.controller').login);
module.exports = r;
