import { Request, Response } from 'express';
import { aiService } from '../services/aiService';
import { voiceService } from '../services/voiceService';

export const aiController = {
  async getInsights(req: Request, res: Response) {
    try {
      const insights = await aiService.generateBusinessInsights();
      res.json({ success: true, data: insights });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  },

  async ask(req: Request, res: Response) {
    try {
      const { question } = req.body;
      if (!question || typeof question !== 'string') {
        return res.status(400).json({ success: false, error: 'Question string is required' });
      }
      const answer = await aiService.askKiranaAssistant(question);
      res.json({ success: true, data: { answer } });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  },

  async parseVoice(req: Request, res: Response) {
    try {
      const { transcript, language = 'en-IN' } = req.body;
      if (!transcript || typeof transcript !== 'string') {
        return res.status(400).json({ success: false, error: 'Voice transcript is required' });
      }
      const result = await voiceService.parseVoiceBillingInput(transcript, language);
      res.json({ success: true, data: result });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }
};
