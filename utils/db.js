import { MongoClient } from 'mongodb';

const host = process.env.DB_HOST || 'localhost';
const port = process.env.DB_PORT || 27017;
const database = process.env.DB_DATABASE || 'files_manager';

class DBClient {
  constructor() {
    this.connected = false;
    this.connect();
  }

  async connect() {
    try {
      this.client = await MongoClient.connect(`mongodb://${host}:${port}/${database}`);
      this.connected = true;
    } catch (err) {
      console.error('Error connecting to MongoDB:', err);
      this.connected = false;
    }
  }

  isAlive() {
    return this.connected;
  }

  async nbUsers() {
    if (!this.connected) {
      return;
    }

    const DB = this.client.db()
    const count = await DB.collection('users').countDocuments();
    return count;
  }

  async nbFiles() {
    if (!this.connected) {
      return;
    }

    const DB = this.client.db()
    const count = await DB.collection('files').countDocuments();
    return count;
  }
}

const dbClient = new DBClient();

export default dbClient;
module.exports = dbClient;
