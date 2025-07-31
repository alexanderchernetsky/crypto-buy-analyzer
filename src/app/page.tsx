'use client'
import React, { useEffect, useState } from 'react';
import {TrendingUp, RefreshCw, Plus, Trash2, BarChart3, Edit} from 'lucide-react';
import Link from 'next/link';
import { fetchPrices } from '@/utils/api/fetchTokenPrices';
import { calculateOneYearPriceIndex, calculatePriceIndex } from '@/utils/calculatePriceIndex';
import { getBuySignal } from '@/utils/getBuySignal';
import { AddTokenToBuyAnalyzerForm } from '@/components/AddTokenToBuyAnalyzerForm';
import { EditTokenForm } from '@/components/EditTokenForm';
import {
  useAddTokenToBuyAnalyzer,
  useCryptoBuyAnalyzer,
  useRemoveTokenFromBuyAnalyzer,
  useUpdateTokenInBuyAnalyzer
} from '@/react-query/useCryptoBuyAnalyzer';

interface TokenInputForm {
  tokenName: string;
  symbol: string;
  allTimeLow: string;
  allTimeHigh: string;
  oneYearLow: string;
  oneYearHigh: string;
  oneMonthLow: string;
  oneMonthHigh: string;
}

interface TokenData {
  id: string;
  tokenName: string;
  symbol: string;
  allTimeLow: number;
  allTimeHigh: number;
  oneYearLow: number;
  oneYearHigh: number;
  oneMonthLow: number;
  oneMonthHigh: number;
  currentPrice: number;
  priceIndex: number | null;
  oneYearPriceIndex: number | null;
  oneMonthPriceIndex: number | null;
  piBuySignal: ReturnType<typeof getBuySignal>;
  oneYearPiBuySignal: ReturnType<typeof getBuySignal>;
  oneMonthPiBuySignal: ReturnType<typeof getBuySignal>;
  lastUpdated: string;
}

