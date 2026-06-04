const express = require('express');
const router = express.Router();
const { getRecommendation } = require('../controllers/chatbotController');

router.post('/query', getRecommendation);

module.exports = router;
