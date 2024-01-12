
const {OpenAI} = require('openai')
const readFilesFromFolder = require('./read-test-data');

require('dotenv').config()

const debug = false || process.env.debug

const openaiClient = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // defaults to process.env["OPENAI_API_KEY"]
});

async function messageToAgent(agent, history, message) {
    history.push({ role: 'user', content: message})
    if (debug) console.log("history:")
    if (debug) console.log(JSON.stringify(history))
    const chatCompletion = await agent.chat.completions.create({
      messages: history,
      model: 'gpt-4',
    })

    const response = chatCompletion.choices[0].message
    history.push(response)
    return {
        message: response.content, //TODO elvis
        history: history
    } 
}

//const trainingData = ["say hello","let's play if I mention cat you will answer TO_USER_AGENT"]
const trainingData = readFilesFromFolder('./training-data/dev')

async function initAgentReal() {
    if (debug) console.log('training main agent')
  let currentHistory = []
  let currentMessageFromAgent
  for (const trainingMessage of trainingData) {
    if (debug) console.log('trainer:' + trainingMessage)
    const {message, history} = await messageToAgent(openaiClient, currentHistory, trainingMessage)
    currentHistory = history
    currentMessageFromAgent = message
    if (debug) console.log("agent:" + message)
  } 

  return {
    message: currentMessageFromAgent,
    agentContext: {
        history: currentHistory
    }
  }
}

const contextCheckInit = (agentContextArg) => {
    const agentContext = agentContextArg || { history: [] }
    if (!agentContext.history) {
        agentContext.history = []
    }
    return agentContext
}
const tellAgentReal = async (messageFromUser, agentContextArg) => {
    const agentContext = contextCheckInit(agentContextArg)
  
    const fromAgent = await messageToAgent(openaiClient, agentContext.history, messageFromUser)
    return {
        message: fromAgent.message,
        agentContext: {
            history: fromAgent.history
        }
    }
}

const initAgentStub = async () => {
    return {
        message: 'MC assistant here :) How can I help?',
        agentContext: {
            history: [{ test: '1' }]
        }
    }
}

const tellAgentStub = async (message, agentContext) => {
    if (debug) console.log("tell agent")
    agentContext.history.push({ test: '2' })
    return {
        message: 'COMMAND:{ "command": "navigate", "page": "products/efd25ddb-8979-4309-98cc-1261f01ffcc2", "field": "localized-text-field-1.en" }',
        agentContext: agentContext
    }
}

const tellAgent = tellAgentReal
const initAgent = initAgentReal

module.exports = {tellAgent, initAgent}