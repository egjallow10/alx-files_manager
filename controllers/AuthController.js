/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable import/no-unresolved */
import { uuidv4 } from 'uuidv4';
import dbClient from '../utils/db';

// eslint-disable-next-line import/order, import/no-unresolved, import/extensions
const crypto = require('crypto');
const redisClient = require('../utils/redis');
// eslint-disable-next-line import/no-unresolved
// const uuidv4 = require('uuidv4');

class AuthController {
  // eslint-disable-next-line class-methods-use-this
  static async getConnect(req, res) {
    const { email, password } = req.headers.authorization.split(' ');
    const user = await dbClient.users.findOne({ email });

    if (!user) {
      return res.status(401).send('Unauthorized');
    }

    const isValidPassword = crypto.compare(password, user.password);

    if (!isValidPassword) {
      return res.status(401).send('Unauthorized');
    }

    const token = uuidv4();
    redisClient.set(`auth_${token}`, user.id, '24h');

    return res.json({ token });
  }

  // eslint-disable-next-line class-methods-use-this
  static getDisconnect(req, res) {
    const token = req.headers['x-token'];

    redisClient.del(`auth_'${token}`);

    res.status(204).send();
  }
}

export default AuthController;
