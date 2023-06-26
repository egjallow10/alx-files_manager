// eslint-disable-next-line no-unused-vars
import { request, response } from 'express';
import crypto from 'crypto';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';

class UsersController {
  static async postNew(request, response) {
    const { password, email } = request.body;
    const userDb = dbClient.users;
    const salt = crypto.randomBytes(16);

    if (!email) {
      return response.status(400).json({ error: 'Missing email' });
    }

    if (!password) {
      return response.status(400).json({ error: 'Missing password' });
    }

    const foundUser = await userDb.findOne({ email });
    if (foundUser) {
      return response.status(400).json({ error: 'Already exist' });
    }

    const passwordHash = crypto
      .pbkdf2Sync(password, salt, 10000, 64)
      .toString('hex');
    const newUser = {
      email,
      password: passwordHash,
    };

    const result = await userDb.insertOne(newUser);
    const userObj = { id: result.insertedId, email };

    return response.status(201).json(userObj);
  }

  // eslint-disable-next-line class-methods-use-this
  static async getMe(req, res) {
    const token = req.headers['x-token'];

    const user = await dbClient.users.findById(
      redisClient.get(`auth_${token}`)
    );

    if (!user) {
      return res.status(401).send('Unauthorized');
    }

    return res.json({ email: user.email, id: user.id });
  }
}

export default UsersController;
