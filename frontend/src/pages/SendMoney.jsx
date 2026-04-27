import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api, { getErrorMessage } from "../lib/api";
import Navbar from "../components/Navbar";

export default function SendMoney() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectFrom = searchParams.get("from") || "";

  const [accounts, setAccounts] = useState([]);
  const [loadingAccounts, setLoadingAccounts] = useState(true);

  const [form, setForm] = useState({
    fromAccount: "",
    toAccount: "",
    amount: "",
    description: "",
  });
  const [balance, setBalance] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/accounts/");
        const list = (data.accounts || []).filter((a) => a.status === "ACTIVE");
        setAccounts(list);

        const initial =
          (preselectFrom && list.find((a) => a._id === preselectFrom))
            ? preselectFrom
            : list[0]?._id || "";
        if (initial) setForm((f) => ({ ...f, fromAccount: initial }));
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoadingAccounts(false);
      }
    })();
  }, [preselectFrom]);

  useEffect(() => {
    if (!form.fromAccount) {
      setBalance(null);
      return;
    }
    (async () => {
      try {
        const { data } = await api.get(`/accounts/balance/${form.fromAccount}`);
        setBalance(data.balance);
      } catch {
        setBalance(null);
      }
    })();
  }, [form.fromAccount]);

  const selectedAccount = accounts.find((a) => a._id === form.fromAccount);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const validate = () => {
    if (!form.fromAccount) return "Select a source account";
    if (!/^[0-9a-fA-F]{24}$/.test(form.toAccount.trim()))
      return "Recipient account ID must be a valid 24-char ID";
    if (form.toAccount.trim() === form.fromAccount)
      return "Cannot transfer to the same account";
    const amt = Number(form.amount);
    if (!amt || amt <= 0) return "Amount must be greater than 0";
    if (amt > 1000000) return "Amount cannot exceed 1,000,000";
    if (balance !== null && amt > balance)
      return `Insufficient balance. Available: ${balance}`;
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const v = validate();
    if (v) return setError(v);

    setError("");
    setSuccess(null);
    setSubmitting(true);

    try {
      const payload = {
        fromAccount: form.fromAccount,
        toAccount: form.toAccount.trim(),
        amount: Number(form.amount),
        idempotencyKey: crypto.randomUUID(),
      };
      if (form.description.trim()) payload.description = form.description.trim();

      const { data } = await api.post("/transactions/", payload);
      setSuccess(data.transaction);
      setForm((f) => ({ ...f, toAccount: "", amount: "", description: "" }));
      const { data: bal } = await api.get(`/accounts/balance/${form.fromAccount}`);
      setBalance(bal.balance);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="mx-auto max-w-2xl px-4 sm:px-6 py-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-1">Send Money</h1>
        <p className="text-sm text-slate-500 mb-6">Transfer to another Hishab-AI account</p>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          {loadingAccounts ? (
            <p className="text-sm text-slate-500">Loading accounts…</p>
          ) : accounts.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-slate-500 mb-4">No active accounts available. Create one first.</p>
              <button
                onClick={() => navigate("/dashboard")}
                className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
              >
                Go to Dashboard
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">From Account</label>
                <select
                  name="fromAccount"
                  value={form.fromAccount}
                  onChange={onChange}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                >
                  {accounts.map((a) => (
                    <option key={a._id} value={a._id}>
                      {a.currency} · {a._id.slice(-8)}
                    </option>
                  ))}
                </select>
                {selectedAccount && balance !== null && (
                  <p className="text-xs text-slate-500 mt-1">
                    Available Balance:{" "}
                    <span className="font-medium text-slate-900">
                      {balance.toLocaleString()} {selectedAccount.currency}
                    </span>
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  To Account (Account ID)
                </label>
                <input
                  type="text"
                  name="toAccount"
                  value={form.toAccount}
                  onChange={onChange}
                  placeholder="24-character account ID"
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm font-mono focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  required
                />
                <p className="text-xs text-slate-500 mt-1">
                  Recipient will receive funds in matching currency account
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Amount</label>
                <input
                  type="number"
                  name="amount"
                  value={form.amount}
                  onChange={onChange}
                  placeholder="0.00"
                  step="0.01"
                  min="0.01"
                  max="1000000"
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Description <span className="text-slate-400 font-normal">(optional)</span>
                </label>
                <input
                  type="text"
                  name="description"
                  value={form.description}
                  onChange={onChange}
                  placeholder="What's this for?"
                  maxLength={500}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              {error && (
                <div className="rounded-md bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
                  {error}
                </div>
              )}

              {success && (
                <div className="rounded-md bg-emerald-50 border border-emerald-200 px-3 py-3 text-sm text-emerald-800">
                  <p className="font-medium">✓ Transaction completed</p>
                  <p className="text-xs mt-1 font-mono break-all">ID: {success._id}</p>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:bg-emerald-400"
                >
                  {submitting ? "Sending..." : "Send Money"}
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/dashboard")}
                  className="rounded-md bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}