
const {OpenAI} = require('openai');

require('dotenv').config()

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const assistantId = process.env.ASSISTANT_ID
async function initAgent() {
  const thread = await openai.beta.threads.create();

  return {
    agentContext: {
        threadId: thread.id
    }
  }
}

const waitFor = async (interval) => { return new Promise(resolve => setTimeout(resolve, interval))} 

async function waitForCompletion(runArg, agentContext) {
    let status = "processing"
    const pollingInterval = 200

    while (status !== "completed") {
        await waitFor(pollingInterval)
        const run = await openai.beta.threads.runs.retrieve(
            agentContext.threadId,
            runArg.id
          )
        status = run.status  
    }
}

const tellAgent = async (messageFromUser, agentContext) => {
    openai.beta.threads.messages.create(
        agentContext.threadId,
        {
          role: "user",
          content: messageFromUser
        }
      )

    const run = await openai.beta.threads.runs.create(
        agentContext.threadId,
        { 
          assistant_id: assistantId
        }
      )

    await waitForCompletion(run, agentContext)
  
    const threadMessages = await openai.beta.threads.messages.list(agentContext.threadId)

    const history = threadMessages.data.map(d => {return {role: d.role, content: d.content}})
    const latestMessage = history[0]

    return {
        message: latestMessage.content[0].text.value,
        agentContext: agentContext
    }
}

module.exports = {tellAgent, initAgent}