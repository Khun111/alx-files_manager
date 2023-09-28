import { MongoClient } from 'mongodb'

const host = process.env.DB_HOST || 'localhost';
const port = process.env.DB_PORT || '27017';
const database = process.env.DB_DATABASE || 'files_manager'
class DBClient {
    constructor() {
        this.connected = false;
        this.client = MongoClient.connect(`mongodb://{host}:{port}/{database}`, (err, db) => {
                if (!err) {
                this.connected = true;
                this.DB = db;
                }
                });
    }
    
    isAlive() {
        return this.connected
    }

    async nbUsers() {
        const count = await this.DB.users.count()
        return count;
    }
    async nbFiles() {
        const count = await this.DB.files.count();
        return count;
    }
}

const dbClient = new DBClient();
export default dbClient;
