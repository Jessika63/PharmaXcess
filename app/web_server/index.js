const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const swaggerUi = require('swagger-ui-express')
const swaggerSpec = require('./docs/swagger')
const authRoutes = require('./API/users')
const { initSQL, endSQL } = require('./SQL/init')

app.use(bodyParser.json())
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))
app.use('/auth', authRoutes)

app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000')
    initSQL()
})

module.exports = app