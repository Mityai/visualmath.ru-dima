import jwt from 'jsonwebtoken';
import {jwt as secret} from '../secret';

export function validate(token) {
  try {
    return jwt.verify(token, secret);
  } catch (err) {
    return false;
  }
}
