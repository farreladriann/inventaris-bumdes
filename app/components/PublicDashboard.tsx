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

  const displayItems = getDisplayItems();

  if (!isLoaded) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      {/* Header */}
      <header className="bg-white dark:bg-zinc-900 shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <h1 className="text-xl font-bold text-zinc-900 dark:text-white">
            Inventaris BUMDes
          </h1>
          <Link
            href="/admin"
            className="px-4 py-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-md text-sm font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
          >
            Login Admin
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filter */}
        <div className="mb-8">
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
            Filter Berdasarkan Padukuhan
          </label>
          <select
            value={filterLocation}
            onChange={(e) => setFilterLocation(e.target.value)}
            className="w-full sm:w-64 px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500 focus:outline-none"
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
            <div className="col-span-full text-center py-12 text-zinc-500 dark:text-zinc-400">
              Tidak ada barang ditemukan.
            </div>
          ) : (
            displayItems.map((item, index) => (
              <div
                key={`${item.id}-${index}`}
                className="bg-white dark:bg-zinc-900 rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden border border-zinc-200 dark:border-zinc-800"
              >
                {/* Placeholder Image */}
                <div className="h-48 bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                  <span className="text-4xl">📦</span>
                </div>
                
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-1 truncate">
                    {item.name}
                  </h3>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-3">
                    {item.location}
                  </p>
                  
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">Stok</p>
                      <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                        {item.quantity} <span className="text-sm font-normal text-zinc-500">{item.unit}</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
