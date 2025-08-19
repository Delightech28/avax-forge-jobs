import jwt from 'jsonwebtoken';

export function requireAuth(req, res, next) {
  try {
    const token = req.cookies.token || (req.headers.authorization || '').replace('Bearer ', '');
    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    const payload = jwt.verify(token, process.env.JWT_SECRET || 'change_me');
    req.userId = payload.sub;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
}

export function issueToken(userId) {
  return jwt.sign(
    { sub: userId },
    process.env.JWT_SECRET || 'change_me',
    { expiresIn: '7d' }
  );
}

