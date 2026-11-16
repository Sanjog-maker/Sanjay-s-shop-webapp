import React, { useState, useMemo } from 'react';
import { Bill, PaymentMethod } from '../../types/index';
import {
  Search,
  Eye,
  Calendar,
  IndianRupee,
  Receipt,
  Download,
  Filter,
  CheckCircle2,
  Clock,
  ArrowUpDown
} from 'lucide-react';

interface SalesHistoryViewProps {
  bills: Bill[];
  onOpenReceipt: (bill: Bill) => void;
  onNavigateToBilling: () => void;
}

export const SalesHistoryView: React.FC<SalesHistoryViewProps> = ({
  bills,
  onOpenReceipt,
  onNavigateToBilling
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [paymentFilter, setPaymentFilter] = useState<'ALL' | PaymentMethod>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PAID' | 'CREDIT'>('ALL');
  const [sortBy, setSortBy] = useState<'dateDesc' | 'dateAsc' | 'amountDesc' | 'amountAsc'>('dateDesc');

  const filteredBills = useMemo(() => {
    return bills
      .filter((bill) => {
        const q = searchQuery.toLowerCase().trim();
        const matchesSearch =
          !q ||
          bill.invoiceNumber.toLowerCase().includes(q) ||
          (bill.customerName && bill.customerName.toLowerCase().includes(q)) ||
          (bill.customerPhone && bill.customerPhone.includes(q)) ||
          bill.items.some((i) => i.product.name.toLowerCase().includes(q));

        const matchesPayment = paymentFilter === 'ALL' || bill.paymentMethod === paymentFilter;
        const matchesStatus = statusFilter === 'ALL' || bill.status === statusFilter;

        return matchesSearch && matchesPayment && matchesStatus;
      })
      .sort((a, b) => {
        if (sortBy === 'dateDesc') return new Date(b.date).getTime() - new Date(a.date).getTime();
        if (sortBy === 'dateAsc') return new Date(a.date).getTime() - new Date(b.date).getTime();
        if (sortBy === 'amountDesc') return b.total - a.total;
        if (sortBy === 'amountAsc') return a.total - b.total;
        return 0;
      });
  }, [bills, searchQuery, paymentFilter, statusFilter, sortBy]);

  // Aggregate stats
  const totalSalesRevenue = filteredBills.reduce((acc, b) => acc + b.total, 0);
  const totalSalesProfit = filteredBills.reduce((acc, b) => acc + (b.profit || 0), 0);
  const totalBillsCount = filteredBills.length;
  const avgBillValue = totalBillsCount > 0 ? totalSalesRevenue / totalBillsCount : 0;

  const exportCSV = () => {
    const headers = 'Invoice No,Date,Customer,Phone,Items Count,Subtotal,Discount,Total,Profit,Payment Method,Status\n';
    const rows = filteredBills
      .map((b) =>
        [
          b.invoiceNumber,
          new Date(b.date).toLocaleDateString('en-IN'),
          `"${b.customerName || 'Walk-in'}"`,
          b.customerPhone || '',
          b.items.length,
          b.subtotal,
          b.discount,
          b.total,
          b.profit || 0,
          b.paymentMethod,
          b.status
        ].join(',')
      )
      .join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `ShopIQ_Sales_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-16 md:pb-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Sales & Invoice Ledger
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Complete transaction history, bill reprints, and payment mode breakdowns
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="export-sales-csv-btn"
            onClick={exportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-colors"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Export CSV</span>
          </button>
          <button
            id="sales-new-bill-btn"
            onClick={onNavigateToBilling}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors shadow-xs"
          >
            <Receipt className="w-4 h-4" />
            <span>New Sale</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-medium text-slate-500">Filtered Revenue</span>
          <div className="mt-2 text-2xl font-bold text-slate-900 tracking-tight">
            ₹{totalSalesRevenue.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">{totalBillsCount} transactions</p>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-medium text-slate-500">Gross Profit</span>
          <div className="mt-2 text-2xl font-bold text-emerald-700 tracking-tight">
            ₹{totalSalesProfit.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
          </div>
          <p className="text-[11px] text-emerald-600 mt-1">
            {totalSalesRevenue > 0 ? `${((totalSalesProfit / totalSalesRevenue) * 100).toFixed(1)}% margin` : '0%'}
          </p>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-medium text-slate-500">Average Bill Size</span>
          <div className="mt-2 text-2xl font-bold text-slate-900 tracking-tight">
            ₹{avgBillValue.toFixed(2)}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Per customer</p>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-medium text-slate-500">Total Invoices</span>
          <div className="mt-2 text-2xl font-bold text-slate-900 tracking-tight">
            {totalBillsCount}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Generated</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search */}
          <div className="relative lg:col-span-2">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by bill #, customer name, phone, or product..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
            />
          </div>

          {/* Payment Method Filter */}
          <div>
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value as any)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            >
              <option value="ALL">All Payment Methods</option>
              <option value="UPI">UPI (GPay / PhonePe / Paytm)</option>
              <option value="CASH">Cash</option>
              <option value="CARD">Card</option>
              <option value="KHATA">Khata (Store Credit)</option>
            </select>
          </div>

          {/* Sort By */}
          <div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            >
              <option value="dateDesc">Latest First (Date)</option>
              <option value="dateAsc">Oldest First (Date)</option>
              <option value="amountDesc">Highest Amount</option>
              <option value="amountAsc">Lowest Amount</option>
            </select>
          </div>
        </div>
      </div>

      {/* Sales Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[10px] tracking-wider font-semibold">
              <tr>
                <th className="px-5 py-3">Bill Details</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Items Summary</th>
                <th className="px-4 py-3 text-center">Payment</th>
                <th className="px-4 py-3 text-right">Subtotal</th>
                <th className="px-4 py-3 text-right">Total (₹)</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredBills.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-slate-400">
                    <Receipt className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    <p className="font-medium text-slate-600">No invoices match your search filter</p>
                    <p className="text-[11px] text-slate-400 mt-1">Try resetting filters or generate a new bill</p>
                  </td>
                </tr>
              ) : (
                filteredBills.map((bill) => (
                  <tr key={bill.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="font-semibold text-slate-900">{bill.invoiceNumber}</div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3" />
                        {new Date(bill.date).toLocaleString('en-IN', {
                          dateStyle: 'medium',
                          timeStyle: 'short'
                        })}
                      </div>
                    </td>

                    <td className="px-4 py-3.5">
                      <div className="font-medium text-slate-800">
                        {bill.customerName || 'Walk-in Customer'}
                      </div>
                      {bill.customerPhone && (
                        <div className="text-[11px] text-slate-400">{bill.customerPhone}</div>
                      )}
                    </td>

                    <td className="px-4 py-3.5 max-w-xs">
                      <div className="text-slate-700 font-medium truncate">
                        {bill.items.map((i) => `${i.product.name} (x${i.quantity})`).join(', ')}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {bill.items.length} unique item{bill.items.length > 1 ? 's' : ''}
                      </div>
                    </td>

                    <td className="px-4 py-3.5 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 text-[10px] font-bold rounded-md ${
                          bill.paymentMethod === 'UPI'
                            ? 'bg-sky-100 text-sky-800'
                            : bill.paymentMethod === 'CASH'
                            ? 'bg-emerald-100 text-emerald-800'
                            : bill.paymentMethod === 'CARD'
                            ? 'bg-indigo-100 text-indigo-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {bill.paymentMethod}
                      </span>
                    </td>

                    <td className="px-4 py-3.5 text-right font-mono text-slate-500">
                      ₹{bill.subtotal.toFixed(2)}
                    </td>

                    <td className="px-4 py-3.5 text-right font-mono font-bold text-slate-900">
                      ₹{bill.total.toFixed(2)}
                    </td>

                    <td className="px-4 py-3.5 text-right">
                      <button
                        id={`view-receipt-${bill.invoiceNumber}`}
                        onClick={() => onOpenReceipt(bill)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg border border-emerald-200 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Receipt</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
