import {
  Product,
  Sale,
  Bill,
  StockMovement,
  RestockEntry,
  StockAdjustmentEntry,
  DashboardMetrics,
  AnalyticsData,
  ProductCategory,
  StockoutPrediction,
  ProfitAnalysis,
  ExpiryItem,
  ExpiryRiskReport,
  ReorderRecommendation,
  SupplierPurchaseList,
  SalesAnomaly,
  CommandCenterData
} from '../../src/types/index';

const now = new Date();
const nowISO = now.toISOString();

// Helper to format ISO date plus/minus days
const addDaysISO = (days: number) => {
  const d = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
  return d.toISOString().slice(0, 10);
};

// Realistic grocery products with Kirana metadata (expiry, batch, supplier, lead time)
let products: Product[] = [
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
    expiryDate: addDaysISO(120),
    leadTimeDays: 2,
    safetyStock: 6,
    createdAt: '2026-08-01T10:00:00.000Z',
    updatedAt: nowISO
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
    expiryDate: addDaysISO(90),
    leadTimeDays: 2,
    safetyStock: 4,
    createdAt: '2026-08-01T10:00:00.000Z',
    updatedAt: nowISO
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
    expiryDate: addDaysISO(180),
    leadTimeDays: 3,
    safetyStock: 8,
    createdAt: '2026-08-01T10:00:00.000Z',
    updatedAt: nowISO
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
    expiryDate: addDaysISO(150),
    leadTimeDays: 1,
    safetyStock: 8,
    createdAt: '2026-08-01T10:00:00.000Z',
    updatedAt: nowISO
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
    expiryDate: addDaysISO(180),
    leadTimeDays: 2,
    safetyStock: 12,
    createdAt: '2026-08-01T10:00:00.000Z',
    updatedAt: nowISO
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
    expiryDate: addDaysISO(240),
    leadTimeDays: 3,
    safetyStock: 4,
    createdAt: '2026-08-01T10:00:00.000Z',
    updatedAt: nowISO
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
    expiryDate: addDaysISO(210),
    leadTimeDays: 3,
    safetyStock: 4,
    createdAt: '2026-08-01T10:00:00.000Z',
    updatedAt: nowISO
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
    expiryDate: addDaysISO(365),
    leadTimeDays: 2,
    safetyStock: 5,
    createdAt: '2026-08-01T10:00:00.000Z',
    updatedAt: nowISO
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
    expiryDate: addDaysISO(300),
    leadTimeDays: 4,
    safetyStock: 6,
    createdAt: '2026-08-01T10:00:00.000Z',
    updatedAt: nowISO
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
    expiryDate: addDaysISO(1), // CRITICAL EXPIRY (1 day)
    leadTimeDays: 1,
    safetyStock: 20,
    createdAt: '2026-08-01T10:00:00.000Z',
    updatedAt: nowISO
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
    expiryDate: addDaysISO(2), // CRITICAL EXPIRY (2 days)
    leadTimeDays: 1,
    safetyStock: 4,
    createdAt: '2026-08-01T10:00:00.000Z',
    updatedAt: nowISO
  },
  {
    id: 'prod-010c',
    name: 'Mother Dairy Classic Dahi / Curd (400g Pouch)',
    brand: 'Mother Dairy',
    category: 'Dairy',
    sku: 'MD-DAHI-400G',
    unit: 'pouch',
    mrp: 40,
    sellingPrice: 38,
    purchasePrice: 31,
    currentStock: 12,
    minimumStock: 5,
    minStockLevel: 5,
    supplier: 'Tamil Nadu Dairy Development',
    regionalName: 'மதர் டெய்ரி தயிர் (400 கிராம்)',
    image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=300&auto=format&fit=crop&q=60',
    batchNumber: 'MD-CURD-52',
    expiryDate: addDaysISO(4), // WARNING EXPIRY (4 days)
    leadTimeDays: 1,
    safetyStock: 6,
    createdAt: '2026-08-01T10:00:00.000Z',
    updatedAt: nowISO
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
    expiryDate: addDaysISO(120),
    leadTimeDays: 2,
    safetyStock: 10,
    createdAt: '2026-08-01T10:00:00.000Z',
    updatedAt: nowISO
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
    expiryDate: addDaysISO(60),
    leadTimeDays: 2,
    safetyStock: 6,
    createdAt: '2026-08-01T10:00:00.000Z',
    updatedAt: nowISO
  },
  {
    id: 'prod-013',
    name: 'Parle-G Gold Original Glucose Biscuit (1kg)',
    brand: 'Parle',
    category: 'Snacks & Biscuits',
    sku: 'PARL-G-1KG',
    unit: 'packet',
    mrp: 130,
    sellingPrice: 115,
    purchasePrice: 96,
    currentStock: 22,
    minimumStock: 8,
    minStockLevel: 8,
    supplier: 'Parle Products Agency',
    regionalName: 'பார்லே-ஜி பிஸ்கட் (1 கிலோ)',
    image: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=300&auto=format&fit=crop&q=60',
    batchNumber: 'PAR-GLD-10',
    expiryDate: addDaysISO(150),
    leadTimeDays: 2,
    safetyStock: 8,
    createdAt: '2026-08-01T10:00:00.000Z',
    updatedAt: nowISO
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
    expiryDate: addDaysISO(180),
    leadTimeDays: 2,
    safetyStock: 15,
    createdAt: '2026-08-01T10:00:00.000Z',
    updatedAt: nowISO
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
    expiryDate: addDaysISO(400),
    leadTimeDays: 3,
    safetyStock: 20,
    createdAt: '2026-08-01T10:00:00.000Z',
    updatedAt: nowISO
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
    expiryDate: addDaysISO(360),
    leadTimeDays: 2,
    safetyStock: 15,
    createdAt: '2026-08-01T10:00:00.000Z',
    updatedAt: nowISO
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
    expiryDate: addDaysISO(500),
    leadTimeDays: 2,
    safetyStock: 6,
    createdAt: '2026-08-01T10:00:00.000Z',
    updatedAt: nowISO
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
    expiryDate: addDaysISO(500),
    leadTimeDays: 2,
    safetyStock: 10,
    createdAt: '2026-08-01T10:00:00.000Z',
    updatedAt: nowISO
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
    expiryDate: addDaysISO(600),
    leadTimeDays: 3,
    safetyStock: 8,
    createdAt: '2026-08-01T10:00:00.000Z',
    updatedAt: nowISO
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
    expiryDate: addDaysISO(240),
    leadTimeDays: 2,
    safetyStock: 4,
    createdAt: '2026-08-01T10:00:00.000Z',
    updatedAt: nowISO
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
    expiryDate: addDaysISO(300),
    leadTimeDays: 2,
    safetyStock: 5,
    createdAt: '2026-08-01T10:00:00.000Z',
    updatedAt: nowISO
  }
];

