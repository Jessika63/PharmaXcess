const jwt = require('jsonwebtoken')
const blacklist = new Set()

require('dotenv').config()

function createToken(email, id) {
    if (email == null || id == null || email == "" || id == "")
        return null
    return jwt.sign({ email: email, id: id }, process.env.SECRET_KEY, { expiresIn: '1h' })
}

function authenticateToken(req, res, next) {
    const token = req.headers['authorization']

    if (!token) {
        return res.status(401).json({ error: 'Access denied, no token provided' })
    }

    if (blacklist.has(token)) {
        return res.status(401).json({ error: 'Token has been invalidated' })
    }

    jwt.verify(token, process.env.SECRET_KEY, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid token' })
        }
        req.user = user
        next()
    })
}

function disableToken(token) {
    if (blacklist.has(token)) {
        return false
    }

    blacklist.add(token)
    return true
}

module.exports = { createToken, authenticateToken, disableToken }