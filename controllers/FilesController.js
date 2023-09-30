import redisClient from '../utils/redis';
import dbClient from '../utils/db';
import { v4 as uuidv4 } from 'uuid';
import mime from 'mime-types';

const path = require('path');
const fs = require('fs');
const FOLDER_PATH = process.env.FOLDER_PATH || '/tmp/files_manager';

class FilesController {
    static async postUpload(req, res) {
        const { ObjectID } = require('mongodb');
        const token = req.headers['x-token'];
        const key = 'auth_'.concat(token);
        const DB = dbClient.client.db();

        try {
            const user_id = await redisClient.get(key);
            if (user_id) {
                const user = await DB.collection('users').findOne({ _id: new ObjectID(user_id) });
                const userId = user._id;
                const { name, type, parentId = 0, isPublic = false, data } = req.body;



                if (!name) {
                    return res.status(400).json({ error: 'Missing name' });
                }

                if (!type || !['folder', 'file', 'image'].includes(type)) {
                    return res.status(400).json({ error: 'Missing type' });
                }

                if (type !== 'folder' && !data) {
                    return res.status(400).json({ error: 'Missing data' });
                }

                const parentFile = await DB.collection('files').findOne({ _id: new ObjectID(parentId) });
                if (parentId !== 0 && (!parentFile)) {
                    return res.status(400).json({ error: 'Parent not found' });
                }
                if (parentId !== 0 && parentFile.type !== 'folder') {
                    return res.status(400).json({ error: 'Parent is not a folder' });
                }

                const newFile = {
                    userId,
                    name,
                    type,
                    parentId,
                    isPublic
                };

                if (type === 'folder') {
                    const result = await DB.collection('files').insertOne(newFile);
                    const newFileUpdated = Object.assign(
                        { 'id': result.insertedId },
                        newFile
                    );
                    return res.status(201).json(newFileUpdated);
                }

                const buffer = Buffer.from(data, 'base64');
                const filePath = path.join(FOLDER_PATH, uuidv4().toString());
                await fs.promises.mkdir(FOLDER_PATH, { recursive: true });
                await fs.promises.writeFile(filePath, buffer);

                newFile.localPath = filePath;

                const result = await DB.collection('files').insertOne(newFile);
                const newFileUpdated = Object.assign(
                    { '_id': result.insertedId },
                    newFile
                );
                return res.status(201).json(newFileUpdated);
            } else {
                res.status(401).json({ error: 'Unauthorized' });
            }

        } catch (err) {
            console.log(err);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
    static async getShow(req, res) {
        const _id = req.params.id;
        const { ObjectID } = require('mongodb');
        const token = req.headers['x-token'];
        const key = 'auth_'.concat(token);
        const DB = dbClient.client.db();

        try {
            const user_id = await redisClient.get(key);
            if (user_id) {
                const user = await DB.collection('users').findOne({ _id: new ObjectID(user_id) });
                const userId = user._id;
                const fields = [{
                    $match: {
                        _id: new ObjectID(_id),
                        userId: new ObjectID(userId)
                    }
                }];
                const file = await DB.collection('files').aggregate(fields).toArray();
                if (file.length > 0) {
                    return res.status(201).json(file);
                } else {
                    return res.status(404).json({ error: 'Not found' });
                }
            } else {
                res.status(401).json({ error: 'Unauthorized' });
            }

        } catch (err) {
            console.log(err);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
    static async getIndex(req, res) {
        const token = req.headers['x-token'];
        const key = 'auth_'.concat(token);
        const DB = dbClient.client.db();

        try {
            const user_id = await redisClient.get(key);
            if (user_id) {
                const parentId = req.query.parentId || 0;
                const page = parseInt(req.query.page, 10) || 0;
                const limitPerPage = 20;
                const skip = page * limitPerPage;

                const fields = [
                    { $match: { 'parentId': parentId } },
                    { $skip: skip },
                    { $limit: limitPerPage }
                ];
                const files = await DB.collection('files').aggregate(fields);
                const filesArray = await files.toArray();
                if (filesArray.length === 0) {
                    return res.send([]);
                } else {
                    console.log(parentId, page, filesArray);
                    return res.status(200).json(filesArray);
                }

            } else {
                res.status(401).json({ error: 'Unauthorized' });
            }

        } catch (err) {
            console.log(err);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
    static async putPublish(req, res) {
        const _id = req.params.id;
        const { ObjectID } = require('mongodb');
        const token = req.headers['x-token'];
        const key = 'auth_'.concat(token);
        const DB = dbClient.client.db();

        try {
            const user_id = await redisClient.get(key);
            if (user_id) {
                const user = await DB.collection('users').findOne({ _id: new ObjectID(user_id) });
                const userId = user._id;
                const fields = [{
                    $match: {
                        _id: new ObjectID(_id),
                        userId: new ObjectID(userId)
                    }
                }];
                const file = await DB.collection('files').aggregate(fields).toArray();
                if (file.length > 0) {
                    const result = await DB.collection('files').findOneAndUpdate(
                        { _id: new ObjectID(_id) },
                        { $set: { isPublic: true } },
                        { returnDocument: 'after' }
                    );
                    return res.status(201).json(result.value);
                } else {
                    return res.status(404).json({ error: 'Not found' });
                }
            } else {
                res.status(401).json({ error: 'Unauthorized' });
            }

        } catch (err) {
            console.log(err);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
    static async putUnpublish(req, res) {
        const _id = req.params.id;
        const { ObjectID } = require('mongodb');
        const token = req.headers['x-token'];
        const key = 'auth_'.concat(token);
        const DB = dbClient.client.db();

        try {
            const user_id = await redisClient.get(key);
            if (user_id) {
                const user = await DB.collection('users').findOne({ _id: new ObjectID(user_id) });
                const userId = user._id;
                const fields = [{
                    $match: {
                        _id: new ObjectID(_id),
                        userId: new ObjectID(userId)
                    }
                }];
                const file = await DB.collection('files').aggregate(fields).toArray();
                if (file.length > 0) {
                    const result = await DB.collection('files').findOneAndUpdate(
                        { _id: new ObjectID(_id) },
                        { $set: { isPublic: false } },
                        { returnDocument: 'after' }
                    );
                    return res.status(201).json(result.value);
                } else {
                    return res.status(404).json({ error: 'Not found' });
                }
            } else {
                res.status(401).json({ error: 'Unauthorized' });
            }

        } catch (err) {
            console.log(err);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
    static async getFile(req, res) {
        const _id = req.params.id;
        const { ObjectID } = require('mongodb');
        const token = req.headers['x-token'];
        const key = 'auth_'.concat(token);
        const DB = dbClient.client.db();

        try {
            const user_id = await redisClient.get(key);
            const file = await DB.collection('files').findOne({ _id: new ObjectID(_id) });
            if (!file) {
                return res.status(404).json({ error: 'Not found' });
            }
            if (file.isPublic === true || !user_id || user_id !== file.userId.toString()) {
                return res.status(404).json({ error: 'Not found' });
            }
            if (file.type === 'folder') {
                return res.status(400).json({ error: "A folder doesn't have content" });
            }
            if (file.localPath && !fs.existsSync(file.localPath)) {
                return res.status(404).json({ error: 'Not found' });
            }
            const mimeType = mime.lookup(file.name);
            res.setHeader('Content-Type', mimeType);
            res.sendFile(file.localPath);

        } catch (err) {
            console.log(err);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
}

export default FilesController;
module.exports = FilesController;