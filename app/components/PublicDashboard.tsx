"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

const LOCATIONS = [
  "Pranan",
  "Jogorejo",
  "Badran Kidul",
  "Dalangan",
  "Bandan",
  "Plembon",
  "Parakan Kulon",
  "Parakan Wetan",
  "Gatak",
  "Sutan",
  "Denokan",
  "Jetis Depok",
];

interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  location: string;
}

export default function PublicDashboard() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [filterLocation, setFilterLocation] = useState("Semua");
  const [isLoaded, setIsLoaded] = useState(false);
  
  // Order State
  const [orderingItem, setOrderingItem] = useState<InventoryItem | null>(null);
  const [orderQuantity, setOrderQuantity] = useState("");

  useEffect(() => {
    const savedItems = localStorage.getItem("kitchen-inventory");
    if (savedItems) {
      try {
        const parsed = JSON.parse(savedItems);
        const migrated = parsed.map((item: Record<string, unknown>) => ({
          ...item,
          location: (item.location as string) || LOCATIONS[0],
        }));
        setItems(migrated);
      } catch (e) {
        console.error("Failed to parse inventory", e);
      } 
    }
    setIsLoaded(true);
  }, []);

  const getDisplayItems = () => {
    if (filterLocation === "Semua") {
      // Aggregate items by name and unit
      const aggregated: Record<string, InventoryItem> = {};
      
      items.forEach(item => {
        const key = `${item.name.toLowerCase()}-${item.unit}`;
        if (aggregated[key]) {
          aggregated[key].quantity += item.quantity;
        } else {
          aggregated[key] = { ...item, location: "Semua Padukuhan" };
        }
      });
      
      return Object.values(aggregated);
    } else {
      // Filter by specific location
      return items.filter(item => item.location === filterLocation);
    }
  };

  const handleOrderClick = (item: InventoryItem) => {
    setOrderingItem(item);
    setOrderQuantity("");
  };

  const handleConfirmOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderingItem) return;

    const qty = parseFloat(orderQuantity);
    if (isNaN(qty) || qty <= 0) {
      alert("Mohon masukkan jumlah yang valid.");
      return;
    }

    if (qty > orderingItem.quantity) {
      alert("Stok tidak mencukupi!");
      return;
    }

    // Update items state
    const newItems = items.map((item) => {
      if (item.id === orderingItem.id) {
        // Fix floating point precision issues by rounding to 10 decimal places then parsing back
        const newQty = parseFloat((item.quantity - qty).toFixed(10));
        return { ...item, quantity: newQty };
      }
      return item;
    });

    setItems(newItems);
    localStorage.setItem("kitchen-inventory", JSON.stringify(newItems));
    
    alert(`Berhasil memesan ${qty} ${orderingItem.unit} ${orderingItem.name}. Stok telah diperbarui.`);
    setOrderingItem(null);
    setOrderQuantity("");
  };

  const formatNumber = (num: number) => {
    // Format to remove trailing zeros and limit decimal places if needed
    return parseFloat(num.toFixed(10));
  };

  const displayItems = getDisplayItems();

  if (!isLoaded) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-stone-100">
      {/* Header */}
      <header className="bg-white shadow-md sticky top-0 z-10 border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-stone-950 tracking-tight">
            Inventaris SPBG BUMDes Sendangsari
          </h1>
          <Link
            href="/admin"
            className="px-5 py-2.5 bg-stone-900 text-white rounded-lg text-sm font-semibold hover:bg-stone-800 transition-all shadow-sm hover:shadow"
          >
            Login Admin
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filter */}
        <div className="mb-8">
          <label className="block text-sm font-bold text-stone-800 mb-2">
            Filter Berdasarkan Padukuhan
          </label>
          <select
            value={filterLocation}
            onChange={(e) => setFilterLocation(e.target.value)}
            className="w-full sm:w-64 px-4 py-2.5 border-2 border-stone-300 rounded-lg bg-white text-stone-900 font-medium focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:outline-none shadow-sm"
          >
            <option value="Semua">Semua Padukuhan</option>
            {LOCATIONS.map((loc) => (
              <option key={loc} value={loc}>
                {loc}
              </option>
            ))}
          </select>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {displayItems.length === 0 ? (
            <div className="col-span-full text-center py-16 text-stone-600 bg-white rounded-xl border-2 border-dashed border-stone-300">
              <p className="text-lg font-medium">Tidak ada barang ditemukan.</p>
            </div>
          ) : (
            displayItems.map((item, index) => (
              <div
                key={`${item.id}-${index}`}
                className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-stone-300 group"
              >
                {/* Placeholder Image */}
                <div className="h-48 bg-stone-200 flex items-center justify-center group-hover:bg-stone-100 transition-colors">
                  <span className="text-5xl drop-shadow-sm">📦</span>
                </div>
                
                <div className="p-5">
                  <h3 className="text-lg font-bold text-stone-900 mb-1 truncate">
                    {item.name}
                  </h3>
                  <p className="text-sm font-medium text-stone-600 mb-4 flex items-center gap-1">
                    <span className="inline-block w-2 h-2 rounded-full bg-orange-500"></span>
                    {item.location}
                  </p>
                  
                  <div className="flex items-end justify-between pt-3 border-t border-stone-100">
                    <div>
                      <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Stok</p>
                      <p className="text-2xl font-extrabold text-orange-600">
                        {formatNumber(item.quantity)} <span className="text-sm font-bold text-stone-600">{item.unit}</span>
                      </p>
                    </div>
                    
                    {filterLocation !== "Semua" && (
                      <button
                        onClick={() => handleOrderClick(item)}
                        className="px-4 py-2 bg-stone-900 text-white text-sm font-bold rounded-lg hover:bg-stone-800 transition-colors shadow-sm"
                      >
                        Pesan
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      {/* Order Modal */}
      {orderingItem && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="bg-stone-900 px-6 py-4 flex justify-between items-center">
              <h3 className="text-lg font-bold text-white">Pesan Barang</h3>
              <button 
                onClick={() => setOrderingItem(null)}
                className="text-stone-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleConfirmOrder} className="p-6">
              <div className="mb-6">
                <p className="text-sm text-stone-500 mb-1">Barang yang akan dipesan:</p>
                <h4 className="text-xl font-bold text-stone-900">{orderingItem.name}</h4>
                <p className="text-sm font-medium text-orange-600 mt-1">
                  Stok Tersedia: {formatNumber(orderingItem.quantity)} {orderingItem.unit}
                </p>
              </div>

              <div className="mb-8">
                <label className="block text-sm font-bold text-stone-800 mb-2">
                  Jumlah Pesanan
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="any"
                    value={orderQuantity}
                    onChange={(e) => setOrderQuantity(e.target.value)}
                    className="w-full pl-4 pr-16 py-3 border-2 border-stone-300 rounded-xl text-lg font-bold text-stone-900 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                    placeholder="0"
                    autoFocus
                    required
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-500 font-medium pointer-events-none select-none">
                    {orderingItem.unit}
                  </span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setOrderingItem(null)}
                  className="flex-1 py-3 border-2 border-stone-200 text-stone-600 font-bold rounded-xl hover:bg-stone-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-orange-600 text-white font-bold rounded-xl hover:bg-orange-700 shadow-md hover:shadow-lg transition-all"
                >
                  Konfirmasi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
