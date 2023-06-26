// eslint-disable-next-line no-unused-vars
import { request, response } from 'express';
import crypto from 'crypto';
import { ObjectID } from 'mongodb';
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
    }; // contains email and password

    const result = await userDb.insertOne(newUser);
    const userObj = { id: result.insertedId, email };

    return response.status(201).json(userObj);
  }

  static async getMe(request, response) {
    const token = request.header('X-Token');
    const key = `auth_${token}`;
    const userId = await redisClient.get(key);
    if (userId) {
      const users = dbClient.db.collection('users');
      const objectId = new ObjectID(userId);
      users.findOne({ _id: objectId }, (err, user) => {
        if (user) {
          response.status(200).json({ id: userId, email: user.email });
        } else {
          response.status(401).json({ error: 'Unauthorized' });
        }
      });
    } else {
      // console.log('Hupatikani!');
      response.status(401).json({ error: 'Unauthorized' });
    }
  }
}

export default UsersController;
