/* eslint-disable import/prefer-default-export */
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
