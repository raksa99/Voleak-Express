import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuthRole } from '../context/AuthRoleContext';
import { updateProductPrice } from '../lib/supabaseClient';
import { Tag, PlusCircle, Edit, Check, ShieldCheck, DollarSign } from 'lucide-react';
import { motion } from 'framer-motion';

export default function PricingProductsView({ products = [], setProducts }) {
  const { t } = useLanguage();
  const { isAdmin, currentUser } = useAuthRole();
  const [editingId, setEditingId] = useState(null);
  const [tempPrice, setTempPrice] = useState('');

  const handleStartEdit = (prod) => {
    setEditingId(prod.id);
    setTempPrice(prod.default_price.toString());
  };

  const handleSavePrice = (productId) => {
    updateProductPrice(productId, tempPrice, currentUser.name);
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, default_price: parseFloat(tempPrice) } : p))
    );
    setEditingId(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Tag className="w-5 h-5 text-amber-500" />
            <span>{t('productsTitle')}</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {t('productsSubtitle')}
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-3 py-1.5 rounded-xl border border-amber-500/20">
          <ShieldCheck className="w-4 h-4" />
          <span>Admin Exclusive: Price Overrides Tracked in Audit Log</span>
        </div>
      </div>

      {/* Products Table Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3.5 px-4">{t('thProductName')}</th>
                <th className="py-3.5 px-4">{t('thSku')}</th>
                <th className="py-3.5 px-4">{t('thCategory')}</th>
                <th className="py-3.5 px-4">{t('thUnit')}</th>
                <th className="py-3.5 px-4 text-right">{t('thDefaultPrice')}</th>
                <th className="py-3.5 px-4 text-right">Min Stock Alert</th>
                <th className="py-3.5 px-4 text-right">{t('thActions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {products.map((prod) => {
                const isEditing = editingId === prod.id;

                return (
                  <tr key={prod.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-4 px-4 font-bold text-slate-900 dark:text-white">
                      <div className="flex items-center gap-3">
                        <img
                          src={prod.image_url}
                          alt={prod.name}
                          className="w-10 h-10 rounded-lg object-cover ring-1 ring-slate-200 dark:ring-slate-700"
                        />
                        <span>{prod.name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 font-mono font-bold text-amber-500">
                      {prod.sku}
                    </td>
                    <td className="py-4 px-4 text-slate-600 dark:text-slate-400">
                      {prod.category}
                    </td>
                    <td className="py-4 px-4 text-slate-600 dark:text-slate-400">
                      {prod.unit}
                    </td>
                    <td className="py-4 px-4 text-right font-bold text-slate-900 dark:text-white">
                      {isEditing ? (
                        <div className="flex items-center justify-end gap-1">
                          <span className="text-slate-400">$</span>
                          <input
                            type="number"
                            step="0.10"
                            value={tempPrice}
                            onChange={(e) => setTempPrice(e.target.value)}
                            className="w-20 p-1 text-xs rounded-lg border border-amber-500 bg-white dark:bg-slate-800 text-right font-bold"
                          />
                        </div>
                      ) : (
                        `$${prod.default_price.toFixed(2)}`
                      )}
                    </td>
                    <td className="py-4 px-4 text-right font-semibold text-slate-500">
                      {prod.min_stock_alert} units
                    </td>
                    <td className="py-4 px-4 text-right">
                      {isEditing ? (
                        <button
                          onClick={() => handleSavePrice(prod.id)}
                          className="p-1.5 rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 shadow-sm"
                          title="Save Price"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleStartEdit(prod)}
                          className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-amber-500 hover:text-white transition-all"
                          title="Edit Price"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
