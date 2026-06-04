import jwt from 'jsonwebtoken';

const ACCESS_SECRET = process.env.JWT_SECRET || 'caretrack_mrms_access_token_secret_key_2026';
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'caretrack_mrms_refresh_token_secret_key_2026';

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required. Please login.' });
  }

  jwt.verify(token, ACCESS_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired access token.' });
    }
    req.user = user;
    next();
  });
};

export const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized. Credentials not found.' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: `Access forbidden. Authorized roles: ${roles.join(', ')}` });
    }
    next();
  };
};

export const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    ACCESS_SECRET,
    { expiresIn: process.env.JWT_ACCESS_EXPIRATION || '15h' }
  );
};

export const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRATION || '7d' }
  );
};

export const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, REFRESH_SECRET);
  } catch (err) {
    return null;
  }
};
