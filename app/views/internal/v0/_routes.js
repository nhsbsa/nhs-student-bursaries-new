// ********************************
// internal v0
// ********************************

// External dependencies
const e = require('express');
const express = require('express');
const session = require('express-session');
// const moment = require('moment');
const router = express.Router();

//requestForm

router.post('/dsa/requestForm', (req, res) => {

  req.session.data['needs'] = 'email';

  res.redirect('/internal/v0/student-details');

});

module.exports = router;
