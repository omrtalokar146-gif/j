import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const filePath = path.resolve(__dirname, '../data/games.json');

const loadGames = async () => {
  try {
    const raw = await fs.readFile(filePath, 'utf8');
    return JSON.parse(raw);
  } catch (error) {
    if (error.code === 'ENOENT') return [];
    throw error;
  }
};

const saveGames = async (games) => {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, JSON.stringify(games, null, 2), 'utf8');
};

export const getGames = async (req, res) => {
  try {
    const games = await loadGames();
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
    const games = await loadGames();
    games.unshift(data);
    await saveGames(games);
    res.status(201).json(games);
  } catch (err) {
    console.error('Add game error:', err);
    res.status(500).json({ error: 'Failed to add game' });
  }
};

export default { getGames, addGame };
