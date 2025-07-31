'use client'
import React, { useEffect, useState } from 'react';
import { TrendingUp, RefreshCw, Plus } from 'lucide-react';
import { fetchPrices } from '@/utils/api/fetchTokenPrices';
import { calculateOneYearPriceIndex, calculatePriceIndex } from '@/utils/calculatePriceIndex';
import { getBuySignal } from '@/utils/getBuySignal';
import { getFearGreedStatus } from '@/utils/getFearGreedStatus';
import { getAltcoinStatus } from '@/utils/getAltcoinStatus';
import { AddTokenToBuyAnalyzerForm } from '@/components/AddTokenToBuyAnalyzerForm';
import { useAddTokenToBuyAnalyzer, useCryptoBuyAnalyzer } from '@/react-query/useCryptoBuyAnalyzer';
import { useCoinmarketcap } from "@/react-query/useCoinmarketcap";

interface TokenInputForm {
  tokenName: string;
  symbol: string;
  allTimeLow: string;
  allTimeHigh: string;
  oneYearLow: string;
  oneYearHigh: string;
}

interface TokenData {
  id: string;
  tokenName: string;
  symbol: string;
  allTimeLow: number;
  allTimeHigh: number;
  oneYearLow: number;
  oneYearHigh: number;
  currentPrice: number;
  priceIndex: number | null;
  oneYearPriceIndex: number | null;
  piBuySignal: ReturnType<typeof getBuySignal>;
  oneYearPiBuySignal: ReturnType<typeof getBuySignal>;
  lastUpdated: string;
}

