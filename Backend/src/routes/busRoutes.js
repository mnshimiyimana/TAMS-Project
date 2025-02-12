import express from 'express';
import { protect } from '../middlewares/authMiddleware.js';
import { 
  createBus, 
  getBuses, 
  getBusById, 
  updateBus, 
  deleteBus 
} from '../controllers/busController.js';

const router = express.Router();

router.post('/', protect, createBus); // Protected route
router.get('/', getBuses);
router.get('/:id', getBusById);
router.put('/:id', protect, updateBus); // Protected route
router.delete('/:id', protect, deleteBus); // Protected route

export default router;
