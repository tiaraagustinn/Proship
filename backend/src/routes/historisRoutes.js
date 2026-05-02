import express from 'express';
import { getHistoris, createHistoris, updateHistoris, deleteHistoris, getDashboard } from '../controllers/historisController.js';

const router = express.Router();

router.get('/dashboard', getDashboard);
router.get('/', getHistoris);
router.post('/', createHistoris);
router.put('/:id', updateHistoris);
router.delete('/:id', deleteHistoris);

export default router;
