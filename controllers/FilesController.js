/* eslint-disable class-methods-use-this */
/* eslint-disable indent */

// import { uuidv4 } from 'uuidv4';
import {
  getFileById,
  createFile,
  getUserIdFromToken,
  writeFile,
} from '../utils/helper';

const { v4: uuidv4 } = require('uuid');

// eslint-disable-next-line no-unused-vars
const { FOLDER_PATH } = process.env;
// Get the storing folder path from environment variables

class FilesController {
  static async postUpload(req, res) {
    const token = req.headers['x-token'];

    if (!token) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // eslint-disable-next-line object-curly-newline
    const { name, type, data, isPublic, parentId } = req.body;

    if (!name) {
      res.status(400).json({ error: 'Missing name' });
      return;
    }

    if (!type || !['folder', 'file', 'image'].includes(type)) {
      res.status(400).json({ error: 'Missing type' });
      return;
    }

    if (type !== 'folder' && !data) {
      res.status(400).json({ error: 'Missing data' });
      return;
    }

    const userId = await getUserIdFromToken(token);

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    if (parentId) {
      const parentFile = await getFileById(parentId);

      if (!parentFile) {
        res.status(400).json({ error: 'Parent not found' });
        return;
      }

      if (parentFile.type !== 'folder') {
        res.status(400).json({ error: 'Parent is not a folder' });
        return;
      }
    }

    const newFile = {
      userId,
      name,
      type,
      parentId: parentId || 0,
      isPublic: isPublic || false,
    };

    if (type !== 'folder') {
      newFile.data = data;
      newFile.path = writeFile(uuidv4(), type, data);
      res.status(201).json(newFile.path);
    } else {
      const createdFile = await createFile(newFile);
      res.status(201).json(createdFile);
    }
  }
}

export default FilesController;
