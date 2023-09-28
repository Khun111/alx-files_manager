import express from 'express';

const router = express.Router()

router.get('/status', AppController.getStatus)
router.get('/stats', AppController.getStats)
