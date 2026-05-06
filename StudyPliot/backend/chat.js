import express from 'express';
import Anthropic from '@anthropic-ai/sdk';

const router = express.Router();
const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const systemPrompt = `
You are StudyPilot, a friendly AI study planning assistant for college students.

PERSONALITY:
- Warm, encouraging, and casual. Your speaking to 18-25 year olds so you can joke around as well lightheartedly and connect with them.
- Can maintain conversation too if user just have simple questions or concerns.
- Keep responses concise, don't overwhelm the user
- Kindly not answer explicit, inappropriate questions or words, ask for anything else or concerns that it can help with.

YOUR JOB:
- Greet the user and ask what they are working on or doing
- If User just needs to talk or have concerns dont overwhelm them with questions, let it come naturally.
- Gather info naturally through conversation:
  * What is the assignment or topic?
  * What subject/class is it for?
  * When is it due?
  * How many pages or how complex is it?
  * When are they free to study?
- If the user uploads a file (syllabus, assignment, notes, image), read it and use its content to inform your responses.
- Extract relevant info from uploaded files: assignment names, due dates, topics, complexity.
- Estimate how long the work will take based on subject and complexity
- Once you have enough info, generate a study plan

STUDY PLAN RULES:
- Distribute sessions across available days before the due date
- No session longer than 180 minutes
- Higher priority assignments get scheduled sooner
- Use 12-hour clock format for times
- Be specific in the focus field, tell them exactly what to do that session

WHEN TO GENERATE:
- Once you know the assignment, due date, and availability, generate the plan
- Do not overwhelm user with questions, 5-6 important questions max
`;

router.post('/', async (req, res) => {
  const { messages, file, username } = req.body;

  try {
    let apiMessages = [...messages];

    if (file) {
      const lastIndex = apiMessages.length - 1;
      const lastMessage = apiMessages[lastIndex];

      let contentArray = [];

      if (file.mediaType === 'application/pdf' && file.data) {
        contentArray.push({
          type: 'document',
          source: {
            type: 'base64',
            media_type: 'application/pdf',
            data: file.data,
          },
        });
      } else if (file.mediaType && file.mediaType.startsWith('image/') && file.data) {
        contentArray.push({
          type: 'image',
          source: {
            type: 'base64',
            media_type: file.mediaType,
            data: file.data,
          },
        });
      } else if (file.textContent) {
        contentArray.push({
          type: 'text',
          text: `The user uploaded a file named "${file.name}". Here is its content:\n\n${file.textContent}`,
        });
      }

      if (lastMessage.content) {
        contentArray.push({
          type: 'text',
          text: lastMessage.content,
        });
      }

      if (contentArray.length > 0) {
        apiMessages[lastIndex] = {
          role: 'user',
          content: contentArray,
        };
      }
    }

    const userContext = username ? `\nThe current user is: ${username}` : '';
    const customPrompt = systemPrompt + userContext;

    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      system: customPrompt,
      messages: apiMessages,
    });

    if (!response.content || !response.content[0] || !response.content[0].text) {
      console.error('Unexpected API response format:', response);
      return res.status(500).json({ message: 'Invalid response from AI' });
    }

    const reply = response.content[0].text;
    res.json({ reply });
  } catch (error) {
    console.error('AI error:', error.message || error);
    if (error.status === 400) {
      console.error('Bad request to Anthropic API:', error);
    }
    res.status(500).json({ message: 'AI request failed' });
  }
});

export default router;
