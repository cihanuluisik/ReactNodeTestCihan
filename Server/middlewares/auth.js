const jwt = require('jsonwebtoken');
const { config } = require('../config/environment');

const auth = (req, res, next) => {
    const token = req.headers.authorization;

    if (!token) {
        return res.status(401).json({ message: "Authentication failed, Token missing" });
    }

    try {
        // Remove 'Bearer ' prefix if present
        const tokenValue = token.startsWith('Bearer ') ? token.slice(7) : token;
        
        const decoded = jwt.verify(tokenValue, config.jwt.secret);
        req.user = decoded;
        next();
    } catch (err) {
        console.error('Token verification error:', err.message);
        return res.status(401).json({ message: 'Authentication failed. Invalid token.' });
    }
}

module.exports = auth