const redisClient = require('../utils/redis');
const dbClient = require('../utils/db');

const AppController = {
  getStatus: async (req, res) => {
    const redisStatus = await redisClient.isAlive();
    const dbStatus = await dbClient.isAlive();

    res.status(200).json({ redis: redisStatus, db: dbStatus });
  },

  getStats: async (req, res) => {
    const usersCount = await dbClient.nbUsers();
    const filesCount = await dbClient.nbFiles();

    res.status(200).json({ users: usersCount, files: filesCount });
  },
};

module.exports = AppController;
