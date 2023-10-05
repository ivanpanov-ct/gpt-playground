

const {OpenAI} = require('openai')
const prompt = require('prompt-sync')()

require('dotenv').config()


const openaiMainAgent = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // defaults to process.env["OPENAI_API_KEY"]
});


const mainAgentMessages = []
const userAgentMessages = []

async function messageToAgent(agent, history, message) {
    history.push({ role: 'user', content: message})
    console.log("history:")
    console.log(JSON.stringify(history))
    const chatCompletion = await agent.chat.completions.create({
      messages: history,
      model: 'gpt-4',
    })

    const response = chatCompletion.choices[0].message
    history.push(response)
    return response.content //TODO elvis
}

const trainingDataMainAgent = ["say hello","let's play if I mention cat you will answer TO_USER_AGENT"]

async function trainMainAgent() {
  console.log('training main agent')
  
  for (const trainingMessage of trainingDataMainAgent) {
    console.log('trainer:' + trainingMessage);
    const response = await sayToMainAgent(trainingMessage)
    console.log("agent:" + response)
  } 
}


async function trainUserAgent() {

}


async function sayToMainAgent (message) {
  onsole.log("to main agent: " + message)
  return messageToAgent(openaiMainAgent, mainAgentMessages, message)
}


async function sayToUserAgent (message) {
  console.log("to user agent: " + message)
  return messageToAgent(openaiMainAgent, userAgentMessages, message)
}

function parseMessageFromMainAgent(message) {
  return {
    command: 'TO_HUMAN',
    message: message
  }
} 

async function eventloop() {
  let humanInput
  while(true) {
    humanInput =  prompt('')
    const fromMainAgent = await sayToMainAgent(humanInput)
    const {command, messageFromMainAgentParsed} = parseMessageFromMainAgent(fromMainAgent)
    switch (command) {
      case 'TO_HUMAN':
        console.log(messageFromMainAgent)
        break;
      case 'TO_USER_AGENT':
        console.log('to user agent:');
        const fromUserAgent = sayToUserAgent(messageFromMainAgentParsed)
        break;
    }

  }
}

async function main() {
  await trainMainAgent()
  await eventloop()
}

main()
