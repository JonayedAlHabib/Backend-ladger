import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";

export default function Settings() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="mx-auto max-w-2xl px-4 sm:px-6 py-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-1">Account Settings</h1>
        <p className="text-sm text-slate-500 mb-6">Manage your account details</p>

        <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <dl className="divide-y divide-slate-200">
            <div className="px-6 py-4 flex items-center justify-between">
              <div>
                <dt className="text-sm font-medium text-slate-500">Email</dt>
                <dd className="text-base text-slate-900 mt-0.5">{user?.email}</dd>
              </div>
            </div>

            <div className="px-6 py-4 flex items-center justify-between">
              <div>
                <dt className="text-sm font-medium text-slate-500">Name</dt>
                <dd className="text-base text-slate-900 mt-0.5">{user?.name}</dd>
              </div>
            </div>

            <div className="px-6 py-4 flex items-center justify-between">
              <div>
                <dt className="text-sm font-medium text-slate-500">Account Status</dt>
                <dd className="mt-0.5">
                  <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                    ACTIVE
                  </span>
                </dd>
              </div>
            </div>

            <div className="px-6 py-4 flex items-center justify-between">
              <div className="flex-1">
                <dt className="text-sm font-medium text-slate-500">Password</dt>
                <dd className="text-sm text-slate-400 mt-0.5">
                  Change password endpoint not yet implemented
                </dd>
              </div>
              <button
                disabled
                className="rounded-md bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-400 cursor-not-allowed"
              >
                Change
              </button>
            </div>

            <div className="px-6 py-4 flex items-center justify-between">
              <div className="flex-1">
                <dt className="text-sm font-medium text-slate-500">Logout All Devices</dt>
                <dd className="text-sm text-slate-400 mt-0.5">Endpoint not yet implemented</dd>
              </div>
              <button
                disabled
                className="rounded-md bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-400 cursor-not-allowed"
              >
                Logout All
              </button>
            </div>
          </dl>
        </div>

        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleLogout}
            className="flex-1 rounded-md bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200"
          >
            Logout
          </button>
          <button
            disabled
            className="flex-1 rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-400 cursor-not-allowed"
            title="Delete account endpoint not yet implemented"
          >
            Delete Account
          </button>
        </div>
      </main>
    </div>
  );
}