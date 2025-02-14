import express from 'express';
import { protect } from '../middlewares/authMiddleware.js';
import { 
  createFuelTransaction, 
  getFuelTransactions, 
  getFuelTransactionById, 
  updateFuelTransaction, 
  deleteFuelTransaction 
} from '../controllers/fuelManagementController.js';

const router = express.Router();

router.post('/', protect, createFuelTransaction); 
router.get('/', getFuelTransactions);
router.get('/:id', getFuelTransactionById);
router.put('/:id', protect, updateFuelTransaction); 
router.delete('/:id', protect, deleteFuelTransaction); 

export default router;