// Initial realistic bills/sales
let bills: Sale[] = [
  {
    id: 'bill-1001',
    invoiceNumber: 'INV-2026-0816-01',
    createdAt: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
    date: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
    items: [
      {
        productId: 'prod-001',
        product: products[0],
        productName: products[0].name,
        quantity: 2,
        unitPrice: 245,
        discount: 0,
        subtotal: 490,
        total: 490
      },
      {
        productId: 'prod-010',
        product: products[9],
        productName: products[9].name,
        quantity: 1,
        unitPrice: 28,
        discount: 0,
        subtotal: 28,
        total: 28
      },
      {
        productId: 'prod-011',
        product: products[12],
        productName: products[12].name,
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
        product: products[4],
        productName: products[4].name,
        quantity: 2,
        unitPrice: 135,
        discount: 0,
        subtotal: 270,
        total: 270
      },
      {
        productId: 'prod-014',
        product: products[15],
        productName: products[15].name,
        quantity: 4,
        unitPrice: 56,
        discount: 0,
        subtotal: 224,
        total: 224
      },
      {
        productId: 'prod-015',
        product: products[16],
        productName: products[16].name,
        quantity: 2,
        unitPrice: 26,
        discount: 0,
        subtotal: 52,
        total: 52
      }
    ],
    subtotal: 546,
    discount: 6,
    tax: 0,
    total: 540,
    profit: 98,
    paymentMethod: 'CASH',
    customerName: 'Sample Customer 2',
    customerPhone: '0000000000',
    status: 'PAID'
  },
  {
    id: 'bill-1003',
    invoiceNumber: 'INV-2026-0816-03',
    createdAt: new Date(Date.now() - 210 * 60 * 1000).toISOString(),
    date: new Date(Date.now() - 210 * 60 * 1000).toISOString(),
    items: [
      {
        productId: 'prod-008',
        product: products[7],
        productName: products[7].name,
        quantity: 1,
        unitPrice: 580,
        discount: 0,
        subtotal: 580,
        total: 580
      },
      {
        productId: 'prod-003',
        product: products[2],
        productName: products[2].name,
        quantity: 2,
        unitPrice: 175,
        discount: 0,
        subtotal: 350,
        total: 350
      },
      {
        productId: 'prod-017',
        product: products[18],
        productName: products[18].name,
        quantity: 1,
        unitPrice: 145,
        discount: 0,
        subtotal: 145,
        total: 145
      }
    ],
    subtotal: 1075,
    discount: 25,
    tax: 0,
    total: 1050,
    profit: 185,
    paymentMethod: 'UPI',
    customerName: 'Sample Customer 3',
    customerPhone: '0000000000',
    status: 'PAID'
  },
  {
    id: 'bill-1004',
    invoiceNumber: 'INV-2026-0816-04',
    createdAt: new Date(Date.now() - 340 * 60 * 1000).toISOString(),
    date: new Date(Date.now() - 340 * 60 * 1000).toISOString(),
    items: [
      {
        productId: 'prod-001',
        product: products[0],
        productName: products[0].name,
        quantity: 1,
        unitPrice: 245,
        discount: 0,
        subtotal: 245,
        total: 245
      },
      {
        productId: 'prod-005',
        product: products[4],
        productName: products[4].name,
        quantity: 1,
        unitPrice: 135,
        discount: 0,
        subtotal: 135,
        total: 135
      }
    ],
    subtotal: 380,
    discount: 0,
    tax: 0,
    total: 380,
    profit: 50,
    paymentMethod: 'UPI',
    customerName: 'Sample Customer 4',
    status: 'PAID'
  }
];

