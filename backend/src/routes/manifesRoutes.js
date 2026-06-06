import express from 'express';
import {
  getManifes, createManifes, updateManifes, deleteManifes, getDashboard
} from '../controllers/manifesController.js';

const router = express.Router();

router.get('/dashboard', getDashboard);
router.get('/', getManifes);
router.post('/', createManifes);
router.put('/:id', updateManifes);
router.delete('/:id', deleteManifes);

export default router;