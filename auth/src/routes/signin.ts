import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import jwt from 'jsonwebtoken';

import { Password } from '../services/password';
import { User } from '../models/user';
import { validateRequest } from '../middlewares/validate-request';
import { BadRequestError } from '../errors/bad-request-error';

const router = express.Router();

router.post("/api/users/signin", [body('email').isEmail().withMessage("Email must be valid"), body('password').trim().notEmpty().withMessage("Must supply a password")], validateRequest, async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const existingUser = await User.findOne({ email }).select('+password');
  if (!existingUser) {
    throw new BadRequestError('Invalid credentials');
  }
  const passwordsMatch = await Password.compare(
    existingUser.password,
    password
  );
  if (!passwordsMatch) {
    throw new BadRequestError('Invalid Credentials');
  }

  // Generate JWT
  const userJwt = jwt.sign(
    {
      id: existingUser.id,
      email: existingUser.email
    },
    process.env.JWT_KEY!
  );

  // Store it on session object
  req.session = {
    jwt: userJwt
  };
  const user = { _id: existingUser.id, email: existingUser.email }
  res.status(200).send(user);
});

export { router as signinRouter };
