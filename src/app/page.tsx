"use client";

import React, { useEffect, useState, useRef, useMemo } from "react";
import { motion, useSpring, useTransform, useInView, animate, useMotionValue } from "framer-motion";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell
} from "recharts";
import {
  DollarSign, TrendingUp, MousePointerClick, CreditCard, Calendar, User, ChevronDown, 
  ArrowUpDown, Edit2, X, ChevronLeft, ChevronRight
} from "lucide-react";

// ============================================================================
// 1. TYPES & API INTEGRATION (Real Backend)
// ============================================================================

type DateRange = "7d" | "30d" | "12m";
const PLATFORMS = ["Google", "Facebook", "TikTok"] as const;
type Platform = typeof PLATFORMS[number];

type RawTimeSeries = {
  name: string;
  Google: { rev: number; spend: number };
  Facebook: { rev: number; spend: number };
  TikTok: { rev: number; spend: number };
};

type Campaign = {
  id: number;
  name: string;
  platform: Platform;
  status: "Active" | "Paused";
  budget: number;
  conversions: number;
  cpa: number;
};

// Fetch real data from FastAPI Backend
const fetchDashboardData = async (range: DateRange) => {
  try {
    const res = await fetch(`http://localhost:8000/api/dashboard-metrics?range=${range}`);
    if (!res.ok) throw new Error("Network response was not ok");
    return await res.json() as { timeSeries: RawTimeSeries[], campaigns: Campaign[] };
  } catch (error) {
    console.error("API Fetch Error:", error);
    // Return empty fallback on error to prevent crashes during portfolio demos
    return { timeSeries: [], campaigns: [] };
  }
};

