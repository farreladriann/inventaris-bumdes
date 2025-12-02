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
      <div className="min-h-screen flex items-center justify-center bg-zinc-100 dark:bg-black">
        <form onSubmit={handleLogin} className="bg-white dark:bg-zinc-900 p-8 rounded-lg shadow-md w-full max-w-md">
          <h2 className="text-2xl font-bold mb-6 text-center text-zinc-800 dark:text-zinc-100">Login Admin</h2>
          <div className="mb-4">
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 border rounded-md dark:bg-zinc-800 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100"
            />
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border rounded-md dark:bg-zinc-800 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100"
            />
          </div>
          <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors">
            Login
          </button>
          <button type="button" onClick={() => router.push("/")} className="w-full mt-4 text-zinc-600 dark:text-zinc-400 text-sm hover:underline">
            Kembali ke Dashboard
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-100 dark:bg-black py-8">
      <div className="max-w-4xl mx-auto px-4 mb-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-zinc-800 dark:text-zinc-100">Admin Panel</h1>
        <button onClick={handleLogout} className="text-red-600 hover:text-red-800 font-medium">Logout</button>
      </div>
      <InventoryManager />
    </div>
  );
}
