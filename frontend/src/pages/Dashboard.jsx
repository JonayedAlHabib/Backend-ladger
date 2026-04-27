import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api, { getErrorMessage } from "../lib/api";
import Navbar from "../components/Navbar";

const CURRENCIES = ["BDT", "USD", "EUR", "GBP", "JPY"];

const formatCurrency = (amount, currency) => {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${amount} ${currency}`;
  }
};

const formatDate = (iso) => {
  if (!iso) return "—";
  const d = new Date(iso);
  const days = Math.floor((Date.now() - d.getTime()) / (1000 * 60 * 60 * 24));
  if (days === 0) return "Today";
  if (days === 1) return "1 day ago";
  if (days < 30) return `${days} days ago`;
  return d.toLocaleDateString();
};

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [newCurrency, setNewCurrency] = useState("BDT");
  const [creating, setCreating] = useState(false);

  const loadAccounts = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get("/accounts/");
      const list = data.accounts || [];

      const withBalance = await Promise.all(
        list.map(async (acc) => {
          try {
            const { data: bal } = await api.get(`/accounts/balance/${acc._id}`);
            return { ...acc, balance: bal.balance };
          } catch {
            return { ...acc, balance: null };
          }
        })
      );
      setAccounts(withBalance);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAccounts();
  }, [loadAccounts]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      await api.post("/accounts/", { currency: newCurrency });
      setShowCreate(false);
      setNewCurrency("BDT");
      await loadAccounts();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setCreating(false);
    }
  };

  const statusBadge = (status) => {
    const colors = {
      ACTIVE: "bg-emerald-50 text-emerald-700 border-emerald-200",
      FROZEN: "bg-amber-50 text-amber-700 border-amber-200",
      CLOSED: "bg-slate-100 text-slate-600 border-slate-200",
    };
    return (
      <span
        className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${
          colors[status] || colors.CLOSED
        }`}
      >
        {status}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="mx-auto max-w-6xl px-4 sm:px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Welcome, {user?.name}</h1>
          <p className="text-sm text-slate-500 mt-1">Manage your accounts and balances</p>
        </div>

        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-800">Your Accounts</h2>
          <button
            onClick={() => setShowCreate((s) => !s)}
            className="rounded-md bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-700"
          >
            + Create New Account
          </button>
        </div>

        {showCreate && (
          <div className="mb-6 rounded-xl border border-slate-200 bg-white p-4">
            <form onSubmit={handleCreate} className="flex flex-wrap items-end gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Currency</label>
                <select
                  value={newCurrency}
                  onChange={(e) => setNewCurrency(e.target.value)}
                  className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                >
                  {CURRENCIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <button
                type="submit"
                disabled={creating}
                className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:bg-emerald-400"
              >
                {creating ? "Creating..." : "Create"}
              </button>
              <button
                type="button"
                onClick={() => setShowCreate(false)}
                className="rounded-md bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200"
              >
                Cancel
              </button>
            </form>
          </div>
        )}

        {error && (
          <div className="mb-4 rounded-md bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-xl border border-slate-200 bg-white p-5 animate-pulse">
                <div className="h-4 w-20 bg-slate-200 rounded mb-3" />
                <div className="h-8 w-32 bg-slate-200 rounded mb-3" />
                <div className="h-3 w-24 bg-slate-200 rounded" />
              </div>
            ))}
          </div>
        ) : accounts.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-slate-300 bg-white p-12 text-center">
            <p className="text-slate-500 mb-4">You don't have any accounts yet</p>
            <button
              onClick={() => setShowCreate(true)}
              className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
            >
              Create your first account
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {accounts.map((acc) => (
              <div
                key={acc._id}
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                    Account · {acc.currency}
                  </div>
                  {statusBadge(acc.status)}
                </div>

                <div className="text-2xl font-bold text-slate-900 mb-1">
                  {acc.balance !== null ? formatCurrency(acc.balance, acc.currency) : "—"}
                </div>

                <div className="text-xs text-slate-500 mb-4">
                  Created {formatDate(acc.createdAt)}
                </div>

                <div className="text-xs text-slate-400 font-mono truncate mb-3">
                  ID: {acc._id}
                </div>

                <button
                  onClick={() => navigate(`/send?from=${acc._id}`)}
                  disabled={acc.status !== "ACTIVE"}
                  className="w-full rounded-md bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Send from this account
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}