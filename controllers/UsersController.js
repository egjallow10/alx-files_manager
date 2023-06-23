import crypto from 'crypto';
import dbClient from '../utils/db';

class UsersController {
  static async postNew(req, res) {
    const { password, email } = req.body;
    const userDb = dbClient.users;
    if (!email) {
      return res.status(400).json({ error: 'Missing email' });
    }
    if (!password) {
      return res.status(400).json({ error: 'Missing password' });
    }
    const foundUser = userDb.find({ email });
    if (foundUser) {
      return res.status(400).json({ error: 'Already exist' });
    }
    const passwordHash = crypto
      .createHash('sha1')
      .update(password)
      .digest('hex');
    const newUser = await userDb.insertOne({ password: passwordHash, email });
    const userObj = { id: newUser.ops[0]._id, email: newUser.ops[0].email };

    return res.status(201).json(userObj);
  }
}

export default UsersController;
