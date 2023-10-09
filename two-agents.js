
const {OpenAI} = require('openai')
const prompt = require('prompt-sync')()

const readFilesFromFolder = require('./read-test-data');



require('dotenv').config()

const debug = false

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const mainAgentMessages = []
const userAgentMessages = []

async function messageToAgent(history, message) {
    history.push({ role: 'user', content: message})
    if (debug) console.log("history:")
    if (debug) console.log(JSON.stringify(history))
    const chatCompletion = await openai.chat.completions.create({
      messages: history,
      model: 'gpt-4',
    })

    const response = chatCompletion.choices[0].message
    history.push(response)
    return response.content //TODO elvis
}
async function sayToMainAgent (message) {
  if (debug) console.log("to main agent: " + message)
  return messageToAgent(mainAgentMessages, message)
}

async function sayToUserAgent (message) {
  if (debug) console.log("to user agent: " + message)
  return messageToAgent(userAgentMessages, message)
}

//const trainingDataMainAgent = ["let's play a game: I'll be giving you a number and you will increment it by 2. Please answer with just the number. We start by command STARTGAME", "STARTGAME"]
//const trainingDataUserAgent = ["let's play a game: I'll be giving you a number and you will decrement it by 1. Please answer with just the number.  We start by command STARTGAME", "STARTGAME"]
const trainingDataMainAgent = readFilesFromFolder('./training-data/main')
const trainingDataUserAgent = readFilesFromFolder('./training-data/user')
console.log("@1")
console.log(trainingDataMainAgent)
console.log(trainingDataUserAgent)


async function trainMainAgent() {
  console.log('\x1b[31m%s\x1b[0m','training main agent')
  let response
  for (const trainingMessage of trainingDataMainAgent) {
    console.log('\x1b[34m%s\x1b[0m','trainer:' + trainingMessage);
    response = await sayToMainAgent(trainingMessage)
    console.log('\x1b[31m%s\x1b[0m', "main:" + response)
  }
  return response

}

async function trainUserAgent() {
  console.log('\x1b[32m%s\x1b[0m','training user agent')
  
  for (const trainingMessage of trainingDataUserAgent) {
    console.log('\x1b[34m%s\x1b[0m','user:' + trainingMessage);
    const response = await sayToUserAgent(trainingMessage)
    console.log('\x1b[32m%s\x1b[0m', "agent:" + response)
  } 
}

async function eventloop(initialMessage) {
  let fromMainAgent = initialMessage
  console.log('\x1b[1;30m%s\x1b[0m', 'starting the game')
  while(true) {
    console.log('\x1b[31m%s\x1b[0m', "main: " + fromMainAgent)
    const fromUserAgent = await sayToUserAgent(fromMainAgent)
    console.log('\x1b[32m%s\x1b[0m', "user: " + fromUserAgent)
    fromMainAgent = await sayToMainAgent(fromUserAgent)
  }
}

async function main() {
  await trainUserAgent()
  const lastMessageFromMainAgent = await trainMainAgent()


  if (debug) console.log("history user:")
  if (debug) console.log(JSON.stringify(userAgentMessages))
  if (debug) console.log("history main:")
  if (debug) console.log(JSON.stringify(mainAgentMessages))

  await eventloop(lastMessageFromMainAgent)
}

main()