const CryptoBuyAnalyzer: React.FC = () => {
  const { data: tokens = [] } = useCryptoBuyAnalyzer();
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingToken, setEditingToken] = useState<TokenData | null>(null);
  const [analyzedTokens, setAnalyzedTokens] = useState<TokenData[]>([]);
  const addMutation = useAddTokenToBuyAnalyzer();
  const updateMutation = useUpdateTokenInBuyAnalyzer();
  const deleteMutation = useRemoveTokenFromBuyAnalyzer();

  const [formData, setFormData] = useState<TokenInputForm>({
    tokenName: '',
    symbol: '',
    allTimeLow: '',
    allTimeHigh: '',
    oneYearLow: '',
    oneYearHigh: '',
    oneMonthLow: '',
    oneMonthHigh: '',
  });

  const [editFormData, setEditFormData] = useState<TokenInputForm>({
    tokenName: '',
    symbol: '',
    allTimeLow: '',
    allTimeHigh: '',
    oneYearLow: '',
    oneYearHigh: '',
    oneMonthLow: '',
    oneMonthHigh: '',
  });

  useEffect(() => {
    if (tokens.length > 0) {
      updateAnalysis();
    }
  }, [tokens]);

  const updateAnalysis = async () => {
    if (tokens.length === 0) return;
    setLoading(true);

    try {
      const tokensWithData = tokens.filter((inv) => inv.allTimeLow && inv.allTimeHigh && inv.symbol);

      if (tokensWithData.length === 0) {
        setAnalyzedTokens([]);
        return;
      }

      const uniqueSymbols = [...new Set(tokensWithData.map((inv) => inv.symbol))];
      const priceData = await fetchPrices(uniqueSymbols);

      const analyzed = tokensWithData.map((inv ) => {
        const currentPrice = priceData[inv.symbol]?.usd ?? 0;
        const priceIndex = calculatePriceIndex(currentPrice, inv.allTimeLow!, inv.allTimeHigh!);
        const oneYearPriceIndex = calculateOneYearPriceIndex(currentPrice, inv.oneYearLow!, inv.oneYearHigh!);
        const oneMonthPriceIndex = inv.oneMonthLow && inv.oneMonthHigh
            ? calculatePriceIndex(currentPrice, Number(inv.oneMonthLow), Number(inv.oneMonthHigh))
            : null;
        const piBuySignal = getBuySignal(priceIndex);
        const oneYearPiBuySignal = getBuySignal(oneYearPriceIndex);
        const oneMonthPiBuySignal = getBuySignal(oneMonthPriceIndex);

        return {
          id: inv.id,
          tokenName: inv.tokenName,
          symbol: inv.symbol,
          currentPrice,
          priceIndex,
          oneYearPriceIndex,
          oneMonthPriceIndex,
          piBuySignal,
          oneYearPiBuySignal,
          oneMonthPiBuySignal,
          lastUpdated: new Date().toLocaleTimeString(),
          allTimeLow: inv.allTimeLow,
          allTimeHigh: inv.allTimeHigh,
          oneYearLow: inv.oneYearLow,
          oneYearHigh: inv.oneYearHigh,
          oneMonthLow: inv.oneMonthLow || 0,
          oneMonthHigh: inv.oneMonthHigh || 0,
        };
      }) as TokenData[];

      const uniqueAnalyzed = analyzed.filter((token, index, self) =>
          index === self.findIndex((t) => t.symbol === token.symbol)
      );

      const signalPriority: Record<string, number> = {
        'STRONG BUY': 1,
        BUY: 2,
        CAUTION: 3,
        AVOID: 4,
        UNKNOWN: 5,
      };

      uniqueAnalyzed.sort(
          (a, b) => signalPriority[a.piBuySignal.signal] - signalPriority[b.piBuySignal.signal]
      );

      setAnalyzedTokens(uniqueAnalyzed);
    } catch (err) {
      console.error(err);
      alert('Error updating analysis');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    const { tokenName, symbol, allTimeLow, allTimeHigh, oneYearLow, oneYearHigh, oneMonthLow, oneMonthHigh } = formData;
    if (!tokenName || !symbol || !allTimeLow || !allTimeHigh || !oneYearLow || !oneYearHigh || !oneMonthLow || !oneMonthHigh) {
      return alert('Fill all required fields');
    }

    setLoading(true);

    try {
      const data = await fetchPrices([symbol]);
      const currentPrice = data[symbol]?.usd;

      if (!currentPrice) throw new Error('Invalid symbol');
      const priceIndex = calculatePriceIndex(currentPrice,  parseFloat(formData.allTimeLow), parseFloat(formData.allTimeHigh));
      const oneYearPriceIndex = calculateOneYearPriceIndex(currentPrice, parseFloat(formData.oneYearLow), parseFloat(formData.oneYearHigh));

      const newToken = {
        tokenName,
        symbol: symbol.toLowerCase(),
        allTimeLow: Number(allTimeLow),
        allTimeHigh: Number(allTimeHigh),
        oneYearLow: Number(oneYearLow),
        oneYearHigh: Number(oneYearHigh),
        oneMonthLow: Number(oneMonthLow),
        oneMonthHigh: Number(oneMonthHigh),
        currentPrice,
        priceIndex,
        oneYearPriceIndex,
        lastUpdated: new Date().toLocaleTimeString(),
      };

      await addMutation.mutateAsync(newToken);

      setFormData({
        tokenName: '',
        symbol: '',
        allTimeLow: '',
        allTimeHigh: '',
        oneYearLow: '',
        oneYearHigh: '',
        oneMonthLow: '',
        oneMonthHigh: '',
      });
      setShowAddForm(false);
    } catch (err) {
      alert('Could not add investment');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (token: TokenData) => {
    setEditingToken(token);
    setEditFormData({
      tokenName: token.tokenName,
      symbol: token.symbol,
      allTimeLow: token.allTimeLow.toString(),
      allTimeHigh: token.allTimeHigh.toString(),
      oneYearLow: token.oneYearLow.toString(),
      oneYearHigh: token.oneYearHigh.toString(),
      oneMonthLow: token.oneMonthLow.toString(),
      oneMonthHigh: token.oneMonthHigh.toString(),
    });
    setShowEditForm(true);
    setShowAddForm(false); // Close add form if open
  };

  const handleEditSubmit = async () => {
    if (!editingToken) return;

    const { tokenName, symbol, allTimeLow, allTimeHigh, oneYearLow, oneYearHigh, oneMonthLow, oneMonthHigh } = editFormData;
    if (!tokenName || !symbol || !allTimeLow || !allTimeHigh || !oneYearLow || !oneYearHigh || !oneMonthLow || !oneMonthHigh) {
      return alert('Fill all required fields');
    }

    setLoading(true);

    try {
      const data = await fetchPrices([symbol]);
      const currentPrice = data[symbol]?.usd;

      if (!currentPrice) throw new Error('Invalid symbol');

      const updatedToken = {
        id: editingToken.id,
        tokenName,
        symbol: symbol.toLowerCase(),
        allTimeLow: Number(allTimeLow),
        allTimeHigh: Number(allTimeHigh),
        oneYearLow: Number(oneYearLow),
        oneYearHigh: Number(oneYearHigh),
        oneMonthLow: Number(oneMonthLow),
        oneMonthHigh: Number(oneMonthHigh),
      };

      await updateMutation.mutateAsync(updatedToken);

      setEditFormData({
        tokenName: '',
        symbol: '',
        allTimeLow: '',
        allTimeHigh: '',
        oneYearLow: '',
        oneYearHigh: '',
        oneMonthLow: '',
        oneMonthHigh: '',
      });
      setShowEditForm(false);
      setEditingToken(null);
    } catch (err) {
      alert('Could not update token');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this token?')) return;

    try {
      await deleteMutation.mutateAsync(id);
      setAnalyzedTokens(prev => prev.filter(token => token.id !== id));
    } catch (err) {
      console.error(err);
      alert('Failed to delete token.');
    }
  };

  return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
            <div className="flex flex-col lg:flex-row gap-3 items-center justify-between">
              <h1 className="text-2xl font-bold text-slate-200 flex flex-row items-center gap-2">
                <TrendingUp className="text-emerald-500" />
                Crypto Price Indexes
              </h1>
              <div className="flex gap-2">
                <Link
                    href="/crypto-tracker"
                    className="inline-flex items-center gap-1 rounded-md bg-blue-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-blue-700 transition"
                >
                  <BarChart3 className="w-4 h-4" />
                  Crypto Tracker
                </Link>
                <button
                    onClick={updateAnalysis}
                    disabled={loading || tokens.length === 0}
                    className={`inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-sm font-semibold text-white transition
                  ${loading || tokens.length === 0 ? 'bg-slate-600 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700'}
                `}
                >
                  <RefreshCw
                      className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`}
                  />
                  Refresh Analysis
                </button>
                <button
                    onClick={() => {
                      setShowAddForm(!showAddForm);
                      setShowEditForm(false); // Close edit form if open
                    }}
                    className="inline-flex items-center gap-1 rounded-md bg-emerald-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-emerald-700 transition"
                >
                  <Plus className="w-4 h-4" />
                  Add Token
                </button>
              </div>
            </div>
          </div>

          {/* Add Investment Form */}
          {showAddForm && (
              <AddTokenToBuyAnalyzerForm
                  formData={formData}
                  setFormData={setFormData}
                  loading={loading}
                  handleSubmit={handleSubmit}
                  setShowAddForm={setShowAddForm}
              />
          )}

          {/* Edit Investment Form */}
          {showEditForm && editingToken && (
              <EditTokenForm
                  formData={editFormData}
                  setFormData={setEditFormData}
                  loading={loading}
                  handleSubmit={handleEditSubmit}
                  setShowEditForm={setShowEditForm}
                  tokenName={editingToken.tokenName}
              />
          )}

          {/* Analysis Table */}
          <div className="bg-slate-800 rounded-xl border border-slate-700 mt-6 overflow-x-auto">
            <table className="w-full table-auto border-collapse">
              <thead>
              <tr>
                <th className="border-b border-slate-700 px-4 py-2 text-left text-sm font-semibold text-slate-300">Token</th>
                <th className="border-b border-slate-700 px-4 py-2 text-right text-sm font-semibold text-slate-300">Current Price</th>
                <th className="border-b border-slate-700 px-4 py-2 text-center text-sm font-semibold text-slate-300">PI</th>
                <th className="border-b border-slate-700 px-4 py-2 text-center text-sm font-semibold text-slate-300">1-Y PI</th>
                <th className="border-b border-slate-700 px-4 py-2 text-center text-sm font-semibold text-slate-300">1-M PI</th>
                <th className="border-b border-slate-700 px-4 py-2 text-center text-sm font-semibold text-slate-300">Actions</th>
              </tr>
              </thead>
              <tbody>
              {analyzedTokens.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-6 text-center text-sm text-slate-400">
                      {tokens.length === 0
                          ? 'No tokens found. Add tokens data to see buy analysis.'
                          : 'No tokens with sufficient price index data found. Please add All-time High/Low data to your tokens.'
                      }
                    </td>
                  </tr>
              ) : (
                  analyzedTokens.map(token => (
                      <tr key={token.id} className="border-b border-slate-700 last:border-0 hover:bg-slate-700">
                        <td className="px-4 py-3">
                          <div>
                            <div className="font-semibold text-slate-100">{token.tokenName}</div>
                            <div className="text-xs text-slate-400">{token.symbol}</div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right font-bold text-slate-50">${token.currentPrice.toFixed(2)}</td>
                        <td className="px-4 py-3 text-center">
                          {token.piBuySignal ? (
                              <div
                                  className="inline-flex items-center rounded-md px-3 py-1.5 text-xs font-semibold uppercase tracking-wide whitespace-nowrap"
                                  style={{
                                    color: token.piBuySignal.color,
                                    backgroundColor: `${token.piBuySignal.color}15`,
                                    border: `1px solid ${token.piBuySignal.color}30`,
                                  }}
                                  title={`${(Number(token.priceIndex) * 100).toFixed(1)}%`}
                              >
                                {token.priceIndex !== null
                                    ? `${(token.priceIndex * 100).toFixed(1)}%`
                                    : '—'}
                                {' '}
                                {token.piBuySignal.text}
                              </div>
                          ) : '—'}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {token.oneYearPiBuySignal ? (
                              <div
                                  className="inline-flex items-center rounded-md px-3 py-1.5 text-xs font-semibold uppercase tracking-wide whitespace-nowrap"
                                  style={{
                                    color: token.oneYearPiBuySignal.color,
                                    backgroundColor: `${token.oneYearPiBuySignal.color}15`,
                                    border: `1px solid ${token.oneYearPiBuySignal.color}30`,
                                  }}
                                  title={`${(Number(token.oneYearPriceIndex) * 100).toFixed(1)}%`}
                              >
                                {token.oneYearPriceIndex !== null
                                    ? `${(token.oneYearPriceIndex * 100).toFixed(1)}%`
                                    : '—'}
                                {' '}
                                {token.oneYearPiBuySignal.text}
                              </div>
                          ) : '—'}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {token.oneMonthPiBuySignal ? (
                              <div
                                  className="inline-flex items-center rounded-md px-3 py-1.5 text-xs font-semibold uppercase tracking-wide whitespace-nowrap"
                                  style={{
                                    color: token.oneMonthPiBuySignal.color,
                                    backgroundColor: `${token.oneMonthPiBuySignal.color}15`,
                                    border: `1px solid ${token.oneMonthPiBuySignal.color}30`,
                                  }}
                                  title={`${token.oneMonthPriceIndex !== null ? (Number(token.oneMonthPriceIndex) * 100).toFixed(1) : '—'}%`}
                              >
                                {token.oneMonthPriceIndex !== null
                                    ? `${(token.oneMonthPriceIndex * 100).toFixed(1)}%`
                                    : '—'}
                                {' '}
                                {token.oneMonthPiBuySignal.text}
                              </div>
                          ) : '—'}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                                onClick={() => handleEdit(token)}
                                className="text-blue-500 hover:text-blue-700 cursor-pointer"
                                title="Edit token"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => handleDelete(token.id)}
                                className="text-red-500 hover:text-red-700 cursor-pointer"
                                title="Delete token"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                  ))
              )}
              </tbody>
            </table>
          </div>

          {/* Legend Section */}
          <div className="grid auto-cols-fr grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-4 mt-6">
            <div className="flex items-start gap-3 rounded-lg border border-slate-600 bg-slate-700 px-4 py-3">
              <div className="w-4 h-4 mt-1 rounded-sm bg-emerald-600" />
              <div>
                <div className="text-sm font-semibold text-slate-100">Strong Buy</div>
                <p className="text-xs text-slate-400">
                  Price is in the lower 10% of its range.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-lg border border-slate-600 bg-slate-700 px-4 py-3">
              <div className="w-4 h-4 mt-1 rounded-sm bg-lime-500" />
              <div>
                <div className="text-sm font-semibold text-slate-100">Buy</div>
                <p className="text-xs text-slate-400">
                  Price is in the lower 40% of its range.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-lg border border-slate-600 bg-slate-700 px-4 py-3">
              <div className="w-4 h-4 mt-1 rounded-sm bg-yellow-500" />
              <div>
                <div className="text-sm font-semibold text-slate-100">Caution</div>
                <p className="text-xs text-slate-400">
                  Price is mid-range: 40-60% of its range.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-lg border border-slate-600 bg-slate-700 px-4 py-3">
              <div className="w-4 h-4 mt-1 rounded-sm bg-red-600" />
              <div>
                <div className="text-sm font-semibold text-slate-100">Avoid</div>
                <p className="text-xs text-slate-400">
                  Price is high: above 60% of its range.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
};

export default CryptoBuyAnalyzer;
