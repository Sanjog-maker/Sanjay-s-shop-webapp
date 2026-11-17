import express from 'express';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { StoreDb } from './server/data/store';
import { IntelligenceService } from './server/services/intelligenceService';
import { parseVoiceBilling, parseVoiceIntent, generateStoreAIInsights, askKiranaAssistant } from './server/services/gemini';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;
  const httpServer = http.createServer(app);

  app.use(express.json());

  // -------------------------------------------------------------
  // API Routes
  // -------------------------------------------------------------

  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString(), app: 'ShopIQ' });
  });

  // --- PRODUCTS ---
  app.get('/api/products', (req, res) => {
    try {
      const products = StoreDb.getProducts();
      res.json({ success: true, data: products });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  app.post('/api/products', (req, res) => {
    try {
      const product = StoreDb.addProduct(req.body);
      res.status(201).json({ success: true, data: product });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  });

  app.put('/api/products/:id', (req, res) => {
    try {
      const updated = StoreDb.updateProduct(req.params.id, req.body);
      if (!updated) {
        return res.status(404).json({ success: false, error: 'Product not found' });
      }
      res.json({ success: true, data: updated });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  });

  app.delete('/api/products/:id', (req, res) => {
    try {
      const deleted = StoreDb.deleteProduct(req.params.id);
      if (!deleted) {
        return res.status(404).json({ success: false, error: 'Product not found' });
      }
      res.json({ success: true, message: 'Product deleted' });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // --- INVENTORY ---
  app.get('/api/inventory', (req, res) => {
    try {
      const products = StoreDb.getProducts();
      const lowStock = products.filter((p) => p.currentStock <= (p.minimumStock ?? p.minStockLevel ?? 5));
      const costValue = products.reduce((acc, p) => acc + p.currentStock * p.purchasePrice, 0);
      const retailValue = products.reduce((acc, p) => acc + p.currentStock * p.sellingPrice, 0);
      const totalUnits = products.reduce((acc, p) => acc + p.currentStock, 0);

      res.json({
        success: true,
        data: {
          products,
          lowStock,
          totalUnits,
          costValue,
          retailValue,
          potentialProfit: retailValue - costValue
        }
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  app.post('/api/inventory/restock', (req, res) => {
    try {
      const result = StoreDb.restockProduct(req.body);
      if (!result) {
        return res.status(404).json({ success: false, error: 'Product not found' });
      }
      res.json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  });

  app.post('/api/inventory/adjust', (req, res) => {
    try {
      const result = StoreDb.adjustStock(req.body);
      if (!result) {
        return res.status(404).json({ success: false, error: 'Product not found' });
      }
      res.json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  });

  app.get('/api/inventory/history', (req, res) => {
    try {
      const history = StoreDb.getStockMovements();
      res.json({ success: true, data: history });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // --- SALES / BILLING ---
  app.get('/api/sales', (req, res) => {
    try {
      const bills = StoreDb.getBills();
      res.json({ success: true, data: bills });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  app.post('/api/sales', (req, res) => {
    try {
      const newBill = StoreDb.createBill(req.body);
      res.status(201).json({ success: true, data: newBill });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  });

  // --- DASHBOARD & METRICS ---
  app.get('/api/dashboard/metrics', (req, res) => {
    try {
      const metrics = StoreDb.getDashboardMetrics();
      res.json({ success: true, data: metrics });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // --- ANALYTICS ---
  app.get('/api/analytics', (req, res) => {
    try {
      const analytics = StoreDb.getAnalytics();
      res.json({ success: true, data: analytics });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // --- RETAIL INTELLIGENCE PLATFORM ENDPOINTS ---
  app.get('/api/intelligence/command-center', (req, res) => {
    try {
      const data = IntelligenceService.getCommandCenterData();
      res.json({ success: true, data });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  app.get('/api/intelligence/stockouts', (req, res) => {
    try {
      const predictions = IntelligenceService.getStockoutPredictions();
      res.json({ success: true, data: predictions });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  app.get('/api/intelligence/profit', (req, res) => {
    try {
      const analysis = IntelligenceService.getProfitAnalysis();
      res.json({ success: true, data: analysis });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  app.get('/api/intelligence/expiry', (req, res) => {
    try {
      const report = IntelligenceService.getExpiryRiskReport();
      res.json({ success: true, data: report });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  app.get('/api/intelligence/reorder', (req, res) => {
    try {
      const reorder = IntelligenceService.getSmartReorderAssistant();
      res.json({ success: true, data: reorder });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  app.get('/api/intelligence/anomalies', (req, res) => {
    try {
      const anomalies = IntelligenceService.getSalesAnomalies();
      res.json({ success: true, data: anomalies });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // --- AI VOICE BILLING PARSER ---
  app.post('/api/ai/voice-parse', async (req, res) => {
    try {
      const { transcript, language = 'en-IN' } = req.body;
      if (!transcript || typeof transcript !== 'string') {
        return res.status(400).json({ success: false, error: 'Transcript is required' });
      }

      const products = StoreDb.getProducts();
      const parseResult = await parseVoiceBilling(transcript, language, products);
      res.json({ success: true, data: parseResult });
    } catch (error: any) {
      console.error('Voice parsing error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // --- AI VOICE INTENT / ASSISTANT ---
  app.post('/api/ai/voice-intent', async (req, res) => {
    try {
      const { transcript } = req.body;
      if (!transcript || typeof transcript !== 'string') {
        return res.status(400).json({ success: false, error: 'Transcript is required' });
      }

      const products = StoreDb.getProducts();
      const metrics = StoreDb.getDashboardMetrics();
      const result = await parseVoiceIntent(transcript, products, metrics);
      res.json({ success: true, data: result });
    } catch (error: any) {
      console.error('Voice intent error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // --- AI STORE INSIGHTS ---
  app.post('/api/ai/insights', async (req, res) => {
    try {
      const metrics = StoreDb.getDashboardMetrics();
      const analytics = StoreDb.getAnalytics();
      const products = StoreDb.getProducts();
      const bills = StoreDb.getBills();

      const insights = await generateStoreAIInsights(metrics, analytics, products, bills);
      res.json({ success: true, data: insights });
    } catch (error: any) {
      console.error('Insights generation error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // --- ASK SHOPIQ AI COPILOT ---
  app.post('/api/ai/ask', async (req, res) => {
    try {
      const { question } = req.body;
      if (!question || typeof question !== 'string') {
        return res.status(400).json({ success: false, error: 'Question is required' });
      }

      const products = StoreDb.getProducts();
      const bills = StoreDb.getBills();
      const metrics = StoreDb.getDashboardMetrics();

      const answerData = await askKiranaAssistant(question, products, bills, metrics);
      res.json({ success: true, data: answerData });
    } catch (error: any) {
      console.error('AI Ask error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // -------------------------------------------------------------
  // Vite Integration
  // -------------------------------------------------------------
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: {
          server: httpServer
        }
      },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`[ShopIQ Server] Running on http://localhost:${PORT}`);
  });
}

startServer();
