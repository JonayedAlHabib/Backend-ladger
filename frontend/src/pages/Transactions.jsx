import { useState, useEffect } from "react";
import api, { getErrorMessage } from "../lib/api";
import Navbar from "../components/Navbar";

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedTxn, setSelectedTxn] = useState(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError("");
      try {
        const { data } = await api.get("/transactions/my");
        setTransactions(data.transactions || []);
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const formatDate = (isoDate) => {
    const d = new Date(isoDate);
    const days = Math.floor((Date.now() - d.getTime()) / (1000 * 60 * 60 * 24));
    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 30) return `${days}d ago`;
    return d.toLocaleDateString();
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

      <main className="mx-auto max-w-4xl px-4 sm:px-6 py-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-1">Transaction History</h1>
        <p className="text-sm text-slate-500 mb-6">Your recent transactions</p>

        {error && (
          <div className="rounded-md bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700 mb-4">
            {error}
          </div>
        )}

        {loading && (
          <div className="rounded-md bg-slate-100 px-4 py-8 text-center">
            <p className="text-slate-600">Loading transactions...</p>
          </div>
        )}

        {!loading && transactions.length === 0 && (
          <div className="rounded-md bg-slate-50 border border-slate-200 px-4 py-8 text-center">
            <p className="text-slate-600">No transactions yet</p>
            <p className="text-xs text-slate-500 mt-1">Send or receive money to see transactions here</p>
          </div>
        )}

        {!loading && transactions.length > 0 && (
          <div className="space-y-3">
            {transactions.map((txn) => (
              <button
                key={txn._id}
                onClick={() => setSelectedTxn(selectedTxn?._id === txn._id ? null : txn)}
                className="w-full text-left rounded-lg border border-slate-200 bg-white p-4 hover:border-slate-300 hover:shadow-sm transition"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-900">
                      {txn.amount} {txn.fromAccount?.currency || "BDT"}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {txn.description || "Transfer"}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    {statusBadge(txn.status)}
                    <span className="text-xs text-slate-500">{formatDate(txn.createdAt)}</span>
                  </div>
                </div>

                {selectedTxn?._id === txn._id && (
                  <div className="mt-4 pt-4 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <p className="text-slate-500 mb-0.5">Transaction ID</p>
                      <p className="font-mono text-slate-700 break-all">{txn._id}</p>
                    </div>
                    <div>
                      <p className="text-slate-500 mb-0.5">Date</p>
                      <p className="text-slate-700">{new Date(txn.createdAt).toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-slate-500 mb-0.5">From Account</p>
                      <p className="text-slate-900 font-medium">
                        {txn.fromAccount?.user?.name || "Unknown User"}
                      </p>
                      <p className="text-slate-500 text-[11px] mt-0.5">
                        {txn.fromAccount?.user?.email || "—"}
                      </p>
                      <p className="font-mono text-slate-400 break-all text-[11px] mt-1">
                        {txn.fromAccount?._id || txn.fromAccount}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-500 mb-0.5">To Account</p>
                      <p className="text-slate-900 font-medium">
                        {txn.toAccount?.user?.name || "Unknown User"}
                      </p>
                      <p className="text-slate-500 text-[11px] mt-0.5">
                        {txn.toAccount?.user?.email || "—"}
                      </p>
                      <p className="font-mono text-slate-400 break-all text-[11px] mt-1">
                        {txn.toAccount?._id || txn.toAccount}
                      </p>
                    </div>
                    {txn.description && (
                      <div className="sm:col-span-2">
                        <p className="text-slate-500 mb-0.5">Description</p>
                        <p className="text-slate-700">{txn.description}</p>
                      </div>
                    )}
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}