const CryptoBuyAnalyzer: React.FC = () => {
  const { data: tokens = [] } = useCryptoBuyAnalyzer();
  const { data: cmcData } = useCoinmarketcap();
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [analyzedTokens, setAnalyzedTokens] = useState<TokenData[]>([]);

  // todo: replace with real data
  const altcoinIndex = 'N/A';

  const addMutation = useAddTokenToBuyAnalyzer();

  const [formData, setFormData] = useState<TokenInputForm>({
    tokenName: '',
    symbol: '',
    allTimeLow: '',
    allTimeHigh: '',
    oneYearLow: '',
    oneYearHigh: '',
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

      const analyzed: TokenData[] = tokensWithData.map((inv ) => {
        const currentPrice = priceData[inv.symbol]?.usd ?? 0;
        const priceIndex = calculatePriceIndex(currentPrice, inv.allTimeLow!, inv.allTimeHigh!);
        const oneYearPriceIndex = calculateOneYearPriceIndex(currentPrice, inv.oneYearLow!, inv.oneYearHigh!);
        const piBuySignal = getBuySignal(priceIndex);
        const oneYearPiBuySignal = getBuySignal(oneYearPriceIndex);

        return {
          id: inv.id,
          tokenName: inv.tokenName,
          symbol: inv.symbol,
          currentPrice,
          priceIndex,
          oneYearPriceIndex,
          piBuySignal,
          oneYearPiBuySignal,
          lastUpdated: new Date().toLocaleTimeString(),
          allTimeLow: inv.allTimeLow,
          allTimeHigh: inv.allTimeHigh,
          oneYearLow: inv.oneYearLow,
          oneYearHigh: inv.oneYearHigh,
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
    const { tokenName, symbol, allTimeLow, allTimeHigh, oneYearLow, oneYearHigh } = formData;
    if (!tokenName || !symbol || !allTimeLow || !allTimeHigh || !oneYearLow || !oneYearHigh) {
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
      });
      setShowAddForm(false);
    } catch (err) {
      alert('Could not add investment');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fearGreedStatus = getFearGreedStatus(cmcData?.fearGreedIndex?.value);
  const altcoinStatus = getAltcoinStatus(altcoinIndex as unknown as number);

  return (
      <>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-slate-200 flex items-center gap-2">
                <TrendingUp className="text-emerald-500" />
                Crypto Buy Analyzer
              </h1>
              <div className="flex gap-2">
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
                    onClick={() => setShowAddForm(!showAddForm)}
                    className="inline-flex items-center gap-1 rounded-md bg-emerald-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-emerald-700 transition"
                >
                  <Plus className="w-4 h-4" />
                  Add Token
                </button>
              </div>
            </div>

            {/* Market Indices Grid */}
            <div className="grid auto-cols-fr grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-6 mt-6">
              {/* Fear & Greed Index Card */}
              <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-xl p-6 transition-all duration-200 ease-in-out">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-base font-semibold text-slate-200">Fear &amp; Greed Index</span>
                </div>
                <div className="flex flex-col gap-2">
                  <span className="text-4xl font-extrabold leading-none text-slate-50">{cmcData?.fearGreedIndex?.value}</span>
                  <div
                      className="inline-flex items-center rounded-md px-3 py-1.5 text-sm font-semibold w-fit"
                      style={{
                        color: fearGreedStatus.color,
                        backgroundColor: fearGreedStatus.bgColor,
                      }}
                  >
                    {cmcData?.fearGreedIndex?.classification}
                  </div>
                </div>
              </div>

              {/* Altcoin Index Card */}
              <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-xl p-6 transition-all duration-200 ease-in-out">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-base font-semibold text-slate-200">Altcoin Index</span>
                </div>
                <div className="flex flex-col gap-2">
                  <span className="text-4xl font-extrabold leading-none text-slate-50">{altcoinIndex}</span>
                  <div
                      className="inline-flex items-center rounded-md px-3 py-1.5 text-sm font-semibold w-fit"
                      style={{
                        color: altcoinStatus.color,
                        backgroundColor: altcoinStatus.bgColor,
                      }}
                  >
                    {altcoinStatus.text}
                  </div>
                </div>
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

          {/* Analysis Table */}
          <div className="bg-slate-800 rounded-xl border border-slate-700 mt-6 overflow-x-auto">
            <table className="w-full table-auto border-collapse">
              <thead>
              <tr>
                <th className="border-b border-slate-700 px-4 py-2 text-left text-sm font-semibold text-slate-300">Token</th>
                <th className="border-b border-slate-700 px-4 py-2 text-right text-sm font-semibold text-slate-300">Current Price</th>
                <th className="border-b border-slate-700 px-4 py-2 text-center text-sm font-semibold text-slate-300">PI</th>
                <th className="border-b border-slate-700 px-4 py-2 text-center text-sm font-semibold text-slate-300">1-Y PI</th>
              </tr>
              </thead>
              <tbody>
              {analyzedTokens.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-6 text-center text-sm text-slate-400">
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
                      </tr>
                  ))
              )}
              </tbody>
            </table>
          </div>

          {/* Legend Section */}
          <div className="grid auto-cols-fr grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-4 mt-6">
            <div className="flex items-center gap-3 rounded-lg border border-slate-600 bg-slate-700 px-4 py-3">
              <div className="w-4 h-4 rounded-sm bg-emerald-600" />
              <span className="text-sm text-slate-300">Strong Buy Signal</span>
            </div>
            <div className="flex items-center gap-3 rounded-lg border border-slate-600 bg-slate-700 px-4 py-3">
              <div className="w-4 h-4 rounded-sm bg-lime-500" />
              <span className="text-sm text-slate-300">Buy Signal</span>
            </div>
            <div className="flex items-center gap-3 rounded-lg border border-slate-600 bg-slate-700 px-4 py-3">
              <div className="w-4 h-4 rounded-sm bg-yellow-500" />
              <span className="text-sm text-slate-300">Caution Signal</span>
            </div>
            <div className="flex items-center gap-3 rounded-lg border border-slate-600 bg-slate-700 px-4 py-3">
              <div className="w-4 h-4 rounded-sm bg-red-600" />
              <span className="text-sm text-slate-300">Avoid Signal</span>
            </div>
          </div>
        </div>
      </>
  );
};

export default CryptoBuyAnalyzer;
