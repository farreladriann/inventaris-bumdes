"use client";

import { useState, useEffect } from "react";
import InventoryManager from "../components/InventoryManager";
import { useRouter } from "next/navigation";

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  useEffect(() => {
    const auth = sessionStorage.getItem("isAdminAuthenticated");
    if (auth === "true") {
      // Use a timeout to avoid synchronous state update warning, or just accept it as it's an initial check
      // Better yet, just set it. The warning is about cascading renders but for auth check on mount it's often acceptable or handled by setting initial state if possible (but sessionStorage is client side only)
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === "admin" && password === "password") {
      sessionStorage.setItem("isAdminAuthenticated", "true");
      setIsAuthenticated(true);
    } else {
      alert("Username atau password salah!");
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("isAdminAuthenticated");
    setIsAuthenticated(false);
    router.push("/");
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-100">
        <form onSubmit={handleLogin} className="bg-white p-10 rounded-xl shadow-xl w-full max-w-md border border-stone-200">
          <h2 className="text-3xl font-bold mb-8 text-center text-stone-900 tracking-tight">Login Admin</h2>
          <div className="mb-6">
            <label className="block text-sm font-bold text-stone-800 mb-2">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 border-2 border-stone-300 rounded-lg text-stone-900 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 font-medium"
              placeholder="Masukkan username"
            />
          </div>
          <div className="mb-8">
            <label className="block text-sm font-bold text-stone-800 mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border-2 border-stone-300 rounded-lg text-stone-900 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 font-medium"
              placeholder="Masukkan password"
            />
          </div>
          <button type="submit" className="w-full bg-orange-600 text-white py-3 rounded-lg hover:bg-orange-700 transition-all shadow-md hover:shadow-lg font-bold text-lg">
            Login
          </button>
          <button type="button" onClick={() => router.push("/")} className="w-full mt-6 text-stone-600 text-sm font-medium hover:text-stone-900 hover:underline transition-colors">
            Kembali ke Dashboard
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-100 py-10">
      <div className="max-w-4xl mx-auto px-4 mb-8 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-stone-900 tracking-tight">Admin Panel</h1>
        <button onClick={handleLogout} className="px-4 py-2 bg-white border border-stone-300 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-200 font-bold rounded-lg transition-all shadow-sm">
          Logout
        </button>
      </div>
      <InventoryManager />
    </div>
  );
}
