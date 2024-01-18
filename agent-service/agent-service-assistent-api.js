

const {OpenAI} = require('openai')

require('dotenv').config()

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const assistantInstructions = "you will convert CSV to JSON. The user will give you CSV as input, and you give the JSON back. Please no further explanaitons and no markdown, only raw JSON (your responses will be parsed by a programm)."

async function initAgent() {
    const thread = await openai.beta.threads.create();

    const assistant = await openai.beta.assistants.create({
        name: "My first assistant",
        instructions: assistantInstructions,
        tools: [{ type: "code_interpreter" }],
        model: "gpt-4-1106-preview"
      });

  return {
    agentContext: {
        assistentId: assistant.id,
        threadId: thread.id
    }
  }
}

async function waitForCompletion(runArg, agentContext) {
    let status = "active"
    const pollingInterval = 200

    while (status !== "completed") {
        await new Promise(resolve => setTimeout(resolve, pollingInterval))
        const run = await openai.beta.threads.runs.retrieve(
            agentContext.threadId,
            runArg.id
          )
        status = run.status  
    }
}

const tellAgent = async (messageFromUser, agentContext) => {
    const message = await openai.beta.threads.messages.create(
        agentContext.threadId,
        {
          role: "user",
          content: messageFromUser
        }
      )

    const run = await openai.beta.threads.runs.create(
        agentContext.threadId,
        { 
          assistant_id: agentContext.assistentId
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