// Simulate PUT request to FastAPI Backend
const updateCampaignAPI = async (id: number, budget: number, status: string) => {
  try {
    await fetch(`http://localhost:8000/api/campaigns/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ budget, status })
    });
  } catch (error) {
    console.error("Failed to update campaign", error);
  }
};

// ============================================================================
// 2. REACT BITS & ANIMATED COMPONENTS (Premium UI layer)
// ============================================================================

function FlickeringGrid() {
  return (
    <div className="fixed inset-0 z-[-1] pointer-events-none overflow-hidden bg-slate-950">
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.5, ease: "easeOut" }}
        className="absolute inset-0 bg-[radial-gradient(circle_800px_at_50%_-20%,rgba(16,185,129,0.12),transparent)]"
      />
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCI+PHBhdGggZD0iTTEgMWgydjJIMUMxeiIgZmlsbD0icmdiYSgyNTUsIDI1NSwgMjU1LCAwLjA0KSIvPjwvc3ZnPg==')] [mask-image:linear-gradient(to_bottom,white,transparent)] opacity-40" />
    </div>
  );
}

function CountUp({ value, prefix = "", suffix = "", decimals = 0, duration = 1.2 }: { value: number, prefix?: string, suffix?: string, decimals?: number, duration?: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "0px" });
  const count = useMotionValue(0);
  const display = useTransform(count, (latest) => prefix + latest.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ",") + suffix);

  useEffect(() => {
    if (isInView) animate(count, value, { duration, ease: "easeOut" });
  }, [isInView, value, duration, count]);

  return <motion.span ref={ref}>{display}</motion.span>;
}

function BlurText({ text, className = "", delay = 0 }: { text: string, className?: string, delay?: number }) {
  const words = text.split(" ");
  return (
    <motion.div
      initial="hidden" animate="visible"
      variants={{
        hidden: { filter: "blur(10px)", opacity: 0 },
        visible: { filter: "blur(0px)", opacity: 1, transition: { staggerChildren: 0.05, delayChildren: delay } }
      }}
      className={`flex flex-wrap ${className}`}
    >
      {words.map((word, i) => (
        <motion.span key={i} className="mr-[0.25em]" variants={{ hidden: { filter: "blur(10px)", opacity: 0, y: 5 }, visible: { filter: "blur(0px)", opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } } }}>
          {word}
        </motion.span>
      ))}
    </motion.div>
  );
}

function SpotlightCard({ children, className = "" }: { children: React.ReactNode, className?: string }) {
  const divRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!divRef.current) return;
    const rect = divRef.current.getBoundingClientRect();
    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  return (
    <div
      ref={divRef} onMouseMove={handleMouseMove} onMouseEnter={() => setOpacity(1)} onMouseLeave={() => setOpacity(0)}
      className={`relative overflow-hidden rounded-xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur-md transition-colors hover:border-slate-700 ${className}`}
    >
      <div
        className="pointer-events-none absolute -inset-px opacity-0 transition duration-300"
        style={{ opacity, background: `radial-gradient(400px circle at ${position.x}px ${position.y}px, rgba(255,255,255,0.06), transparent 40%)` }}
      />
      <div className="relative z-10 flex flex-col h-full">{children}</div>
    </div>
  );
}

// ============================================================================
// 3. SUB-COMPONENTS & ADVANCED FEATURES
// ============================================================================

const GlassTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-xl border border-slate-700/50 bg-slate-900/80 p-4 shadow-2xl backdrop-blur-xl">
        <p className="mb-3 text-sm font-semibold text-slate-200 border-b border-slate-700/50 pb-2">{label}</p>
        <div className="flex flex-col gap-2">
          {payload.map((p: any) => (
             <div key={p.dataKey} className="flex items-center justify-between gap-8 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.color }}></div>
                  <span className="text-slate-300 capitalize">{p.name}</span>
                </div>
                <span className="font-bold text-slate-100">{p.name === 'roas' ? p.value : `$${Number(p.value).toLocaleString()}`}</span>
             </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

function EditCampaignModal({ campaign, onClose, onSave }: { campaign: Campaign, onClose: () => void, onSave: (c: Campaign) => void }) {
  const [budget, setBudget] = useState(campaign.budget);
  const [status, setStatus] = useState(campaign.status);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl overflow-hidden">
        <div className="p-6 border-b border-slate-800/80">
          <h3 className="text-lg font-bold text-white">Edit Campaign</h3>
          <p className="text-sm text-slate-400 mt-1">Update settings for "{campaign.name}"</p>
        </div>
        <div className="p-6 space-y-5 bg-slate-900/50">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Daily Budget ($)</label>
            <input 
              type="number" value={budget} onChange={e => setBudget(Number(e.target.value))}
              className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all" 
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Status</label>
            <div className="flex gap-2">
              <button onClick={() => setStatus("Active")} className={`flex-1 rounded-md py-2 text-sm font-medium transition-colors ${status === "Active" ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.1)]" : "bg-slate-800 text-slate-400 border border-transparent hover:bg-slate-700"}`}>Active</button>
              <button onClick={() => setStatus("Paused")} className={`flex-1 rounded-md py-2 text-sm font-medium transition-colors ${status === "Paused" ? "bg-slate-500/20 text-slate-300 border border-slate-500/50" : "bg-slate-800 text-slate-400 border border-transparent hover:bg-slate-700"}`}>Paused</button>
            </div>
          </div>
        </div>
        <div className="p-4 border-t border-slate-800/80 bg-slate-900 flex justify-end gap-3">
          <button onClick={onClose} className="rounded-md px-4 py-2 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors">Cancel</button>
          <button onClick={() => onSave({...campaign, budget, status})} className="rounded-md bg-emerald-500 px-4 py-2 text-sm font-bold text-slate-950 hover:bg-emerald-400 transition-colors shadow-lg shadow-emerald-500/20">Save Changes</button>
        </div>
      </motion.div>
    </div>
  )
}

