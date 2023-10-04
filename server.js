import express from 'express';
import routes from './routes';

const app = express();
app.use(express.json());

app.use(routes);
const port = parseInt(process.env.PORT, 10) || 5000;

app.listen(port, () => console.log(`Server running on ${port}`));
