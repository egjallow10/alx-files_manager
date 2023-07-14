/* eslint-disable import/prefer-default-export */
import fs from 'fs';
import dbClient from './db';
import redisClient from './redis';

export const getFileById = async (fileId) => {
  const file = await dbClient.db.collection('files').findOne({ _id: fileId });
  return file;
};

export const createFile = async (file) => {
  // Create a new file document in the database
  const createdFile = await dbClient.uploadFile(file);
  return createdFile;
};

export const getUserIdFromToken = async (token) => {
  // Retrieve user ID from Redis based on the token
  const key = `auth_${token}`;
  const userId = await redisClient.get(key);
  return userId;
};

export const writeFile = (name, type, data) => {
  const path = `/tmp/files_manager/${name}`;
  let fileData = Buffer.from(data, 'base64');

  if (type !== 'image') {
    fileData = fileData.toString('utf8');
  }

  fs.writeFile(path, fileData, { flag: 'w' }, (err) => {
    if (err) throw err;
  });

  return path;
};
