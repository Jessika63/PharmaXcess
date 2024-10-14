const express = require('express')
const app = express
const { authenticateToken, disableToken } = require("../tools/token")
const { doesUserExits } = require("../SQL/users/query")

app.post('/register', (req, res) => {
    const { name, password, email, birthdate } = req.body

    doesUserExits(email, (err, user) => {
        if (err)
            return res.status(500).json({ error: 'Database query failed' })
        if (user.length > 0)
            return res.status(400).json({ error: 'User already exists' })
        const hashedPassword = bcrypt.hashSync(password, 10)

        createUser({name: name, password: hashedPassword, email: email, birthdate: birthdate}, (err) => {
            if (err)
                return res.status(500).json({ error: 'Failed to create user' })
            res.status(201).json({ message: 'User registered successfully' })
        })
    })  
})
// TO DO : list of connected user // token
app.post('/login', (req, res) => {
    const { password, email } = req.body

    doesUserExits(email, (err, user) => {
        if (err)
            return res.status(500).json({ error: 'Database query failed' })
        if (user.length == 0)
            return res.status(400).json({ error: 'User does not exists' })
        const hashedPassword = bcrypt.hashSync(password, 10)

        checkPassword({email: email, password: hashedPassword}, (err) => {
            if (err)
                return res.status(500).json({ error: 'Failed to create user' })

            res.status(201).json({ message: 'User connected', token: token })
        })
    })  
})

app.post('/logout', authenticateToken, (req, res) => {
    const token = req.headers['authorization']

    disableToken(token)
    res.status(201).json({ message: 'User disconnected' })
})
