import Game from '../models/GameSchema.js';

export const getGames = async (req, res) => {
  try {
    const games = await Game.find({ globalGame: true }).populate('createdBy', 'username');
    res.json(games);
  } catch (err) {
    console.error('Get games error:', err);
    res.status(500).json({ error: 'Failed to load games' });
  }
};

export const addGame = async (req, res) => {
  try {
    const data = req.body;
    if (!data || !data.id) {
      return res.status(400).json({ error: 'Invalid game data' });
    }

    const newGame = await Game.create({
      ...data,
      globalGame: true,
      createdBy: req.user?._id,
    });

    const games = await Game.find({ globalGame: true }).populate('createdBy', 'username');
    res.status(201).json(games);
  } catch (err) {
    console.error('Add game error:', err);
    res.status(500).json({ error: 'Failed to add game' });
  }
};

export default { getGames, addGame };
