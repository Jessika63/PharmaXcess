const express = require('express')
const router = express.Router()
const { getMachines, getNearestMachines, getMachineByID } = require("../SQL/vending_machines/query")
const { generateGoogleMapsLink } = require("../tools/google_map")
const { authenticateToken } = require("../tools/token")

/**
 * @swagger
 * tags:
 *   - name: Distributeurs
 *     description: Opérations relatives aux distributeurs automatiques.
*/

/**
 * @swagger
 * /machine/vending_machines:
 *   get:
 *     summary: Récupère la liste des distributeurs automatiques
 *     description: Permet de récupérer toutes les machines disponibles. Nécessite un token d'authentification.
 *     tags:
 *      - Distributeurs
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Liste des distributeurs automatiques récupérée avec succès.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 1
 *                     description: Identifiant unique de la machine.
 *                   latitude:
 *                     type: number
 *                     format: float
 *                     example: 50.1001
 *                     description: Latitude de la machine.
 *                   longitude:
 *                     type: number
 *                     format: float
 *                     example: -60.5645
 *                     description: Longitude de la machine.
 *                   status:
 *                     type: string
 *                     example: "active"
 *                     description: Statut actuel de la machine (active, en maintenance, etc.).
 *       401:
 *         description: Token invalide ou manquant.
 *       500:
 *         description: Échec de la requête à la base de données.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Database query failed
*/
router.get('/vending_machines', authenticateToken, (req, res) => {
    getMachines((err, machines) => {
        if (err)
            return res.status(500).json({ error: 'Database query failed' })
        res.status(201).json(machines)
    })
})

/**
 * @swagger
 * /machine/get_nearest:
 *   get:
 *     summary: Récupère les 10 distributeurs automatiques les plus proches
 *     description: Permet d'obtenir les 10 distributeurs automatiques les plus proches à partir des coordonnées fournies. Nécessite un token d'authentification.
 *     tags:
 *       - Distributeurs
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: latitude
 *         required: true
 *         schema:
 *           type: number
 *           format: float
 *           example: 46.78237179736
 *         description: Latitude actuelle de l'utilisateur.
 *       - in: query
 *         name: longitude
 *         required: true
 *         schema:
 *           type: number
 *           format: float
 *           example: -71.27504728400096
 *         description: Longitude actuelle de l'utilisateur.
 *     responses:
 *       201:
 *         description: Liste des 10 distributeurs automatiques les plus proches récupérée avec succès.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 1
 *                     description: Identifiant unique de la machine.
 *                   location:
 *                     type: string
 *                     example: "123 Main Street"
 *                     description: Adresse de la machine.
 *                   distance:
 *                     type: number
 *                     format: float
 *                     example: 2.5
 *                     description: Distance entre l'utilisateur et la machine en kilomètres.
 *                   status:
 *                     type: string
 *                     example: "active"
 *                     description: Statut actuel de la machine (active, en maintenance, etc.).
 *       400:
 *         description: Latitude et longitude manquantes.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Latitude and Longitude are required.
 *       401:
 *         description: Token invalide ou manquant.
 *       500:
 *         description: Échec de la requête à la base de données.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Database query failed
*/
router.get('/get_nearest', authenticateToken, (req, res) => {
    const { latitude, longitude } = req.query

    if (!latitude || !longitude)
        return res.status(400).json({ error: 'Latitude and Longitude are required.' })
    getNearestMachines(longitude, latitude, 10, (err, machines) => {
        if (err)
            return res.status(500).json({ error: 'Database query failed' })
        res.status(201).json(machines)
    })
})

/**
 * @swagger
 * /machine/get_itinary:
 *   get:
 *     summary: Récupère un lien Google Maps pour un itinéraire vers un distributeur automatique
 *     description: Génère un lien vers Google Maps à partir des coordonnées de l'utilisateur et de celles du distributeur sélectionné. Nécessite un token d'authentification.
 *     tags:
 *       - Distributeurs
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: latitude
 *         required: true
 *         schema:
 *           type: number
 *           format: float
 *           example: 46.78237179736
 *         description: Latitude actuelle de l'utilisateur.
 *       - in: query
 *         name: longitude
 *         required: true
 *         schema:
 *           type: number
 *           format: float
 *           example: -71.27504728400096
 *         description: Longitude actuelle de l'utilisateur.
 *       - in: query
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *         description: Identifiant unique du distributeur automatique.
 *     responses:
 *       201:
 *         description: Lien Google Maps généré avec succès.
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *               example: "https://www.google.com/maps/dir/?api=1&origin=50.1001,-60.5645&destination=45.5017,-73.5673"
 *       400:
 *         description: ID invalide ou manquant.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: ID is required.
 *       401:
 *         description: Token invalide ou manquant.
 *       500:
 *         description: Échec de la requête à la base de données.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Database query failed
*/
router.get('/get_itinary', authenticateToken, (req, res) => {
    const { latitude, longitude, id } = req.query // latitude & longitude are user's coords

    if (!id | id < 0)
        return res.status(400).json({ error: 'ID is required.' })
    getMachineByID(id, (err, machine) => {
        if (err)
            return res.status(500).json({ error: 'Database query failed' })
        res.status(201).json(generateGoogleMapsLink({latA: latitude, lngA: longitude}, {latB: machine.latitude, lngB: machine.longitude}))
    })
})

module.exports = router