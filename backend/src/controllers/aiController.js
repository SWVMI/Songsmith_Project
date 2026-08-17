const { GoogleGenAI } = require('@google/genai');
const AiConversation = require('../models/AiConversation');

const SYSTEM_INSTRUCTION = `You are the Songsmith AI Co-Writer, a specialized songwriting assistant embedded in a
platform for independent musicians. You help with lyrics, rhymes, alternative wording, song structure
(verses/choruses/bridges/hooks), themes and concepts, chord progression suggestions, mood-based ideas,
lyric improvement, and overcoming writer's block. Stay focused on music/songwriting topics, keep a warm and
encouraging tone, and give concrete, usable suggestions rather than vague platitudes.`;

let aiClient = null;
const getClient = () => {
  if (!process.env.GEMINI_API_KEY) return null;
  if (!aiClient) {
    aiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return aiClient;
};

const summarizeTitle = (text) => {
  const trimmed = text.trim().replace(/\s+/g, ' ');
  return trimmed.length > 48 ? `${trimmed.slice(0, 48)}…` : trimmed;
};

const getConversations = async (req, res) => {
  try {
    const conversations = await AiConversation.find({ user: req.user.id })
      .select('title createdAt updatedAt')
      .sort({ updatedAt: -1 });
    res.status(200).json(conversations);
  } catch (err) {
    res.status(500).json({ message: 'Failed to load AI conversations.', error: err.message });
  }
};

const getConversation = async (req, res) => {
  try {
    const conversation = await AiConversation.findOne({ _id: req.params.id, user: req.user.id });
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found.' });
    }
    res.status(200).json(conversation);
  } catch (err) {
    res.status(500).json({ message: 'Failed to load conversation.', error: err.message });
  }
};

const createConversation = async (req, res) => {
  try {
    const conversation = await AiConversation.create({ user: req.user.id, title: 'New Conversation', messages: [] });
    res.status(201).json(conversation);
  } catch (err) {
    res.status(500).json({ message: 'Failed to create conversation.', error: err.message });
  }
};

const deleteConversation = async (req, res) => {
  try {
    const conversation = await AiConversation.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found.' });
    }
    res.status(200).json({ message: 'Conversation deleted.' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete conversation.', error: err.message });
  }
};

const sendMessage = async (req, res) => {
  try {
    const { content } = req.body;
    if (!content || !content.trim()) {
      return res.status(400).json({ message: 'Message cannot be empty.' });
    }

    const conversation = await AiConversation.findOne({ _id: req.params.id, user: req.user.id });
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found.' });
    }

    const client = getClient();
    if (!client) {
      return res.status(503).json({
        message: 'The AI Co-Writer is not configured yet. Ask an administrator to set GEMINI_API_KEY on the server.',
      });
    }

    conversation.messages.push({ role: 'user', content: content.trim() });

    const contents = conversation.messages.map((m) => ({
      role: m.role,
      parts: [{ text: m.content }],
    }));

    const response = await client.models.generateContent({
      model: 'gemini-3.6-flash',
      contents,
      config: { systemInstruction: SYSTEM_INSTRUCTION },
    });

    const aiText = response.text || "Sorry, I couldn't come up with anything that time — try rephrasing?";
    conversation.messages.push({ role: 'model', content: aiText });

    if (conversation.title === 'New Conversation') {
      conversation.title = summarizeTitle(content);
    }

    await conversation.save();
    res.status(200).json(conversation);
  } catch (err) {
    res.status(500).json({ message: 'The AI Co-Writer ran into an error. Please try again.', error: err.message });
  }
};

module.exports = { getConversations, getConversation, createConversation, deleteConversation, sendMessage };