function CampaignTable({ campaigns, isLoading, onEdit }: { campaigns: Campaign[], isLoading: boolean, onEdit: (c: Campaign) => void }) {
  const [sortKey, setSortKey] = useState<keyof Campaign>("budget");
  const [sortDesc, setSortDesc] = useState(true);
  const [page, setPage] = useState(1);
  const itemsPerPage = 5;

  const handleSort = (key: keyof Campaign) => {
    if (sortKey === key) setSortDesc(!sortDesc);
    else { setSortKey(key); setSortDesc(true); }
  };

  const sorted = useMemo(() => {
    return [...campaigns].sort((a, b) => {
       if (a[sortKey] < b[sortKey]) return sortDesc ? 1 : -1;
       if (a[sortKey] > b[sortKey]) return sortDesc ? -1 : 1;
       return 0;
    });
  }, [campaigns, sortKey, sortDesc]);

  const totalPages = Math.ceil(sorted.length / itemsPerPage) || 1;
  const paginated = sorted.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  useEffect(() => { setPage(1) }, [campaigns]); // Reset page when filters change

  if (isLoading) {
    return (
      <div className="rounded-xl border border-slate-800 bg-slate-900/30 p-6 animate-pulse">
        <div className="w-40 h-5 bg-slate-800 rounded mb-6"></div>
        <div className="w-full h-8 bg-slate-800/80 rounded mb-4"></div>
        {[1,2,3,4,5].map(i => <div key={i} className="w-full h-14 bg-slate-800/40 rounded mb-2"></div>)}
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }} className="rounded-xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur-md overflow-x-auto flex flex-col h-[520px]">
      <BlurText text="Active Campaigns" className="mb-6 text-base font-semibold text-slate-200" delay={0.3} />
      <div className="flex-1 overflow-auto">
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="border-b border-slate-800 text-slate-400 sticky top-0 bg-slate-900/90 backdrop-blur-sm z-10">
            <tr>
              <th className="pb-3 pt-2 font-medium cursor-pointer hover:text-white transition-colors" onClick={() => handleSort('name')}>
                <div className="flex items-center gap-1">Campaign Name <ArrowUpDown className="h-3 w-3 opacity-50" /></div>
              </th>
              <th className="pb-3 pt-2 font-medium cursor-pointer hover:text-white transition-colors" onClick={() => handleSort('platform')}>
                <div className="flex items-center gap-1">Platform <ArrowUpDown className="h-3 w-3 opacity-50" /></div>
              </th>
              <th className="pb-3 pt-2 font-medium cursor-pointer hover:text-white transition-colors" onClick={() => handleSort('status')}>
                <div className="flex items-center gap-1">Status <ArrowUpDown className="h-3 w-3 opacity-50" /></div>
              </th>
              <th className="pb-3 pt-2 font-medium cursor-pointer hover:text-white transition-colors text-right" onClick={() => handleSort('budget')}>
                <div className="flex items-center gap-1 justify-end">Daily Budget <ArrowUpDown className="h-3 w-3 opacity-50" /></div>
              </th>
              <th className="pb-3 pt-2 font-medium cursor-pointer hover:text-white transition-colors text-right" onClick={() => handleSort('conversions')}>
                <div className="flex items-center gap-1 justify-end">Conversions <ArrowUpDown className="h-3 w-3 opacity-50" /></div>
              </th>
              <th className="pb-3 pt-2 font-medium cursor-pointer hover:text-white transition-colors text-right" onClick={() => handleSort('cpa')}>
                <div className="flex items-center gap-1 justify-end">CPA <ArrowUpDown className="h-3 w-3 opacity-50" /></div>
              </th>
              <th className="pb-3 pt-2 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            {paginated.map((campaign) => (
              <tr key={campaign.id} className="hover:bg-slate-800/30 transition-colors group">
                <td className="py-4 font-medium text-slate-200">{campaign.name}</td>
                <td className="py-4">
                  <span className="inline-flex items-center rounded-md bg-slate-800 px-2.5 py-0.5 text-xs font-semibold text-slate-300 ring-1 ring-inset ring-slate-700">
                    {campaign.platform}
                  </span>
                </td>
                <td className="py-4">
                  <span className={`inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${
                    campaign.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400 ring-emerald-500/20' : 'bg-slate-500/10 text-slate-400 ring-slate-500/20'
                  }`}>
                    {campaign.status}
                  </span>
                </td>
                <td className="py-4 text-right">${campaign.budget.toFixed(2)}</td>
                <td className="py-4 text-right">{campaign.conversions}</td>
                <td className="py-4 text-right font-medium text-slate-200">${campaign.cpa.toFixed(2)}</td>
                <td className="py-4 text-right">
                  <button onClick={() => onEdit(campaign)} className="p-1.5 rounded-md text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100">
                    <Edit2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
            {paginated.length === 0 && (
              <tr><td colSpan={7} className="py-8 text-center text-slate-500">No campaigns found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="mt-4 flex items-center justify-between border-t border-slate-800/50 pt-4">
        <span className="text-xs text-slate-500 font-medium">Showing {(page-1)*itemsPerPage + 1} to {Math.min(page*itemsPerPage, sorted.length)} of {sorted.length}</span>
        <div className="flex items-center gap-2">
          <button disabled={page === 1} onClick={() => setPage(p => p-1)} className="rounded-md bg-slate-800/80 p-1.5 hover:bg-slate-700 disabled:opacity-30 transition-colors"><ChevronLeft className="h-4 w-4" /></button>
          <button disabled={page === totalPages || totalPages === 0} onClick={() => setPage(p => p+1)} className="rounded-md bg-slate-800/80 p-1.5 hover:bg-slate-700 disabled:opacity-30 transition-colors"><ChevronRight className="h-4 w-4" /></button>
        </div>
      </div>
    </motion.div>
  );
}

// ============================================================================
// 4. MAIN PAGE ORCHESTRATOR
// ============================================================================

export default function MarketingDashboard() {
  const [dateRange, setDateRange] = useState<DateRange>("30d");
  const [timeSeries, setTimeSeries] = useState<RawTimeSeries[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Cross-Filtering State
  const [platformFilter, setPlatformFilter] = useState<Platform | null>(null);
  
  // CRUD State
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);

  // Fetch Data (Real API)
  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    
    fetchDashboardData(dateRange).then((res) => {
      if (isMounted) {
        setTimeSeries(res.timeSeries || []);
        setCampaigns(res.campaigns || []);
        setIsLoading(false);
      }
    });
    return () => { isMounted = false; };
  }, [dateRange]);

  // Handle CRUD Save Optimistically and fire PUT request
  const handleSaveCampaign = async (updated: Campaign) => {
    // 1. Optimistic UI update
    setCampaigns(prev => prev.map(c => c.id === updated.id ? updated : c));
    setEditingCampaign(null);
    
    // 2. Fire background network request to API
    await updateCampaignAPI(updated.id, updated.budget, updated.status);
  };

  // Derive Filtered & Aggregated Data for Components
  const filteredCampaigns = useMemo(() => {
    return platformFilter ? campaigns.filter(c => c.platform === platformFilter) : campaigns;
  }, [campaigns, platformFilter]);

  const areaData = useMemo(() => {
    return timeSeries.map(point => {
      let rev = 0, spend = 0;
      if (platformFilter) {
        rev = point[platformFilter].rev;
        spend = point[platformFilter].spend;
      } else {
        PLATFORMS.forEach(p => { rev += point[p].rev; spend += point[p].spend; });
      }
      return { name: point.name, revenue: rev, spend: spend };
    });
  }, [timeSeries, platformFilter]);

  const kpiData = useMemo(() => {
    const totalRev = areaData.reduce((acc, curr) => acc + curr.revenue, 0);
    const totalSpend = areaData.reduce((acc, curr) => acc + curr.spend, 0);
    const roi = totalSpend > 0 ? ((totalRev - totalSpend) / totalSpend) * 100 : 0;
    const ctr = platformFilter === 'Google' ? 5.2 : platformFilter === 'Facebook' ? 3.8 : platformFilter === 'TikTok' ? 6.1 : 4.8;
    
    return [
      { id: 1, title: "Total Revenue", value: totalRev, prefix: "$", decimals: 0, icon: DollarSign, trend: "+12.5%", trendUp: true },
      { id: 2, title: "Ad Spend", value: totalSpend, prefix: "$", decimals: 0, icon: CreditCard, trend: "-2.4%", trendUp: false },
      { id: 3, title: "Avg. CTR", value: ctr, suffix: "%", decimals: 2, icon: MousePointerClick, trend: "+0.5%", trendUp: true },
      { id: 4, title: "Overall ROI", value: roi, suffix: "%", decimals: 1, icon: TrendingUp, trend: "+8.2%", trendUp: true },
    ];
  }, [areaData, platformFilter]);

  // ROAS Bar Chart unaffected by filter so user can see & select others
  const barData = useMemo(() => {
     return PLATFORMS.map(plat => {
        const rev = timeSeries.reduce((acc, curr) => acc + curr[plat].rev, 0);
        const spend = timeSeries.reduce((acc, curr) => acc + curr[plat].spend, 0);
        return { platform: plat, roas: spend > 0 ? Number((rev / spend).toFixed(2)) : 0 };
     });
  }, [timeSeries]);

  // Header Dropdown State
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const clickOut = (e: MouseEvent) => { if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setIsDropdownOpen(false); };
    document.addEventListener("mousedown", clickOut);
    return () => document.removeEventListener("mousedown", clickOut);
  }, []);

  return (
    <div className="min-h-screen text-slate-50 relative selection:bg-emerald-500/30 font-sans pb-12">
      <FlickeringGrid />
      
      {/* HEADER */}
      <header className="sticky top-0 z-40 border-b border-slate-800/60 bg-slate-950/70 backdrop-blur-lg">
        <div className="flex h-16 items-center justify-between px-6 mx-auto max-w-7xl">
          <div className="flex items-center gap-6">
            <BlurText text="Marketing Analytics" className="text-xl font-semibold tracking-tight text-white" />
            
            {/* Global Filter Indicator */}
            {platformFilter && (
              <motion.button 
                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                onClick={() => setPlatformFilter(null)}
                className="hidden sm:flex items-center gap-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-1 text-xs font-medium text-purple-400 hover:bg-purple-500/20 transition-colors shadow-[0_0_15px_rgba(168,85,247,0.15)]"
              >
                Filtered: {platformFilter} <X className="h-3 w-3" />
              </motion.button>
            )}
          </div>
          
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1, duration: 0.5 }} className="flex items-center gap-4">
            <div className="relative" ref={dropdownRef}>
              <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="flex items-center gap-2 rounded-md border border-slate-700 bg-slate-900 px-3 py-1.5 text-sm hover:bg-slate-800 transition-colors w-[155px] justify-between shadow-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-emerald-500" />
                  <span className="text-slate-200 font-medium">{dateRange === "7d" ? "Last 7 Days" : dateRange === "30d" ? "Last 30 Days" : "Last 12 Months"}</span>
                </div>
                <ChevronDown className="h-3 w-3 text-slate-400" />
              </button>
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-full rounded-md border border-slate-700 bg-slate-800 shadow-xl overflow-hidden z-50">
                  {["7d", "30d", "12m"].map((r) => (
                    <button key={r} onClick={() => { setDateRange(r as DateRange); setIsDropdownOpen(false); }} className={`block w-full text-left px-3 py-2 text-sm transition-colors ${dateRange === r ? 'bg-slate-700 text-white font-medium' : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'}`}>
                      {r === "7d" ? "Last 7 Days" : r === "30d" ? "Last 30 Days" : "Last 12 Months"}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="h-8 w-8 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700 shadow-sm cursor-pointer hover:bg-slate-700 transition-colors">
              <User className="h-4 w-4 text-slate-300" />
            </div>
          </motion.div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="p-6">
        <div className="mx-auto max-w-7xl space-y-6">
          
          {/* KPIs */}
          {isLoading ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-[136px] rounded-xl border border-slate-800 bg-slate-900/30 p-6 flex flex-col justify-between animate-pulse">
                  <div className="flex justify-between items-center"><div className="w-24 h-4 bg-slate-800 rounded"></div><div className="w-4 h-4 bg-slate-800 rounded-full"></div></div>
                  <div className="w-32 h-8 bg-slate-800 rounded mt-4"></div><div className="w-24 h-3 bg-slate-800 rounded mt-4"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {kpiData.map((kpi, idx) => (
                <motion.div key={kpi.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: idx * 0.1 }}>
                  <SpotlightCard className="h-[136px]">
                    <div className="flex items-center justify-between mb-4"><span className="text-sm font-medium text-slate-400">{kpi.title}</span><kpi.icon className="h-4 w-4 text-slate-500" /></div>
                    <div className="text-3xl font-bold tracking-tight text-white leading-none mb-3">
                      <CountUp value={kpi.value} prefix={kpi.prefix} suffix={kpi.suffix} decimals={kpi.decimals} />
                    </div>
                    <div className="flex items-center mt-auto">
                      <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${kpi.trendUp ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>{kpi.trend}</span>
                    </div>
                  </SpotlightCard>
                </motion.div>
              ))}
            </div>
          )}

          {/* CHARTS */}
          {isLoading ? (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2 h-[380px] rounded-xl border border-slate-800 bg-slate-900/30 p-6 flex flex-col animate-pulse">
                <div className="w-48 h-5 bg-slate-800 rounded mb-6"></div><div className="flex-1 w-full bg-slate-800/40 rounded"></div>
              </div>
              <div className="lg:col-span-1 h-[380px] rounded-xl border border-slate-800 bg-slate-900/30 p-6 flex flex-col animate-pulse">
                <div className="w-32 h-5 bg-slate-800 rounded mb-6"></div><div className="flex-1 w-full bg-slate-800/40 rounded"></div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="lg:col-span-2 h-[380px] rounded-xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur-md flex flex-col">
                <BlurText text={platformFilter ? `${platformFilter} Revenue vs. Spend` : "Overall Revenue vs. Spend"} className="mb-6 text-base font-semibold text-slate-200" delay={0.1} />
                <div className="flex-1 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={areaData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/><stop offset="95%" stopColor="#10b981" stopOpacity={0}/></linearGradient>
                        <linearGradient id="colorSpend" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/><stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/></linearGradient>
                        <filter id="glowRev"><feGaussianBlur stdDeviation="4" result="coloredBlur"/><feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
                        <filter id="glowSpend"><feGaussianBlur stdDeviation="4" result="coloredBlur"/><feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.4} />
                      <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val/1000}k`} />
                      <Tooltip content={<GlassTooltip />} cursor={{ stroke: '#334155', strokeWidth: 1, strokeDasharray: '4 4' }} />
                      <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" animationDuration={1000} filter="url(#glowRev)" />
                      <Area type="monotone" dataKey="spend" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorSpend)" animationDuration={1000} filter="url(#glowSpend)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="lg:col-span-1 h-[380px] rounded-xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur-md flex flex-col">
                <div className="flex items-center justify-between mb-6">
                  <BlurText text="Platform ROAS" className="text-base font-semibold text-slate-200" delay={0.2} />
                  <span className="text-xs text-slate-500 font-medium">Click to filter</span>
                </div>
                <div className="flex-1 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={barData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#334155" opacity={0.4} />
                      <XAxis type="number" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis dataKey="platform" type="category" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} width={75} />
                      <Tooltip content={<GlassTooltip />} cursor={{ fill: '#1e293b', opacity: 0.4 }} />
                      <Bar dataKey="roas" radius={[0, 4, 4, 0]} barSize={28} animationDuration={1000}>
                        {barData.map((entry, index) => (
                           <Cell 
                             key={`cell-${index}`} 
                             fill={platformFilter && platformFilter !== entry.platform ? "#4c1d95" : "#8b5cf6"} 
                             className="cursor-pointer transition-colors duration-300 hover:brightness-125"
                             onClick={() => setPlatformFilter(entry.platform === platformFilter ? null : entry.platform as Platform)}
                           />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>
            </div>
          )}

          {/* TABLE */}
          <CampaignTable campaigns={filteredCampaigns} isLoading={isLoading} onEdit={setEditingCampaign} />
        </div>
      </main>

      {/* CRUD MODAL */}
      {editingCampaign && (
        <EditCampaignModal campaign={editingCampaign} onClose={() => setEditingCampaign(null)} onSave={handleSaveCampaign} />
      )}
    </div>
  );
}
