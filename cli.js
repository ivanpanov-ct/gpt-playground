const readline = require('readline')
const { tellAgent, initAgent } = require('./agent-service')

//TODO multiline input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const tellUser = (messageFromAgent) => new Promise((resolve) => rl.question(messageFromAgent + '\n', resolve))

const main = async () => {
  let currentContext = {}
  let currentMessageFromAgent = ''

  const {message, agentContext} = await initAgent()
  currentContext = agentContext
  currentMessageFromAgent = message

  while (true) {
    const messageFromUser = await tellUser(currentMessageFromAgent)
    const {message, agentContext} = await tellAgent(messageFromUser, currentContext)
    currentMessageFromAgent = message
    currentContext = agentContext
  }
};

main()