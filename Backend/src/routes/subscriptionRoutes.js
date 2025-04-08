import express from 'express';
import { subscribeToNewsletter } from '../controllers/subscriptionController.js';

const router = express.Router();

router.post('/', subscribeToNewsletter);

export default router;