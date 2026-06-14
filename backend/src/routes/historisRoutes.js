import express from 'express';
import { getHistoris, createHistoris, deleteHistoris } from '../controllers/historisController.js';

const router = express.Router();

router.get('/', getHistoris);
router.post('/', createHistoris);
router.delete('/:id', deleteHistoris);

export default router;
