const express = require('express');
const router = express.Router();
const { CATEGORIES } = require('../constants/categories');

router.get('/', (req, res) => {
  res.status(200).json(CATEGORIES);
});

module.exports = router;
