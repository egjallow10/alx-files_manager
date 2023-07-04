/* eslint-disable class-methods-use-this */
/* eslint-disable indent */

import { getFileById, createFile, getUserIdFromToken } from '../utils/helper';

const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');

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

    if (type === 'folder') {
      const createdFile = await createFile(newFile);
      // Create local storing folder path if FOLDER_PATH is not defined
      const storingFolderPath = FOLDER_PATH || '/tmp/files_manager';
      const filePath = path.join(storingFolderPath, `${uuidv4()}`);

      // Write file content to local path
      const fileContent = Buffer.from(data, 'base64');
      fs.writeFileSync(filePath, fileContent);

      newFile.localPath = filePath;

      res.status(201).json(createdFile);
    } else {
      const createdFile = await createFile(newFile);
      console.log(newFile);

      res.status(201).json(createdFile);
    }
  }

  // Helper functions for database operations (replace with actual implementation)
}

export default FilesController;
