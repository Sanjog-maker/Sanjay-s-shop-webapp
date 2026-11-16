import {
  collection,
  doc,
  onSnapshot,
  setDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  writeBatch,
  query,
  orderBy,
  limit
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import {
  Product,
  Sale,
  Bill,
  CartItem,
  DashboardMetrics,
  StockMovement,
  RestockEntry,
  StockAdjustmentEntry
} from '../types/index';
import {
  getTodaysSales,
  getTodaysBillCount,
  getLowStockProducts,
  getInventoryValue,
  getRecentTransactions,
  getSalesGrowth,
  calculateTotalProfit
} from './storeService';

// Default initial catalog
const defaultProducts: Product[] = [
  {
    id: 'prod-001',
    name: 'Aashirvaad Superior MP Atta (5kg)',
    brand: 'Aashirvaad (ITC)',
    category: 'Atta & Flours',
    sku: 'AASH-ATT-5KG',
    unit: 'packet',
    mrp: 275,
    sellingPrice: 245,
    purchasePrice: 215,
    currentStock: 18,
    minimumStock: 5,
    minStockLevel: 5,
    supplier: 'ITC Wholesale Distributor',
    regionalName: 'ஆசீர்வாத் கோதுமை மாவு (5 கிலோ)',
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=300&auto=format&fit=crop&q=60',
    batchNumber: 'ITC-ATT-882',
    expiryDate: new Date(Date.now() + 120 * 86400000).toISOString().slice(0, 10),
    leadTimeDays: 2,
    safetyStock: 6,
    createdAt: '2026-08-01T10:00:00.000Z',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'prod-002',
    name: 'Aashirvaad Shudh Chakki Atta (10kg)',
    brand: 'Aashirvaad (ITC)',
    category: 'Atta & Flours',
    sku: 'AASH-ATT-10KG',
    unit: 'packet',
    mrp: 520,
    sellingPrice: 470,
    purchasePrice: 420,
    currentStock: 6,
    minimumStock: 4,
    minStockLevel: 4,
    supplier: 'ITC Wholesale Distributor',
    regionalName: 'ஆசீர்வாத் கோதுமை மாவு (10 கிலோ)',
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=300&auto=format&fit=crop&q=60',
    batchNumber: 'ITC-ATT-874',
    expiryDate: new Date(Date.now() + 90 * 86400000).toISOString().slice(0, 10),
    leadTimeDays: 2,
    safetyStock: 4,
    createdAt: '2026-08-01T10:00:00.000Z',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'prod-003',
    name: 'Tata Sampann Unpolished Toor Dal (1kg)',
    brand: 'Tata Sampann',
    category: 'Dal & Pulses',
    sku: 'TATA-DAL-1KG',
    unit: 'packet',
    mrp: 195,
    sellingPrice: 175,
    purchasePrice: 148,
    currentStock: 24,
    minimumStock: 8,
    minStockLevel: 8,
    supplier: 'Tata Consumer Products Ltd',
    regionalName: 'டாடா துவரம் பருப்பு (1 கிலோ)',
    image: 'https://images.unsplash.com/photo-1585996746972-c753d540265e?w=300&auto=format&fit=crop&q=60',
    batchNumber: 'TCP-DAL-341',
    expiryDate: new Date(Date.now() + 180 * 86400000).toISOString().slice(0, 10),
    leadTimeDays: 3,
    safetyStock: 8,
    createdAt: '2026-08-01T10:00:00.000Z',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'prod-004',
    name: 'Moong Dal Yellow Split (1kg)',
    brand: 'Premium Gold / Loose Pack',
    category: 'Dal & Pulses',
    sku: 'MNG-DAL-1KG',
    unit: 'packet',
    mrp: 160,
    sellingPrice: 140,
    purchasePrice: 118,
    currentStock: 3, // LOW STOCK
    minimumStock: 10,
    minStockLevel: 10,
    supplier: 'Sri Murugan Grain Mandi',
    regionalName: 'பாசிப் பருப்பு (1 கிலோ)',
    image: 'https://images.unsplash.com/photo-1585996746972-c753d540265e?w=300&auto=format&fit=crop&q=60',
    batchNumber: 'MND-MNG-99',
    expiryDate: new Date(Date.now() + 150 * 86400000).toISOString().slice(0, 10),
    leadTimeDays: 1,
    safetyStock: 8,
    createdAt: '2026-08-01T10:00:00.000Z',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'prod-005',
    name: 'Fortune Sunlite Refined Sunflower Cooking Oil (1L)',
    brand: 'Fortune (Adani Wilmar)',
    category: 'Oils & Ghee',
    sku: 'FORT-OIL-1L',
    unit: 'pouch',
    mrp: 155,
    sellingPrice: 135,
    purchasePrice: 115,
    currentStock: 2, // HIGH VELOCITY STOCKOUT RISK
    minimumStock: 12,
    minStockLevel: 12,
    supplier: 'Adani Wilmar Supply Co',
    regionalName: 'ஃபார்ச்சூன் சூரியகாந்தி எண்ணெய் (1 லிட்டர்)',
    image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=300&auto=format&fit=crop&q=60',
    batchNumber: 'AW-OIL-202',
    expiryDate: new Date(Date.now() + 180 * 86400000).toISOString().slice(0, 10),
    leadTimeDays: 2,
    safetyStock: 12,
    createdAt: '2026-08-01T10:00:00.000Z',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'prod-006',
    name: 'Idhayam Sesame Gingelly Oil (500ml)',
    brand: 'Idhayam',
    category: 'Oils & Ghee',
    sku: 'IDH-OIL-500ML',
    unit: 'bottle',
    mrp: 230,
    sellingPrice: 210,
    purchasePrice: 182,
    currentStock: 12,
    minimumStock: 5,
    minStockLevel: 5,
    supplier: 'V.V.V & Sons Edible Oils',
    regionalName: 'இதயம் நல்லெண்ணெய் (500 மி.லி)',
    image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=300&auto=format&fit=crop&q=60',
    batchNumber: 'VVV-IDH-71',
    expiryDate: new Date(Date.now() + 240 * 86400000).toISOString().slice(0, 10),
    leadTimeDays: 3,
    safetyStock: 4,
    createdAt: '2026-08-01T10:00:00.000Z',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'prod-007',
    name: 'Amul Pure Ghee (500ml Tin)',
    brand: 'Amul',
    category: 'Oils & Ghee',
    sku: 'AMUL-GHEE-500',
    unit: 'box',
    mrp: 345,
    sellingPrice: 320,
    purchasePrice: 285,
    currentStock: 14,
    minimumStock: 4,
    minStockLevel: 4,
    supplier: 'Gujarat Milk Federation',
    regionalName: 'அமுல் தூய நெய் (500 மி.லி)',
    image: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=300&auto=format&fit=crop&q=60',
    batchNumber: 'GCMMF-GH-41',
    expiryDate: new Date(Date.now() + 210 * 86400000).toISOString().slice(0, 10),
    leadTimeDays: 3,
    safetyStock: 4,
    createdAt: '2026-08-01T10:00:00.000Z',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'prod-008',
    name: 'Royal Deluxe Ponni Boiled Rice (10kg)',
    brand: 'Royal Ponni',
    category: 'Rice & Grains',
    sku: 'PONNI-RICE-10KG',
    unit: 'packet',
    mrp: 640,
    sellingPrice: 580,
    purchasePrice: 510,
    currentStock: 8,
    minimumStock: 5,
    minStockLevel: 5,
    supplier: 'Tanjore Modern Rice Mill',
    regionalName: 'ராயல் டீலக்ஸ் பொன்னி புழுங்கல் அரிசி (10 கிலோ)',
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=300&auto=format&fit=crop&q=60',
    batchNumber: 'TNJ-PON-12',
    expiryDate: new Date(Date.now() + 365 * 86400000).toISOString().slice(0, 10),
    leadTimeDays: 2,
    safetyStock: 5,
    createdAt: '2026-08-01T10:00:00.000Z',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'prod-009',
    name: 'India Gate Feast Rozzana Basmati Rice (1kg)',
    brand: 'India Gate',
    category: 'Rice & Grains',
    sku: 'IND-BASM-1KG',
    unit: 'packet',
    mrp: 130,
    sellingPrice: 110,
    purchasePrice: 88,
    currentStock: 2, // LOW STOCK
    minimumStock: 6,
    minStockLevel: 6,
    supplier: 'KRBL Basmati Logistics',
    regionalName: 'இந்தியா கேட் பாஸ்மதி அரிசி (1 கிலோ)',
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=300&auto=format&fit=crop&q=60',
    batchNumber: 'KRBL-BAS-50',
    expiryDate: new Date(Date.now() + 300 * 86400000).toISOString().slice(0, 10),
    leadTimeDays: 4,
    safetyStock: 6,
    createdAt: '2026-08-01T10:00:00.000Z',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'prod-010',
    name: 'Aavin Standardized Cow Milk (500ml Pouch)',
    brand: 'Aavin / Arokya',
    category: 'Dairy',
    sku: 'AAVIN-MLK-500ML',
    unit: 'packet',
    mrp: 28,
    sellingPrice: 28,
    purchasePrice: 25.5,
    currentStock: 45,
    minimumStock: 15,
    minStockLevel: 15,
    supplier: 'Tamil Nadu Dairy Development',
    regionalName: 'ஆவின் பால் (500 மி.லி பாக்கெட்)',
    image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=300&auto=format&fit=crop&q=60',
    batchNumber: 'AAV-MLK-TODAY',
    expiryDate: new Date(Date.now() + 1 * 86400000).toISOString().slice(0, 10), // CRITICAL EXPIRY
    leadTimeDays: 1,
    safetyStock: 20,
    createdAt: '2026-08-01T10:00:00.000Z',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'prod-010b',
    name: 'Milky Mist Fresh Paneer (200g)',
    brand: 'Milky Mist',
    category: 'Dairy',
    sku: 'MM-PAN-200G',
    unit: 'packet',
    mrp: 95,
    sellingPrice: 88,
    purchasePrice: 72,
    currentStock: 8,
    minimumStock: 4,
    minStockLevel: 4,
    supplier: 'Tamil Nadu Dairy Development',
    regionalName: 'மில்கி மிஸ்ட் பனீர் (200 கிராம்)',
    image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=300&auto=format&fit=crop&q=60',
    batchNumber: 'MM-PAN-09',
    expiryDate: new Date(Date.now() + 2 * 86400000).toISOString().slice(0, 10), // CRITICAL EXPIRY
    leadTimeDays: 1,
    safetyStock: 4,
    createdAt: '2026-08-01T10:00:00.000Z',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'prod-011',
    name: 'Britannia Good Day Cashew Biscuits (200g)',
    brand: 'Britannia',
    category: 'Snacks & Biscuits',
    sku: 'BRIT-GD-200G',
    unit: 'packet',
    mrp: 45,
    sellingPrice: 40,
    purchasePrice: 32,
    currentStock: 35,
    minimumStock: 10,
    minStockLevel: 10,
    supplier: 'Britannia Regional Agency',
    regionalName: 'பிரிட்டானியா குட் டே பிஸ்கட் (200 கிராம்)',
    image: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=300&auto=format&fit=crop&q=60',
    batchNumber: 'BRIT-GD-90',
    expiryDate: new Date(Date.now() + 120 * 86400000).toISOString().slice(0, 10),
    leadTimeDays: 2,
    safetyStock: 10,
    createdAt: '2026-08-01T10:00:00.000Z',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'prod-012',
    name: 'Sunfeast Dark Fantasy Choco Fills (300g)',
    brand: 'Sunfeast (ITC)',
    category: 'Snacks & Biscuits',
    sku: 'SUNF-DF-300G',
    unit: 'box',
    mrp: 120,
    sellingPrice: 105,
    purchasePrice: 85,
    currentStock: 18,
    minimumStock: 6,
    minStockLevel: 6,
    supplier: 'ITC Wholesale Distributor',
    regionalName: 'சன்ஃபீஸ்ட் டார்க் ஃபேண்டசி (300 கிராம்)',
    image: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=300&auto=format&fit=crop&q=60',
    batchNumber: 'SF-DF-441',
    expiryDate: new Date(Date.now() + 60 * 86400000).toISOString().slice(0, 10),
    leadTimeDays: 2,
    safetyStock: 6,
    createdAt: '2026-08-01T10:00:00.000Z',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'prod-014',
    name: 'Maggi 2-Minute Masala Noodles (4-Pack, 280g)',
    brand: 'Nestle Maggi',
    category: 'Snacks & Biscuits',
    sku: 'MAGG-NDL-4PK',
    unit: 'packet',
    mrp: 60,
    sellingPrice: 56,
    purchasePrice: 47,
    currentStock: 40,
    minimumStock: 12,
    minStockLevel: 12,
    supplier: 'Nestle India Depot',
    regionalName: 'மேகி நூடுல்ஸ் (4 பாக்கெட்)',
    image: 'https://images.unsplash.com/photo-1612927601601-6638404737ce?w=300&auto=format&fit=crop&q=60',
    batchNumber: 'NSTL-MG-88',
    expiryDate: new Date(Date.now() + 180 * 86400000).toISOString().slice(0, 10),
    leadTimeDays: 2,
    safetyStock: 15,
    createdAt: '2026-08-01T10:00:00.000Z',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'prod-015',
    name: 'Tata Salt Iodized Crystal/Vacuum Salt (1kg)',
    brand: 'Tata Salt',
    category: 'Sugar & Salt',
    sku: 'TATA-SLT-1KG',
    unit: 'packet',
    mrp: 28,
    sellingPrice: 26,
    purchasePrice: 21,
    currentStock: 60,
    minimumStock: 15,
    minStockLevel: 15,
    supplier: 'Tata Consumer Products Ltd',
    regionalName: 'டாடா உப்பு (1 கிலோ)',
    image: 'https://images.unsplash.com/photo-1518110925495-5fe2fda0442c?w=300&auto=format&fit=crop&q=60',
    batchNumber: 'TCP-SLT-500',
    expiryDate: new Date(Date.now() + 400 * 86400000).toISOString().slice(0, 10),
    leadTimeDays: 3,
    safetyStock: 20,
    createdAt: '2026-08-01T10:00:00.000Z',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'prod-016',
    name: 'Madhur Pure Refined Sugar (1kg)',
    brand: 'Madhur',
    category: 'Sugar & Salt',
    sku: 'MDHR-SGR-1KG',
    unit: 'packet',
    mrp: 55,
    sellingPrice: 48,
    purchasePrice: 40,
    currentStock: 50,
    minimumStock: 12,
    minStockLevel: 12,
    supplier: 'Shree Renuka Sugars',
    regionalName: 'சர்க்கரை / சீனி (1 கிலோ)',
    image: 'https://images.unsplash.com/photo-1587735243615-c03f25aaff15?w=300&auto=format&fit=crop&q=60',
    batchNumber: 'SRS-SGR-11',
    expiryDate: new Date(Date.now() + 360 * 86400000).toISOString().slice(0, 10),
    leadTimeDays: 2,
    safetyStock: 15,
    createdAt: '2026-08-01T10:00:00.000Z',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'prod-017',
    name: 'Surf Excel Easy Wash Detergent Powder (1kg)',
    brand: 'Surf Excel (HUL)',
    category: 'Household & Cleaning',
    sku: 'SURF-EW-1KG',
    unit: 'packet',
    mrp: 160,
    sellingPrice: 145,
    purchasePrice: 122,
    currentStock: 20,
    minimumStock: 6,
    minStockLevel: 6,
    supplier: 'Hindustan Unilever Ltd',
    regionalName: 'சர்ஃப் எக்செல் சோப்புத்தூள் (1 கிலோ)',
    image: 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=300&auto=format&fit=crop&q=60',
    batchNumber: 'HUL-SRF-70',
    expiryDate: new Date(Date.now() + 500 * 86400000).toISOString().slice(0, 10),
    leadTimeDays: 2,
    safetyStock: 6,
    createdAt: '2026-08-01T10:00:00.000Z',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'prod-018',
    name: 'Vim Dishwash Bar with Lemon (300g)',
    brand: 'Vim (HUL)',
    category: 'Household & Cleaning',
    sku: 'VIM-BAR-300G',
    unit: 'piece',
    mrp: 27,
    sellingPrice: 25,
    purchasePrice: 20,
    currentStock: 30,
    minimumStock: 10,
    minStockLevel: 10,
    supplier: 'Hindustan Unilever Ltd',
    regionalName: 'விம் பாத்திரம் தேய்க்கும் சோப் (300 கிராம்)',
    image: 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=300&auto=format&fit=crop&q=60',
    batchNumber: 'HUL-VIM-33',
    expiryDate: new Date(Date.now() + 500 * 86400000).toISOString().slice(0, 10),
    leadTimeDays: 2,
    safetyStock: 10,
    createdAt: '2026-08-01T10:00:00.000Z',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'prod-019',
    name: 'Dettol Original Bathing Soap (125g x 3 Pack)',
    brand: 'Dettol (Reckitt)',
    category: 'Personal Care',
    sku: 'DETT-SOP-3PK',
    unit: 'packet',
    mrp: 165,
    sellingPrice: 145,
    purchasePrice: 120,
    currentStock: 3, // LOW STOCK
    minimumStock: 8,
    minStockLevel: 8,
    supplier: 'Reckitt Benckiser India',
    regionalName: 'டெட்டால் குளியல் சோப் (3 பாக்கெட்)',
    image: 'https://images.unsplash.com/photo-1607006314591-a9829b6999a0?w=300&auto=format&fit=crop&q=60',
    batchNumber: 'RB-DET-19',
    expiryDate: new Date(Date.now() + 600 * 86400000).toISOString().slice(0, 10),
    leadTimeDays: 3,
    safetyStock: 8,
    createdAt: '2026-08-01T10:00:00.000Z',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'prod-020',
    name: 'Bru Instant Coffee Powder (100g Glass Jar)',
    brand: 'Bru (HUL)',
    category: 'Beverages',
    sku: 'BRU-COF-100G',
    unit: 'bottle',
    mrp: 215,
    sellingPrice: 195,
    purchasePrice: 165,
    currentStock: 11,
    minimumStock: 4,
    minStockLevel: 4,
    supplier: 'Hindustan Unilever Ltd',
    regionalName: 'ப்ரூ இன்ஸ்டன்ட் காபி (100 கிராம்)',
    image: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=300&auto=format&fit=crop&q=60',
    batchNumber: 'HUL-BRU-12',
    expiryDate: new Date(Date.now() + 240 * 86400000).toISOString().slice(0, 10),
    leadTimeDays: 2,
    safetyStock: 4,
    createdAt: '2026-08-01T10:00:00.000Z',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'prod-021',
    name: 'Brooke Bond Red Label Strong Tea (500g)',
    brand: 'Brooke Bond (HUL)',
    category: 'Beverages',
    sku: 'BB-TEA-500G',
    unit: 'packet',
    mrp: 260,
    sellingPrice: 240,
    purchasePrice: 205,
    currentStock: 15,
    minimumStock: 5,
    minStockLevel: 5,
    supplier: 'Hindustan Unilever Ltd',
    regionalName: 'ரெட் லேபிள் டீ தூள் (500 கிராம்)',
    image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=300&auto=format&fit=crop&q=60',
    batchNumber: 'HUL-BBT-66',
    expiryDate: new Date(Date.now() + 300 * 86400000).toISOString().slice(0, 10),
    leadTimeDays: 2,
    safetyStock: 5,
    createdAt: '2026-08-01T10:00:00.000Z',
    updatedAt: new Date().toISOString()
  }
];

const defaultBills: Sale[] = [
  {
    id: 'bill-1001',
    invoiceNumber: 'INV-2026-0816-01',
    createdAt: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
    date: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
    items: [
      {
        productId: 'prod-001',
        product: defaultProducts[0],
        productName: defaultProducts[0].name,
        quantity: 2,
        unitPrice: 245,
        discount: 0,
        subtotal: 490,
        total: 490
      },
      {
        productId: 'prod-010',
        product: defaultProducts[9],
        productName: defaultProducts[9].name,
        quantity: 1,
        unitPrice: 28,
        discount: 0,
        subtotal: 28,
        total: 28
      },
      {
        productId: 'prod-011',
        product: defaultProducts[11],
        productName: defaultProducts[11].name,
        quantity: 3,
        unitPrice: 40,
        discount: 0,
        subtotal: 120,
        total: 120
      }
    ],
    subtotal: 638,
    discount: 18,
    tax: 0,
    total: 620,
    profit: 110,
    paymentMethod: 'UPI',
    customerName: 'Sample Customer 1',
    customerPhone: '0000000000',
    status: 'PAID'
  },
  {
    id: 'bill-1002',
    invoiceNumber: 'INV-2026-0816-02',
    createdAt: new Date(Date.now() - 110 * 60 * 1000).toISOString(),
    date: new Date(Date.now() - 110 * 60 * 1000).toISOString(),
    items: [
      {
        productId: 'prod-005',
        product: defaultProducts[4],
        productName: defaultProducts[4].name,
        quantity: 2,
        unitPrice: 135,
        discount: 0,
        subtotal: 270,
        total: 270
      },
      {
        productId: 'prod-014',
        product: defaultProducts[13],
        productName: defaultProducts[13].name,
        quantity: 4,
        unitPrice: 56,
        discount: 0,
        subtotal: 224,
        total: 224
      }
    ],
    subtotal: 494,
    discount: 4,
    tax: 0,
    total: 490,
    profit: 78,
    paymentMethod: 'CASH',
    customerName: 'Sample Customer 2',
    status: 'PAID'
  }
];

class RealtimeStoreEngine {
  private products: Product[] = [...defaultProducts];
  private bills: Sale[] = [...defaultBills];
  private isInitialized = false;
  private isConnectedToFirestore = false;
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.initRealtimeFirestore();
  }

  private async initRealtimeFirestore() {
    if (!db) {
      console.info('[RealtimeStore] Operating in resilient local state.');
      this.notifyListeners();
      return;
    }

    try {
      // 1. Subscribe to Products
      const productsRef = collection(db, 'products');
      onSnapshot(productsRef, async (snapshot) => {
        if (snapshot.empty && !this.isInitialized) {
          console.info('[RealtimeStore] Seeding default products to Firestore...');
          try {
            const batch = writeBatch(db!);
            for (const prod of defaultProducts) {
              const docRef = doc(db!, 'products', prod.id);
              batch.set(docRef, prod);
            }
            await batch.commit();
          } catch (seedErr) {
            console.warn('[RealtimeStore] Seeding skipped (offline/rules):', seedErr);
          }
        } else if (!snapshot.empty) {
          const loadedProducts: Product[] = [];
          snapshot.forEach((docSnap) => {
            loadedProducts.push({ ...(docSnap.data() as Product), id: docSnap.id });
          });
          this.products = loadedProducts;
          this.isConnectedToFirestore = true;
          this.notifyListeners();
        }
      }, (err) => {
        console.warn('[RealtimeStore] Products snapshot listener note:', err);
      });

      // 2. Subscribe to Sales (Bills)
      const salesRef = collection(db, 'sales');
      onSnapshot(salesRef, async (snapshot) => {
        if (snapshot.empty && !this.isInitialized) {
          try {
            const batch = writeBatch(db!);
            for (const bill of defaultBills) {
              const docRef = doc(db!, 'sales', bill.id);
              batch.set(docRef, bill);
            }
            await batch.commit();
          } catch (seedErr) {
            console.warn('[RealtimeStore] Sales seeding skipped:', seedErr);
          }
        } else if (!snapshot.empty) {
          const loadedSales: Sale[] = [];
          snapshot.forEach((docSnap) => {
            loadedSales.push({ ...(docSnap.data() as Sale), id: docSnap.id });
          });
          // Sort newest first
          loadedSales.sort((a, b) => new Date(b.createdAt || b.date || 0).getTime() - new Date(a.createdAt || a.date || 0).getTime());
          this.bills = loadedSales;
          this.isConnectedToFirestore = true;
          this.notifyListeners();
        }
      }, (err) => {
        console.warn('[RealtimeStore] Sales snapshot listener note:', err);
      });

      this.isInitialized = true;
    } catch (e) {
      console.warn('[RealtimeStore] Initializing fallback:', e);
    }
  }

  public subscribe(callback: () => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  private notifyListeners() {
    this.listeners.forEach((fn) => {
      try {
        fn();
      } catch (err) {
        console.error('[RealtimeStore] Listener error:', err);
      }
    });
  }

  public getProducts(): Product[] {
    return this.products;
  }

  public getBills(): Sale[] {
    return this.bills;
  }

  public getIsFirestoreConnected(): boolean {
    return this.isConnectedToFirestore;
  }

  public getDashboardMetrics(): DashboardMetrics {
    const todaySales = getTodaysSales(this.bills);
    const todayBills = getTodaysBillCount(this.bills);
    const lowStock = getLowStockProducts(this.products);
    const inv = getInventoryValue(this.products);
    const totalProfitObj = calculateTotalProfit(this.bills);
    const outOfStock = this.products.filter((p) => p.currentStock === 0);

    return {
      todayRevenue: todaySales,
      todayBillsCount: todayBills,
      todayProfit: Math.round(todaySales * (totalProfitObj.overallMarginPercent / 100)),
      totalProductsCount: this.products.length,
      lowStockCount: lowStock.length,
      outOfStockCount: outOfStock.length,
      totalInventoryCostValue: inv.costValue,
      totalInventoryRetailValue: inv.retailValue,
      topSellingProducts: [],
      recentSales: getRecentTransactions(this.bills, 10),
      lowStockProducts: lowStock,
      salesTrend: []
    };
  }

  public async createSale(saleData: {
    items: CartItem[];
    subtotal: number;
    discount: number;
    tax?: number;
    total: number;
    profit?: number;
    paymentMethod: any;
    customerName?: string;
    customerPhone?: string;
    notes?: string;
    status: 'PAID' | 'CREDIT';
  }): Promise<Sale> {
    const invoiceNum = `INV-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${(this.bills.length + 1)
      .toString()
      .padStart(2, '0')}`;

    const newSaleId = `bill-${Date.now()}`;
    const nowIso = new Date().toISOString();

    const populatedItems = saleData.items.map((item) => {
      const prod = this.products.find((p) => p.id === item.productId) || item.product;
      const unitPrice = item.unitPrice || prod?.sellingPrice || 0;
      const discount = item.discount || 0;
      const total = item.quantity * unitPrice - discount;

      return {
        productId: item.productId,
        product: prod,
        productName: prod?.name || item.productName || 'Product',
        quantity: item.quantity,
        unitPrice,
        discount,
        subtotal: total,
        total
      };
    });

    const newSale: Sale = {
      id: newSaleId,
      invoiceNumber: invoiceNum,
      createdAt: nowIso,
      date: nowIso,
      items: populatedItems,
      subtotal: saleData.subtotal,
      discount: saleData.discount,
      tax: saleData.tax || 0,
      total: saleData.total,
      profit: saleData.profit || Math.round(saleData.total * 0.18),
      paymentMethod: saleData.paymentMethod,
      customerName: saleData.customerName,
      customerPhone: saleData.customerPhone,
      notes: saleData.notes,
      status: saleData.status
    };

    // Update in-memory state immediately for zero-lag UI
    this.bills = [newSale, ...this.bills];

    // Decrement stock for purchased items
    saleData.items.forEach((item) => {
      const idx = this.products.findIndex((p) => p.id === item.productId);
      if (idx !== -1) {
        const updatedStock = Math.max(0, this.products[idx].currentStock - item.quantity);
        this.products[idx] = {
          ...this.products[idx],
          currentStock: updatedStock,
          updatedAt: nowIso
        };
      }
    });

    this.notifyListeners();

    // Persist asynchronously to Firestore
    if (db) {
      try {
        const saleDocRef = doc(db, 'sales', newSaleId);
        await setDoc(saleDocRef, newSale);

        // Update product documents in Firestore
        for (const item of saleData.items) {
          const prod = this.products.find((p) => p.id === item.productId);
          if (prod) {
            const prodDocRef = doc(db, 'products', prod.id);
            await setDoc(prodDocRef, prod, { merge: true });
          }
        }
      } catch (err) {
        console.warn('[RealtimeStore] Firestore sync note (local fallback preserved):', err);
      }
    }

    // Also notify server endpoint
    try {
      fetch('/api/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSale)
      }).catch(() => {});
    } catch {}

    return newSale;
  }

  public async addProduct(product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> {
    const id = `prod-${Date.now()}`;
    const nowIso = new Date().toISOString();
    const newProduct: Product = {
      ...product,
      id,
      minimumStock: product.minimumStock ?? product.minStockLevel ?? 5,
      minStockLevel: product.minimumStock ?? product.minStockLevel ?? 5,
      createdAt: nowIso,
      updatedAt: nowIso
    };

    this.products = [newProduct, ...this.products];
    this.notifyListeners();

    if (db) {
      try {
        await setDoc(doc(db, 'products', id), newProduct);
      } catch (err) {
        console.warn('[RealtimeStore] Firestore product write note:', err);
      }
    }

    try {
      fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProduct)
      }).catch(() => {});
    } catch {}

    return newProduct;
  }

  public async updateProduct(id: string, updates: Partial<Product>): Promise<Product | null> {
    const idx = this.products.findIndex((p) => p.id === id);
    if (idx === -1) return null;

    const nowIso = new Date().toISOString();
    const updated = {
      ...this.products[idx],
      ...updates,
      updatedAt: nowIso
    };

    this.products[idx] = updated;
    this.notifyListeners();

    if (db) {
      try {
        await updateDoc(doc(db, 'products', id), updates as any);
      } catch (err) {
        console.warn('[RealtimeStore] Firestore product update note:', err);
      }
    }

    try {
      fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      }).catch(() => {});
    } catch {}

    return updated;
  }

  public async deleteProduct(id: string): Promise<boolean> {
    this.products = this.products.filter((p) => p.id !== id);
    this.notifyListeners();

    if (db) {
      try {
        await deleteDoc(doc(db, 'products', id));
      } catch (err) {
        console.warn('[RealtimeStore] Firestore product delete note:', err);
      }
    }

    try {
      fetch(`/api/products/${id}`, { method: 'DELETE' }).catch(() => {});
    } catch {}

    return true;
  }

  public async restockProduct(entry: RestockEntry): Promise<Product | null> {
    const idx = this.products.findIndex((p) => p.id === entry.productId);
    if (idx === -1) return null;

    const newStock = this.products[idx].currentStock + entry.quantity;
    const updated = {
      ...this.products[idx],
      currentStock: newStock,
      purchasePrice: entry.purchasePrice || this.products[idx].purchasePrice,
      supplier: entry.supplier || this.products[idx].supplier,
      updatedAt: new Date().toISOString()
    };

    this.products[idx] = updated;
    this.notifyListeners();

    if (db) {
      try {
        await updateDoc(doc(db, 'products', entry.productId), {
          currentStock: newStock,
          purchasePrice: updated.purchasePrice,
          supplier: updated.supplier,
          updatedAt: updated.updatedAt
        });
      } catch (err) {
        console.warn('[RealtimeStore] Restock Firestore sync note:', err);
      }
    }

    try {
      fetch('/api/inventory/restock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry)
      }).catch(() => {});
    } catch {}

    return updated;
  }

  public async adjustStock(entry: StockAdjustmentEntry): Promise<Product | null> {
    const idx = this.products.findIndex((p) => p.id === entry.productId);
    if (idx === -1) return null;

    let newStock = this.products[idx].currentStock;
    if (entry.adjustmentType === 'SET_STOCK') {
      newStock = Math.max(0, entry.quantity);
    } else if (entry.adjustmentType === 'ADD_STOCK') {
      newStock = this.products[idx].currentStock + entry.quantity;
    } else if (entry.adjustmentType === 'REMOVE_STOCK') {
      newStock = Math.max(0, this.products[idx].currentStock - entry.quantity);
    }

    const updated = {
      ...this.products[idx],
      currentStock: newStock,
      updatedAt: new Date().toISOString()
    };

    this.products[idx] = updated;
    this.notifyListeners();

    if (db) {
      try {
        await updateDoc(doc(db, 'products', entry.productId), {
          currentStock: newStock,
          updatedAt: updated.updatedAt
        });
      } catch (err) {
        console.warn('[RealtimeStore] Adjust stock Firestore sync note:', err);
      }
    }

    try {
      fetch('/api/inventory/adjust', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry)
      }).catch(() => {});
    } catch {}

    return updated;
  }
}

export const realtimeStore = new RealtimeStoreEngine();
