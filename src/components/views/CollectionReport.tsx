import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { formatINR } from '../../lib/currency';
import { Calendar, DollarSign, CreditCard, Smartphone, Banknote, TrendingUp } from 'lucide-react';

interface PaymentSummary {
  total_cash: number;
  total_upi: number;
  total_card: number;
  total_split_cash: number;
  total_split_upi: number;
  total_split_card: number;
}

export function CollectionReport() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [summary, setSummary] = useState<PaymentSummary>({
    total_cash: 0,
    total_upi: 0,
    total_card: 0,
    total_split_cash: 0,
    total_split_upi: 0,
    total_split_card: 0,
  });

  useEffect(() => {
    loadCollectionData();
  }, [startDate, endDate]);

  const loadCollectionData = async () => {
    setLoading(true);
    try {
      const startDateTime = `${startDate}T00:00:00`;
      const endDateTime = `${endDate}T23:59:59`;

      const { data: kots, error } = await supabase
        .from('kots')
        .select('payment_method, cash_amount, upi_amount, card_amount, kot_items(quantity, unit_price)')
        .gte('created_at', startDateTime)
        .lte('created_at', endDateTime)
        .in('status', ['served', 'ready', 'preparing']);

      if (error) throw error;

      let totalCash = 0;
      let totalUpi = 0;
      let totalCard = 0;
      let totalSplitCash = 0;
      let totalSplitUpi = 0;
      let totalSplitCard = 0;

      kots?.forEach((kot: any) => {
        const kotTotal = kot.kot_items?.reduce(
          (sum: number, item: any) => sum + (parseFloat(item.quantity) * parseFloat(item.unit_price)),
          0
        ) || 0;

        if (kot.payment_method === 'cash') {
          totalCash += kotTotal;
        } else if (kot.payment_method === 'upi') {
          totalUpi += kotTotal;
        } else if (kot.payment_method === 'card') {
          totalCard += kotTotal;
        } else if (kot.payment_method === 'split') {
          totalSplitCash += parseFloat(kot.cash_amount || 0);
          totalSplitUpi += parseFloat(kot.upi_amount || 0);
          totalSplitCard += parseFloat(kot.card_amount || 0);
        }
      });

      setSummary({
        total_cash: totalCash,
        total_upi: totalUpi,
        total_card: totalCard,
        total_split_cash: totalSplitCash,
        total_split_upi: totalSplitUpi,
        total_split_card: totalSplitCard,
      });
    } catch (error) {
      console.error('Error loading collection data:', error);
      alert('Error loading collection data');
    } finally {
      setLoading(false);
    }
  };

  const getTotalCash = () => summary.total_cash + summary.total_split_cash;
  const getTotalUpi = () => summary.total_upi + summary.total_split_upi;
  const getTotalCard = () => summary.total_card + summary.total_split_card;
  const getGrandTotal = () => getTotalCash() + getTotalUpi() + getTotalCard();

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Collection Report</h1>
        <p className="text-slate-600">View payment collections by date and payment method</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 mb-6">
        <div className="flex items-center gap-4 mb-6">
          <Calendar className="w-5 h-5 text-slate-600" />
          <h2 className="text-lg font-semibold text-slate-900">Select Date Range</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <Banknote className="w-8 h-8 opacity-80" />
            <div className="text-xs font-medium bg-white/20 px-2 py-1 rounded">CASH</div>
          </div>
          <div className="text-3xl font-bold mb-1">{formatINR(getTotalCash())}</div>
          <div className="text-sm opacity-90">
            {summary.total_split_cash > 0 && (
              <div className="mt-2 text-xs">
                Direct: {formatINR(summary.total_cash)} | Split: {formatINR(summary.total_split_cash)}
              </div>
            )}
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <Smartphone className="w-8 h-8 opacity-80" />
            <div className="text-xs font-medium bg-white/20 px-2 py-1 rounded">UPI</div>
          </div>
          <div className="text-3xl font-bold mb-1">{formatINR(getTotalUpi())}</div>
          <div className="text-sm opacity-90">
            {summary.total_split_upi > 0 && (
              <div className="mt-2 text-xs">
                Direct: {formatINR(summary.total_upi)} | Split: {formatINR(summary.total_split_upi)}
              </div>
            )}
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <CreditCard className="w-8 h-8 opacity-80" />
            <div className="text-xs font-medium bg-white/20 px-2 py-1 rounded">CARD</div>
          </div>
          <div className="text-3xl font-bold mb-1">{formatINR(getTotalCard())}</div>
          <div className="text-sm opacity-90">
            {summary.total_split_card > 0 && (
              <div className="mt-2 text-xs">
                Direct: {formatINR(summary.total_card)} | Split: {formatINR(summary.total_split_card)}
              </div>
            )}
          </div>
        </div>

        <div className="bg-gradient-to-br from-slate-700 to-slate-800 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <TrendingUp className="w-8 h-8 opacity-80" />
            <div className="text-xs font-medium bg-white/20 px-2 py-1 rounded">TOTAL</div>
          </div>
          <div className="text-3xl font-bold mb-1">{formatINR(getGrandTotal())}</div>
          <div className="text-sm opacity-90">All Payment Methods</div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Payment Breakdown</h3>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
            <div className="flex items-center gap-3">
              <Banknote className="w-6 h-6 text-green-600" />
              <div>
                <div className="font-semibold text-slate-900">Cash Payments</div>
                <div className="text-sm text-slate-600">
                  Direct: {formatINR(summary.total_cash)} | Split: {formatINR(summary.total_split_cash)}
                </div>
              </div>
            </div>
            <div className="text-xl font-bold text-green-600">{formatINR(getTotalCash())}</div>
          </div>

          <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-3">
              <Smartphone className="w-6 h-6 text-blue-600" />
              <div>
                <div className="font-semibold text-slate-900">UPI Payments</div>
                <div className="text-sm text-slate-600">
                  Direct: {formatINR(summary.total_upi)} | Split: {formatINR(summary.total_split_upi)}
                </div>
              </div>
            </div>
            <div className="text-xl font-bold text-blue-600">{formatINR(getTotalUpi())}</div>
          </div>

          <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
            <div className="flex items-center gap-3">
              <CreditCard className="w-6 h-6 text-purple-600" />
              <div>
                <div className="font-semibold text-slate-900">Card Payments</div>
                <div className="text-sm text-slate-600">
                  Direct: {formatINR(summary.total_card)} | Split: {formatINR(summary.total_split_card)}
                </div>
              </div>
            </div>
            <div className="text-xl font-bold text-purple-600">{formatINR(getTotalCard())}</div>
          </div>

          <div className="flex items-center justify-between p-4 bg-slate-100 rounded-lg border-2 border-slate-300">
            <div className="flex items-center gap-3">
              <DollarSign className="w-6 h-6 text-slate-700" />
              <div>
                <div className="font-bold text-slate-900 text-lg">Total Collections</div>
                <div className="text-sm text-slate-600">
                  From {new Date(startDate).toLocaleDateString()} to {new Date(endDate).toLocaleDateString()}
                </div>
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900">{formatINR(getGrandTotal())}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
