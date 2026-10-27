// External dependencies
const express = require('express')

const router = express.Router()

// Add your routes here - above the module.exports line

router.use('/DSA-updates', require('./views/DSA-updates/_routes'));

// ================================
// Routes for Student
// ================================
router.use('/internal/v0', require('./views/internal/v0/_routes'));
router.use('/internal/v1', require('./views/internal/v1/_routes'));

module.exports = router
