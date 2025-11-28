import React from 'react';
import { format } from 'date-fns';
import { X, Printer } from 'lucide-react';

interface InvoiceItem {
  menu_item_id: string;
  menu_item_name: string;
  quantity: number;
  unit_price: number;
  total: number;
}

interface InvoicePreviewProps {
  invoice: {
    id: string;
    invoice_number: string;
    customer_name: string;
    customer_phone?: string;
    table_number?: string;
    order_type: 'dine_in' | 'delivery' | 'take_away';
    subtotal: number;
    tax: number;
    total: number;
    created_at: string;
  };
  items: InvoiceItem[];
  onClose: () => void;
}

export const InvoicePreview: React.FC<InvoicePreviewProps> = ({ invoice, items, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 print:bg-white print:relative print:inset-auto">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl print:shadow-none print:max-w-full">
        {/* Header */}
        <div className="bg-red-600 text-white p-6 rounded-t-lg print:flex print:justify-between">
          <div>
            <h2 className="text-2xl font-bold">INVOICE</h2>
            <p className="text-red-100">Badshah Pizza Hub</p>
          </div>
          <div className="text-right mt-4 print:mt-0">
            <p className="text-sm">Invoice #: {invoice.invoice_number || 'N/A'}</p>
            <p className="text-sm">Date: {format(new Date(invoice.created_at), 'dd/MM/yyyy')}</p>
            <p className="text-sm">Time: {format(new Date(invoice.created_at), 'HH:mm')}</p>
          </div>
        </div>

        {/* Order Info */}
        <div className="p-6 border-b">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold text-gray-700">Bill To:</h3>
              <p className="text-gray-800">{invoice.customer_name || 'Walk-in Customer'}</p>
              {invoice.customer_phone && <p className="text-gray-600">Phone: {invoice.customer_phone}</p>}
              {invoice.table_number && <p className="text-gray-600">Table: {invoice.table_number}</p>}
              <span 
                className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium ${
                  invoice.order_type === 'dine_in' 
                    ? 'bg-blue-100 text-blue-800' 
                    : invoice.order_type === 'delivery' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-purple-100 text-purple-800'
                }`}
              >
                {invoice.order_type === 'dine_in' ? 'Dine In' : 
                 invoice.order_type === 'delivery' ? 'Delivery' : 'Take Away'}
              </span>
            </div>
            <div className="md:text-right mt-4 md:mt-0">
              <h3 className="font-semibold text-gray-700">Order Summary</h3>
              <p className="text-gray-600">Items: {items.length}</p>
              <p className="text-gray-600">Subtotal: ₹{invoice.subtotal?.toFixed(2) || '0.00'}</p>
              <p className="text-gray-600">Tax (5%): ₹{invoice.tax?.toFixed(2) || '0.00'}</p>
              <p className="text-lg font-bold mt-2">Total: ₹{invoice.total?.toFixed(2) || '0.00'}</p>
            </div>
          </div>
        </div>

        {/* Items List */}
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Item
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Qty
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {items.map((item, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {item.menu_item_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                      {item.quantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                      ₹{item.unit_price?.toFixed(2) || '0.00'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium text-right">
                      ₹{((item.quantity || 0) * (item.unit_price || 0)).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 rounded-b-lg flex flex-col sm:flex-row justify-between items-center gap-4 print:hidden">
          <div>
            <p className="text-sm text-gray-500">Thank you for dining with us!</p>
            <p className="text-xs text-gray-400">For any queries, please contact: +91 1234567890</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2"
            >
              <X size={16} /> Close
            </button>
            <button
              onClick={handlePrint}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 flex items-center gap-2"
            >
              <Printer size={16} /> Print Invoice
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoicePreview;
