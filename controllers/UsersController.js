// eslint-disable-next-line no-unused-vars
import { request, response } from 'express';
import crypto from 'crypto';
import dbClient from '../utils/db';

class UsersController {
  static async postNew(request, response) {
    const { password, email } = request.body;
    const userDb = dbClient.users;

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
      .createHash('sha1')
      .update(password)
      .digest('hex');
    const newUser = {
      email,
      password: passwordHash,
    };

    const result = await userDb.insertOne(newUser);
    const userObj = { id: result.insertedId, email };

    return response.status(201).json(userObj);
  }
}

export default UsersController;
