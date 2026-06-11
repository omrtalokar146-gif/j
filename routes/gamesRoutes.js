import express from 'express';
import { getGames, addGame, deleteGame } from '../controllers/gamesController.js';

const router = express.Router();

router.get('/', getGames);
router.post('/', addGame);
router.delete('/:id', deleteGame);

export default router;
