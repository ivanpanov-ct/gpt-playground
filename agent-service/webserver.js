const express = require('express')
const cors = require('cors')
const {initAgent, tellAgent} = require('./agent-service-assistent-api')
const app = express()

app.use(cors())

app.use(express.json())

app.post('/agent/init', async (req, res) => {
    const fromAgent = await initAgent()
    res.status(200).send(JSON.stringify(fromAgent))
})

app.post('/agent/tell', async (req, res) => {
    const fromUser = req.body
    const fromAgent = await tellAgent(fromUser.message, fromUser.agentContext)
    res.status(200).send(fromAgent)
})

const PORT = 8080
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})



