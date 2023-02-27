import { config } from 'dotenv';
const env = process.env.NODE_ENV || 'development';

if (env === 'development') {
    config(); // Load environment variables from .env file
} else if (env === 'test') {
    config({ path: '.env.test' }); // Load environment variables from .env.test file
}

import express from 'express';
import 'express-async-errors';
import mongoose from 'mongoose';
import { currentUserRouter } from './routes/current-user';
import { signinRouter } from './routes/signin';
import { signoutRouter } from './routes/signout';
import { signupRouter } from './routes/signup';
import { errorHandler } from './middlewares/error-handler';
import { NotFoundError } from './errors/not-found-error';
import cookieSession from 'cookie-session';

const app = express();
app.set('trust proxy', true);
app.use(express.json());
app.use(
    cookieSession({
        signed: false,
        secure: true
    })
);

app.use(currentUserRouter);
app.use(signinRouter);
app.use(signoutRouter);
app.use(signupRouter);

app.all('*', async (_, __) => {
    throw new NotFoundError();
});

app.use(errorHandler);
const start = async () => {
    try {
        mongoose.set("strictQuery", false);
        await mongoose.connect('mongodb://auth-mongo-srv:27017/auth', {

        });
        console.log('Connected to MongoDb');
    } catch (err) {
        console.error(err);
    }

    app.listen(3000, () => {
        console.log('Listening on port 3000!!!');
    });
};
start()