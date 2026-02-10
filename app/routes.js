// External dependencies
const express = require('express')

const router = express.Router()

// Add your routes here - above the module.exports line

router.use('/DSA-updates', require('./views/DSA-updates/_routes'));

module.exports = router
