import React, { useState, useMemo } from 'react';
import { Product, ProductCategory, UnitType } from '../../types/index';
import { api } from '../../services/api';
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  Package,
  X,
  AlertTriangle,
  RefreshCw,
  SlidersHorizontal
} from 'lucide-react';

interface ProductsViewProps {
  products: Product[];
  onProductsUpdated: () => void;
  isAddModalOpenInitially?: boolean;
  onCloseAddModalInitially?: () => void;
}

const CATEGORIES: ProductCategory[] = [
  'Atta & Flours',
  'Dal & Pulses',
  'Oils & Ghee',
  'Rice & Grains',
  'Dairy',
  'Snacks & Biscuits',
  'Spices & Masala',
  'Personal Care',
  'Household & Cleaning',
  'Beverages',
  'Sugar & Salt'
];

const UNITS: UnitType[] = ['kg', 'g', 'L', 'ml', 'packet', 'piece', 'pouch', 'bottle', 'box'];

export const ProductsView: React.FC<ProductsViewProps> = ({
  products,
  onProductsUpdated,
  isAddModalOpenInitially = false,
  onCloseAddModalInitially
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [stockFilter, setStockFilter] = useState<'All' | 'LowStock' | 'OutOfStock'>('All');
  const [sortBy, setSortBy] = useState<'name' | 'stockAsc' | 'priceDesc' | 'priceAsc'>('name');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(isAddModalOpenInitially);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  // Form fields
  const [formData, setFormData] = useState<Omit<Product, 'id'>>({
    name: '',
    regionalName: '',
    category: 'Atta & Flours',
    brand: '',
    sku: '',
    sellingPrice: 0,
    mrp: 0,
    purchasePrice: 0,
    currentStock: 10,
    minStockLevel: 5,
    unit: 'packet',
    supplier: '',
    image: ''
  });

  const openAddModal = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      regionalName: '',
      category: 'Atta & Flours',
      brand: '',
      sku: `SKU-${Date.now().toString().slice(-4)}`,
      sellingPrice: 50,
      mrp: 55,
      purchasePrice: 40,
      currentStock: 20,
      minStockLevel: 5,
      unit: 'packet',
      supplier: 'Local Agency',
      image: ''
    });
    setErrorMessage('');
    setIsModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      regionalName: product.regionalName || '',
      category: product.category,
      brand: product.brand,
      sku: product.sku,
      sellingPrice: product.sellingPrice,
      mrp: product.mrp,
      purchasePrice: product.purchasePrice,
      currentStock: product.currentStock,
      minStockLevel: product.minStockLevel,
      unit: product.unit,
      supplier: product.supplier,
      image: product.image || ''
    });
    setErrorMessage('');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
    if (onCloseAddModalInitially) onCloseAddModalInitially();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setErrorMessage('Product name is required');
      return;
    }
    if (formData.sellingPrice <= 0) {
      setErrorMessage('Selling price must be greater than 0');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      if (editingProduct) {
        await api.updateProduct(editingProduct.id, formData);
      } else {
        await api.addProduct(formData);
      }
      onProductsUpdated();
      closeModal();
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Failed to save product');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.deleteProduct(id);
      setDeleteConfirmId(null);
      onProductsUpdated();
    } catch (err: any) {
      console.error(err);
      alert('Error deleting product: ' + err.message);
    }
  };

  // Filtered & Sorted Products
  const filteredProducts = useMemo(() => {
    let result = products.filter((p) => {
      const matchesCat = selectedCategory === 'All' || p.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        (p.regionalName && p.regionalName.toLowerCase().includes(q)) ||
        p.brand.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q);

      let matchesStock = true;
      if (stockFilter === 'LowStock') {
        matchesStock = p.currentStock > 0 && p.currentStock <= p.minStockLevel;
      } else if (stockFilter === 'OutOfStock') {
        matchesStock = p.currentStock === 0;
      }

      return matchesCat && matchesSearch && matchesStock;
    });

    result.sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'stockAsc') return a.currentStock - b.currentStock;
      if (sortBy === 'priceDesc') return b.sellingPrice - a.sellingPrice;
      if (sortBy === 'priceAsc') return a.sellingPrice - b.sellingPrice;
      return 0;
    });

    return result;
  }, [products, searchQuery, selectedCategory, stockFilter, sortBy]);

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      {/* Top Header Card */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Product Catalog ({products.length} Items)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage kirana prices, Tamil names, SKUs, suppliers, and stock thresholds
          </p>
        </div>

        <button
          id="add-new-product-btn"
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all shadow-xs self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Search & Multi-Filters Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
          {/* Search bar */}
          <div className="sm:col-span-6 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              id="product-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search product, Tamil name (எ.கா. பருப்பு), SKU, or brand..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>

          {/* Category Filter */}
          <div className="sm:col-span-3">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none font-medium"
            >
              <option value="All">All Categories</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Stock Filter */}
          <div className="sm:col-span-3">
            <select
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value as any)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none font-medium"
            >
              <option value="All">All Stock Levels</option>
              <option value="LowStock">⚠️ Low Stock Alert</option>
              <option value="OutOfStock">🔴 Out of Stock (0)</option>
            </select>
          </div>
        </div>

        {/* Sort and summary row */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
          <span>Showing {filteredProducts.length} of {products.length} products</span>
          <div className="flex items-center gap-1.5">
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-400">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent text-slate-700 font-semibold outline-none cursor-pointer"
            >
              <option value="name">Name (A-Z)</option>
              <option value="stockAsc">Stock (Lowest First)</option>
              <option value="priceDesc">Price (High to Low)</option>
              <option value="priceAsc">Price (Low to High)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Product List Table & Cards */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3 px-4">Product Details</th>
                <th className="py-3 px-4">Category / Brand</th>
                <th className="py-3 px-4 text-right">Selling Price</th>
                <th className="py-3 px-4 text-right">MRP</th>
                <th className="py-3 px-4 text-right">Purchase Cost</th>
                <th className="py-3 px-4 text-center">Stock Level</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No products found matching the criteria.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const isLow = p.currentStock > 0 && p.currentStock <= p.minStockLevel;
                  const isOut = p.currentStock === 0;

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Name and regional name */}
                      <td className="py-3 px-4 font-medium">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                            <Package className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">{p.name}</p>
                            {p.regionalName && (
                              <p className="text-[11px] text-slate-400">{p.regionalName}</p>
                            )}
                            <p className="text-[10px] text-slate-400 mt-0.5">SKU: {p.sku} • {p.supplier}</p>
                          </div>
                        </div>
                      </td>

                      {/* Category & Brand */}
                      <td className="py-3 px-4">
                        <span className="inline-block px-2 py-0.5 text-[10px] font-semibold text-slate-700 bg-slate-100 rounded-md">
                          {p.category}
                        </span>
                        <p className="text-[11px] text-slate-500 mt-0.5">{p.brand}</p>
                      </td>

                      {/* Selling Price */}
                      <td className="py-3 px-4 text-right font-bold text-slate-900">
                        ₹{p.sellingPrice}
                        <span className="text-[10px] text-slate-400 block font-normal">/{p.unit}</span>
                      </td>

                      {/* MRP */}
                      <td className="py-3 px-4 text-right text-slate-500">
                        ₹{p.mrp}
                      </td>

                      {/* Purchase Cost & Margin */}
                      <td className="py-3 px-4 text-right">
                        <span className="text-slate-600 font-medium">₹{p.purchasePrice}</span>
                        <span className="text-[10px] text-emerald-700 block font-semibold">
                          +{Math.round(((p.sellingPrice - p.purchasePrice) / p.purchasePrice) * 100)}% margin
                        </span>
                      </td>

                      {/* Stock Level */}
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                            isOut
                              ? 'bg-rose-100 text-rose-800'
                              : isLow
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {isLow && <AlertTriangle className="w-3 h-3 text-amber-600" />}
                          {p.currentStock} {p.unit}
                        </span>
                        <span className="text-[10px] text-slate-400 block mt-0.5">
                          Min: {p.minStockLevel}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            id={`edit-prod-${p.id}`}
                            onClick={() => openEditModal(p)}
                            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                            title="Edit Product"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            id={`delete-prod-${p.id}`}
                            onClick={() => setDeleteConfirmId(p.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Delete Product"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 space-y-4 border border-slate-200 shadow-2xl">
            <h3 className="font-bold text-sm text-slate-900">Delete Product?</h3>
            <p className="text-xs text-slate-500">
              Are you sure you want to remove this product from the store catalog? Past sales history will remain preserved.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-xs"
              >
                Delete Product
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
              <h2 className="font-bold text-slate-900 text-sm">
                {editingProduct ? 'Edit Kirana Product' : 'Add New Kirana Product'}
              </h2>
              <button
                onClick={closeModal}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
              {errorMessage && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-800">
                  {errorMessage}
                </div>
              )}

              {/* Name & Tamil Name */}
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Product Name (English) *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Aashirvaad Superior MP Atta (5kg)"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Tamil / Regional Name (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. ஆசீர்வாத் கோதுமை மாவு (5 கிலோ)"
                  value={formData.regionalName || ''}
                  onChange={(e) => setFormData({ ...formData, regionalName: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              {/* Category, Brand, Unit */}
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as ProductCategory })}
                    className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Brand</label>
                  <input
                    type="text"
                    placeholder="e.g. ITC / Tata"
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Unit Type</label>
                  <select
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value as UnitType })}
                    className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {UNITS.map((u) => (
                      <option key={u} value={u}>{u}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Pricing: Selling Price, MRP, Purchase Price */}
              <div className="grid grid-cols-3 gap-3 p-3 bg-emerald-50/50 border border-emerald-100 rounded-xl">
                <div className="space-y-1">
                  <label className="font-bold text-emerald-900">Selling Price (₹) *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.sellingPrice || ''}
                    onChange={(e) => setFormData({ ...formData, sellingPrice: parseFloat(e.target.value) || 0 })}
                    className="w-full px-2.5 py-2 bg-white border border-emerald-200 rounded-lg text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">MRP (₹)</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.mrp || ''}
                    onChange={(e) => setFormData({ ...formData, mrp: parseFloat(e.target.value) || 0 })}
                    className="w-full px-2.5 py-2 bg-white border border-slate-200 rounded-lg outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Cost Price (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.purchasePrice || ''}
                    onChange={(e) => setFormData({ ...formData, purchasePrice: parseFloat(e.target.value) || 0 })}
                    className="w-full px-2.5 py-2 bg-white border border-slate-200 rounded-lg outline-none"
                  />
                </div>
              </div>

              {/* Stock Management */}
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Current Stock</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.currentStock}
                    onChange={(e) => setFormData({ ...formData, currentStock: parseInt(e.target.value) || 0 })}
                    className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Min Alert Level</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.minStockLevel}
                    onChange={(e) => setFormData({ ...formData, minStockLevel: parseInt(e.target.value) || 1 })}
                    className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">SKU / Code</label>
                  <input
                    type="text"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                  />
                </div>
              </div>

              {/* Supplier */}
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Supplier / Wholesale Mandi</label>
                <input
                  type="text"
                  placeholder="e.g. Sri Murugan Grain Depot"
                  value={formData.supplier}
                  onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all shadow-xs flex items-center gap-1.5"
                >
                  {isSubmitting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>{editingProduct ? 'Save Changes' : 'Create Product'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
