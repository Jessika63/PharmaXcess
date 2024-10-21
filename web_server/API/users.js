const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')
const { createUser } = require('../SQL/users/query')
const { authenticateToken, disableToken, createToken } = require("../tools/token")
const { doesUserExits } = require("../SQL/users/query")

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Inscrit un nouvel utilisateur
 *     description: Crée un utilisateur avec un mot de passe haché si l'adresse e-mail n'existe pas déjà.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: John Doe
 *                 description: Nom de l'utilisateur.
 *               password:
 *                 type: string
 *                 example: "strongpassword123"
 *                 description: Mot de passe de l'utilisateur.
 *               email:
 *                 type: string
 *                 example: john.doe@example.com
 *                 description: Adresse e-mail de l'utilisateur.
 *               birthdate:
 *                 type: timestamp
 *                 format: date
 *                 example: "1729533390"
 *                 description: Date de naissance de l'utilisateur.
 *     responses:
 *       201:
 *         description: Utilisateur inscrit avec succès.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User registered successfully
 *       400:
 *         description: L'utilisateur existe déjà.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: User already exists
 *       500:
 *         description: Échec de la requête à la base de données ou de la création de l'utilisateur.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Database query failed
*/
router.post('/register', (req, res) => {
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
router.post('/login', (req, res) => {
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

            res.status(201).json({ message: 'User connected', token: createToken(user[0].email, user[0].id) })
        })
    })
})

router.post('/logout', authenticateToken, (req, res) => {
    const token = req.headers['authorization']

    disableToken(token)
    res.status(201).json({ message: 'User disconnected' })
})

module.exports = router
