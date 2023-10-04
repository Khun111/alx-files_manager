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
      this.client = await MongoClient.connect(`mongodb://${host}:${port}/${database}`,
        {
          useUnifiedTopology: true,
        });
    } catch (err) {
      console.error('Error connecting to MongoDB:', err);
      console.error(err);
    }
  }

  isAlive() {
    return this.client.connected;
  }

  async nbUsers() {
    const DB = this.client.db();
    const count = await DB.collection('users').countDocuments();
    return count;
  }

  async nbFiles() {
    const DB = this.client.db();
    const count = await DB.collection('files').countDocuments();
    return count;
  }
}

const dbClient = new DBClient();

export default dbClient;
