import express from 'express';
import { getGames, addGame } from '../controllers/gamesController.js';

const router = express.Router();

router.get('/', getGames);
router.post('/', addGame);

export default router;
