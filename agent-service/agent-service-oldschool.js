
const {OpenAI} = require('openai')
const readFilesFromFolder = require('./read-test-data');

require('dotenv').config()

const debug = false || process.env.debug

const openaiClient = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, 
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
        message: response.content,
        history: history
    } 
}

//const trainingData = ["say hello","let's play if I mention cat you will answer TO_USER_AGENT"]
const trainingData = readFilesFromFolder('./training-data/dev')

async function initAgent() {
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
const tellAgent = async (messageFromUser, agentContextArg) => {
    const agentContext = contextCheckInit(agentContextArg)
  
    const fromAgent = await messageToAgent(openaiClient, agentContext.history, messageFromUser)
    return {
        message: fromAgent.message,
        agentContext: {
            history: fromAgent.history
        }
    }
}

module.exports = {tellAgent, initAgent}