// Initial stock movements log
let stockMovements: StockMovement[] = [
  {
    id: 'mov-1',
    date: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
    productId: 'prod-001',
    productName: 'Aashirvaad Superior MP Atta (5kg)',
    type: 'SALE',
    quantityChange: -2,
    remainingStock: 18,
    referenceId: 'INV-2026-0816-01',
    reason: 'Store Sale Checkout'
  },
  {
    id: 'mov-2',
    date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    productId: 'prod-005',
    productName: 'Fortune Sunlite Refined Sunflower Cooking Oil (1L)',
    type: 'RESTOCK',
    quantityChange: 20,
    remainingStock: 32,
    referenceId: 'PO-7821',
    reason: 'Adani Wilmar Delivery'
  }
];

export const StoreDb = {
  // Products
  getProducts(): Product[] {
    return [...products];
  },

  getProductById(id: string): Product | undefined {
    return products.find((p) => p.id === id);
  },

  addProduct(productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Product {
    const newId = `prod-${Date.now().toString().slice(-4)}`;
    const minStock = productData.minimumStock ?? productData.minStockLevel ?? 5;
    const newProduct: Product = {
      ...productData,
      id: newId,
      minimumStock: minStock,
      minStockLevel: minStock,
      safetyStock: productData.safetyStock ?? minStock,
      leadTimeDays: productData.leadTimeDays ?? 2,
      expiryDate: productData.expiryDate || addDaysISO(180),
      batchNumber: productData.batchNumber || `BATCH-${Math.floor(100 + Math.random() * 900)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    products.unshift(newProduct);
    return newProduct;
  },

  updateProduct(id: string, updates: Partial<Product>): Product | null {
    const idx = products.findIndex((p) => p.id === id);
    if (idx === -1) return null;
    const updatedMin = updates.minimumStock ?? updates.minStockLevel ?? products[idx].minimumStock;
    products[idx] = {
      ...products[idx],
      ...updates,
      minimumStock: updatedMin,
      minStockLevel: updatedMin,
      updatedAt: new Date().toISOString()
    };
    return products[idx];
  },

  deleteProduct(id: string): boolean {
    const initialLen = products.length;
    products = products.filter((p) => p.id !== id);
    return products.length < initialLen;
  },

  // Sales / Billing
  getBills(): Sale[] {
    return [...bills];
  },

  createBill(billData: {
    items: { productId: string; quantity: number; unitPrice: number; discount?: number }[];
    subtotal?: number;
    discount?: number;
    paymentMethod: any;
    customerName?: string;
    customerPhone?: string;
    notes?: string;
  }): Sale {
    const invoiceNum = `INV-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${(bills.length + 1)
      .toString()
      .padStart(2, '0')}`;

    let calcSubtotal = 0;
    let totalCost = 0;

    const populatedItems = billData.items.map((item) => {
      const product = products.find((p) => p.id === item.productId);
      if (!product) {
        throw new Error(`Product not found: ${item.productId}`);
      }

      // Check stock availability
      if (product.currentStock < item.quantity) {
        console.warn(`Stock low for ${product.name}, remaining: ${product.currentStock}`);
      }

      // Reduce inventory
      product.currentStock = Math.max(0, product.currentStock - item.quantity);
      product.updatedAt = new Date().toISOString();

      const lineTotal = item.quantity * item.unitPrice - (item.discount || 0);
      calcSubtotal += lineTotal;
      totalCost += item.quantity * product.purchasePrice;

      // Log stock movement
      stockMovements.unshift({
        id: `mov-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
        date: new Date().toISOString(),
        productId: product.id,
        productName: product.name,
        type: 'SALE',
        quantityChange: -item.quantity,
        remainingStock: product.currentStock,
        referenceId: invoiceNum,
        reason: `Sold via ${billData.paymentMethod} bill`
      });

      return {
        productId: item.productId,
        product,
        productName: product.name,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discount: item.discount || 0,
        subtotal: lineTotal,
        total: lineTotal
      };
    });

    const finalSubtotal = billData.subtotal !== undefined ? billData.subtotal : calcSubtotal;
    const finalDiscount = billData.discount || 0;
    const finalTotal = Math.max(0, finalSubtotal - finalDiscount);
    const finalProfit = Math.max(0, finalTotal - totalCost);

    const newSale: Sale = {
      id: `bill-${Date.now()}`,
      invoiceNumber: invoiceNum,
      createdAt: new Date().toISOString(),
      date: new Date().toISOString(),
      items: populatedItems,
      subtotal: finalSubtotal,
      discount: finalDiscount,
      tax: 0,
      total: finalTotal,
      profit: finalProfit,
      paymentMethod: billData.paymentMethod || 'UPI',
      customerName: billData.customerName,
      customerPhone: billData.customerPhone,
      notes: billData.notes,
      status: 'PAID'
    };

    bills.unshift(newSale);
    return newSale;
  },

  // Inventory Management
  restockProduct(entry: RestockEntry): { product: Product; movement: StockMovement } | null {
    const product = products.find((p) => p.id === entry.productId);
    if (!product) return null;

    product.currentStock += Number(entry.quantity);
    if (entry.purchasePrice) {
      product.purchasePrice = Number(entry.purchasePrice);
    }
    if (entry.supplier) {
      product.supplier = entry.supplier;
    }
    if (entry.batchNumber) {
      product.batchNumber = entry.batchNumber;
    }
    if (entry.expiryDate) {
      product.expiryDate = entry.expiryDate;
    }
    product.updatedAt = new Date().toISOString();

    const movement: StockMovement = {
      id: `mov-${Date.now()}`,
      date: new Date().toISOString(),
      productId: product.id,
      productName: product.name,
      type: 'RESTOCK',
      quantityChange: Number(entry.quantity),
      remainingStock: product.currentStock,
      referenceId: entry.invoiceNumber || `PO-${Date.now().toString().slice(-4)}`,
      reason: entry.notes || `Restocked from ${product.supplier}`
    };

    stockMovements.unshift(movement);
    return { product, movement };
  },

  adjustStock(entry: StockAdjustmentEntry): { product: Product; movement: StockMovement } | null {
    const product = products.find((p) => p.id === entry.productId);
    if (!product) return null;

    let qtyChange = 0;
    if (entry.adjustmentType === 'SET_STOCK') {
      qtyChange = Number(entry.quantity) - product.currentStock;
      product.currentStock = Math.max(0, Number(entry.quantity));
    } else if (entry.adjustmentType === 'ADD_STOCK') {
      qtyChange = Number(entry.quantity);
      product.currentStock += qtyChange;
    } else if (entry.adjustmentType === 'REMOVE_STOCK') {
      qtyChange = -Number(entry.quantity);
      product.currentStock = Math.max(0, product.currentStock - Number(entry.quantity));
    }
    product.updatedAt = new Date().toISOString();

    const movement: StockMovement = {
      id: `mov-${Date.now()}`,
      date: new Date().toISOString(),
      productId: product.id,
      productName: product.name,
      type: entry.reason === 'DAMAGE' ? 'DAMAGE' : 'ADJUSTMENT',
      quantityChange: qtyChange,
      remainingStock: product.currentStock,
      reason: `${entry.reason}: ${entry.notes || 'Manual stock adjustment'}`
    };

    stockMovements.unshift(movement);
    return { product, movement };
  },

  getStockMovements(): StockMovement[] {
    return [...stockMovements];
  },

  // Dynamic Dashboard Metrics
  getDashboardMetrics(): DashboardMetrics {
    const today = new Date().toISOString().slice(0, 10);
    const todayBills = bills.filter((b) => (b.createdAt || b.date || '').startsWith(today));

    const todayRevenue = todayBills.reduce((acc, b) => acc + b.total, 0);
    const todayBillsCount = todayBills.length;
    const todayProfit = todayBills.reduce((acc, b) => acc + (b.profit || 0), 0);

    const totalProductsCount = products.length;
    const lowStockProducts = products.filter((p) => p.currentStock <= (p.minimumStock ?? p.minStockLevel ?? 5));
    const outOfStockCount = products.filter((p) => p.currentStock === 0).length;

    const totalInventoryCostValue = products.reduce((acc, p) => acc + p.currentStock * p.purchasePrice, 0);
    const totalInventoryRetailValue = products.reduce((acc, p) => acc + p.currentStock * p.sellingPrice, 0);

    // Calculate top-selling products
    const productSalesMap = new Map<string, { quantity: number; revenue: number; name: string; brand: string }>();
    bills.forEach((b) => {
      b.items.forEach((item) => {
        const existing = productSalesMap.get(item.productId) || {
          quantity: 0,
          revenue: 0,
          name: item.productName || item.product?.name || 'Product',
          brand: item.product?.brand || ''
        };
        existing.quantity += item.quantity;
        existing.revenue += item.total;
        productSalesMap.set(item.productId, existing);
      });
    });

    const topSellingProducts = Array.from(productSalesMap.entries())
      .map(([productId, val]) => ({
        productId,
        productName: val.name,
        brand: val.brand,
        quantitySold: val.quantity,
        revenue: val.revenue
      }))
      .sort((a, b) => b.quantitySold - a.quantitySold)
      .slice(0, 5);

    // 7-day sales trend
    const salesTrend: { date: string; revenue: number; billsCount: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      const dateStr = d.toISOString().slice(0, 10);
      const dayBills = bills.filter((b) => (b.createdAt || b.date || '').startsWith(dateStr));
      const dayRev = dayBills.reduce((acc, b) => acc + b.total, 0);
      const label = d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric' });
      salesTrend.push({
        date: label,
        revenue: dayRev || (i === 0 ? todayRevenue : Math.round(1800 + (Math.sin(i) * 500 + 400))),
        billsCount: dayBills.length || (i === 0 ? todayBillsCount : Math.max(1, Math.round(4 + i)))
      });
    }

    return {
      todayRevenue,
      todayBillsCount,
      todayProfit,
      totalProductsCount,
      lowStockCount: lowStockProducts.length,
      outOfStockCount,
      totalInventoryCostValue,
      totalInventoryRetailValue,
      topSellingProducts,
      recentSales: bills.slice(0, 10),
      lowStockProducts,
      salesTrend
    };
  },

  // Dynamic Analytics Data
  getAnalytics(): AnalyticsData {
    const totalRevenue = bills.reduce((acc, b) => acc + b.total, 0);
    const grossProfit = bills.reduce((acc, b) => acc + (b.profit || b.total * 0.18), 0);
    const totalTransactions = bills.length;
    const profitMarginPercent = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 18.5;
    const averageBillValue = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;
    const totalUnitsSold = bills.reduce((acc, b) => acc + b.items.reduce((s, i) => s + i.quantity, 0), 0);

    // Daily revenue for last 7 days
    const dailyRevenue = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      const dateStr = d.toISOString().slice(0, 10);
      const dayBills = bills.filter((b) => (b.createdAt || b.date || '').startsWith(dateStr));
      const dayRev = dayBills.reduce((acc, b) => acc + b.total, 0);
      const dayProf = dayBills.reduce((acc, b) => acc + (b.profit || 0), 0);
      dailyRevenue.push({
        date: dateStr,
        label: d.toLocaleDateString('en-IN', { weekday: 'short' }),
        revenue: dayRev || Math.round(1800 + Math.sin(i * 1.5) * 400),
        profit: dayProf || Math.round(340 + Math.sin(i * 1.5) * 80),
        bills: dayBills.length || Math.max(1, Math.round(5 + i))
      });
    }

    // Category performance
    const catMap = new Map<ProductCategory, { revenue: number; itemsSold: number }>();
    bills.forEach((b) => {
      b.items.forEach((item) => {
        const cat = (item.product?.category || 'Rice & Grains') as ProductCategory;
        const current = catMap.get(cat) || { revenue: 0, itemsSold: 0 };
        current.revenue += item.total;
        current.itemsSold += item.quantity;
        catMap.set(cat, current);
      });
    });

    const categoryPerformance = Array.from(catMap.entries()).map(([category, val]) => ({
      category,
      revenue: val.revenue,
      itemsSold: val.itemsSold,
      percentage: totalRevenue > 0 ? Number(((val.revenue / totalRevenue) * 100).toFixed(1)) : 0
    }));

    // Payment method split
    const payMap = new Map<string, { count: number; totalAmount: number }>();
    bills.forEach((b) => {
      const m = b.paymentMethod || 'UPI';
      const cur = payMap.get(m) || { count: 0, totalAmount: 0 };
      cur.count += 1;
      cur.totalAmount += b.total;
      payMap.set(m, cur);
    });

    const paymentMethodSplit = Array.from(payMap.entries()).map(([method, val]) => ({
      method: method as any,
      count: val.count,
      totalAmount: val.totalAmount,
      percentage: totalRevenue > 0 ? Number(((val.totalAmount / totalRevenue) * 100).toFixed(1)) : 0
    }));

    return {
      totalRevenue,
      grossProfit,
      profitMarginPercent,
      averageBillValue,
      totalTransactions,
      totalUnitsSold,
      dailyRevenue,
      weeklyRevenue: [
        { week: 'Week 1', revenue: Math.round(totalRevenue * 0.22), bills: Math.round(totalTransactions * 0.22) },
        { week: 'Week 2', revenue: Math.round(totalRevenue * 0.26), bills: Math.round(totalTransactions * 0.25) },
        { week: 'Week 3', revenue: Math.round(totalRevenue * 0.24), bills: Math.round(totalTransactions * 0.24) },
        { week: 'Current Week', revenue: Math.round(totalRevenue * 0.28), bills: Math.round(totalTransactions * 0.29) }
      ],
      monthlyRevenue: [
        { month: 'Jun', revenue: Math.round(totalRevenue * 0.85), bills: Math.round(totalTransactions * 0.85) },
        { month: 'Jul', revenue: Math.round(totalRevenue * 0.92), bills: Math.round(totalTransactions * 0.9) },
        { month: 'Aug (Current)', revenue: totalRevenue, bills: totalTransactions }
      ],
      categoryPerformance,
      topSellingProducts: products.slice(0, 5).map((p) => ({
        productId: p.id,
        name: p.name,
        category: p.category,
        unitsSold: 25 + Math.round(Math.random() * 20),
        revenue: p.sellingPrice * (25 + Math.round(Math.random() * 20)),
        turnoverDays: 3 + Math.round(Math.random() * 4)
      })),
      slowMovingProducts: products
        .filter((p) => p.currentStock > (p.minimumStock ?? 5) * 2)
        .slice(0, 4)
        .map((p) => ({
          productId: p.id,
          name: p.name,
          category: p.category,
          currentStock: p.currentStock,
          stockValue: p.currentStock * p.purchasePrice,
          daysInStock: 28 + Math.round(Math.random() * 20)
        })),
      paymentMethodSplit,
      hourlyTraffic: [
        { hour: '8 AM', billsCount: 3, revenue: 540 },
        { hour: '10 AM', billsCount: 8, revenue: 1650 },
        { hour: '12 PM', billsCount: 6, revenue: 1100 },
        { hour: '2 PM', billsCount: 4, revenue: 780 },
        { hour: '4 PM', billsCount: 7, revenue: 1420 },
        { hour: '6 PM', billsCount: 14, revenue: 3200 },
        { hour: '8 PM', billsCount: 12, revenue: 2600 }
      ]
    };
  }
};
