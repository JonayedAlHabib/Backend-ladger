import { useState } from "react";
import api, { getErrorMessage } from "../lib/api";
import Navbar from "../components/Navbar";

export default function Transactions() {
  const [txnId, setTxnId] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLookup = async (e) => {
    e.preventDefault();
    if (!/^[0-9a-fA-F]{24}$/.test(txnId.trim())) {
      return setError("Transaction ID must be 24 hex characters");
    }
    setError("");
    setResult(null);
    setLoading(true);
    try {
      const { data } = await api.get(`/transactions/${txnId.trim()}`);
      setResult(data.transaction);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const statusBadge = (status) => {
    const colors = {
      COMPLETED: "bg-emerald-50 text-emerald-700 border-emerald-200",
      PENDING: "bg-amber-50 text-amber-700 border-amber-200",
      FAILED: "bg-red-50 text-red-700 border-red-200",
      REVERSED: "bg-slate-100 text-slate-600 border-slate-200",
    };
    return (
      <span
        className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${
          colors[status] || colors.REVERSED
        }`}
      >
        {status}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="mx-auto max-w-3xl px-4 sm:px-6 py-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-1">Transaction History</h1>
        <p className="text-sm text-slate-500 mb-6">Look up a specific transaction by ID</p>

        <div className="rounded-md bg-amber-50 border border-amber-200 px-4 py-3 mb-6 text-sm text-amber-800">
          <p className="font-medium">⚠ Limited view</p>
          <p className="text-xs mt-1">
            Backend currently provides single transaction lookup only. For full history
            listing, a <code className="bg-amber-100 px-1 rounded">GET /api/transactions/my</code>{" "}
            endpoint needs to be added.
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm mb-6">
          <form onSubmit={handleLookup} className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={txnId}
              onChange={(e) => setTxnId(e.target.value)}
              placeholder="Transaction ID (24 hex chars)"
              className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm font-mono focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
            <button
              type="submit"
              disabled={loading}
              className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:bg-emerald-400"
            >
              {loading ? "Loading..." : "Look Up"}
            </button>
          </form>
        </div>

        {error && (
          <div className="rounded-md bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700 mb-4">
            {error}
          </div>
        )}

        {result && (
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500">Amount</p>
                <p className="text-3xl font-bold text-slate-900">
                  {Number(result.amount).toLocaleString()}
                </p>
              </div>
              {statusBadge(result.status)}
            </div>

            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm border-t border-slate-200 pt-4">
              <div>
                <dt className="text-xs text-slate-500 mb-0.5">Transaction ID</dt>
                <dd className="font-mono text-xs text-slate-700 break-all">{result._id}</dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500 mb-0.5">Date</dt>
                <dd className="text-slate-700">{new Date(result.createdAt).toLocaleString()}</dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500 mb-0.5">From Account</dt>
                <dd className="font-mono text-xs text-slate-700 break-all">
                  {result.fromAccount?._id || result.fromAccount}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500 mb-0.5">To Account</dt>
                <dd className="font-mono text-xs text-slate-700 break-all">
                  {result.toAccount?._id || result.toAccount}
                </dd>
              </div>
              {result.description && (
                <div className="sm:col-span-2">
                  <dt className="text-xs text-slate-500 mb-0.5">Description</dt>
                  <dd className="text-slate-700">{result.description}</dd>
                </div>
              )}
            </dl>
          </div>
        )}
      </main>
    </div>
  );
}