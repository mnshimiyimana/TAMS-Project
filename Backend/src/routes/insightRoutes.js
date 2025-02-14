import express from 'express';
import { protect } from '../middlewares/authMiddleware.js';
import { 
  createInsight, 
  getInsights, 
  getInsightById, 
  updateInsight, 
  deleteInsight 
} from '../controllers/insightsController.js';

const router = express.Router();

router.post('/', protect, createInsight); 
router.get('/', getInsights);
router.get('/:id', getInsightById);
router.put('/:id', protect, updateInsight); 
router.delete('/:id', protect, deleteInsight); 

export default router;
