import jwt from 'jsonwebtoken';

export function decode(token) {

  let decoded;
  try {
    decoded = jwt.decode(token);
  } catch (err) {
    return null;
  }

  return decoded;
}

export function getCurrentUser(req) {
  if (!req.session || !req.session.user || !res.session.user.token) {
    return null;
  }

  return decode(req.session.user.token);
}
