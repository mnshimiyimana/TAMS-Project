import express from 'express';
import { protect } from '../middlewares/authMiddleware.js';
import { 
  createReservation, 
  getReservations, 
  getReservationById, 
  updateReservation, 
  deleteReservation 
} from '../controllers/reservationController.js';

const router = express.Router();

router.post('/', protect, createReservation); // Protected route
router.get('/', getReservations);
router.get('/:id', getReservationById);
router.put('/:id', protect, updateReservation); // Protected route
router.delete('/:id', protect, deleteReservation); // Protected route

export default router;
