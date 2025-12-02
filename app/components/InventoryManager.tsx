"use client";

import React, { useState, useEffect } from "react";

const EditableQuantity = ({
  value,
  onChange,
}: {
  value: number;
  onChange: (val: number) => void;
}) => {
  const [localValue, setLocalValue] = useState(value.toString());

  useEffect(() => {
    if (parseFloat(localValue) !== value) {
      setLocalValue(value.toString());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setLocalValue(val);
    const num = parseFloat(val);
    if (!isNaN(num)) {
      onChange(num);
    } else if (val === "") {
      onChange(0);
    }
  };

  return (
    <input
      type="number"
      step="any"
      value={localValue}
      onChange={handleChange}
      className="w-20 text-center border border-zinc-300 dark:border-zinc-600 rounded px-2 py-1 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-sm"
    />
  );
};

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

export default function InventoryManager() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  
  // Form State
  const [newItemName, setNewItemName] = useState("");
  const [newItemQuantity, setNewItemQuantity] = useState("");
  const [newItemUnit, setNewItemUnit] = useState("");
  const [newItemLocation, setNewItemLocation] = useState(LOCATIONS[0]);

  // Filter State
  const [filterLocation, setFilterLocation] = useState("Semua");

  // Load from localStorage on mount
  useEffect(() => {
    const savedItems = localStorage.getItem("kitchen-inventory");
    if (savedItems) {
      try {
        const parsed = JSON.parse(savedItems);
        // Migrate old items that might not have location
        const migrated = parsed.map((item: Record<string, unknown>) => ({
          ...item,
          location: (item.location as string) || LOCATIONS[0],
        }));
        setItems(migrated);
      } catch (e) {
        console.error("Failed to parse inventory from local storage", e);
      }
    }
    setIsLoaded(true);
  }, []);

  // Save to localStorage whenever items change
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("kitchen-inventory", JSON.stringify(items));
    }
  }, [items, isLoaded]);

  const addItem = (e: React.FormEvent) => {
    e.preventDefault();
    const qty = parseFloat(newItemQuantity);
    if (!newItemName || isNaN(qty)) return;

    // Check if item already exists in that location
    const existingItemIndex = items.findIndex(
      (item) =>
        item.name.toLowerCase() === newItemName.toLowerCase() &&
        item.location === newItemLocation &&
        item.unit === (newItemUnit || "pcs")
    );

    if (existingItemIndex > -1) {
      const updatedItems = [...items];
      updatedItems[existingItemIndex].quantity += qty;
      setItems(updatedItems);
    } else {
      const newItem: InventoryItem = {
        id: Date.now().toString(),
        name: newItemName,
        quantity: qty,
        unit: newItemUnit || "pcs",
        location: newItemLocation,
      };
      setItems([...items, newItem]);
    }

    setNewItemName("");
    setNewItemQuantity("");
    setNewItemUnit("");
  };

  const deleteItem = (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus barang ini?")) {
      setItems(items.filter((item) => item.id !== id));
    }
  };

  const updateQuantity = (id: string, delta: number) => {
    setItems(
      items.map((item) => {
        if (item.id === id) {
          const newQuantity = Math.max(0, item.quantity + delta);
          return { ...item, quantity: newQuantity };
        }
        return item;
      })
    );
  };

  const setItemQuantity = (id: string, quantity: number) => {
    setItems(
      items.map((item) => {
        if (item.id === id) {
          return { ...item, quantity: Math.max(0, quantity) };
        }
        return item;
      })
    );
  };

  const filteredItems = items.filter((item) => {
    if (filterLocation === "Semua") return true;
    return item.location === filterLocation;
  });

  if (!isLoaded) {
    return <div className="p-4">Loading inventory...</div>;
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-6 bg-white dark:bg-zinc-900 rounded-lg shadow-md relative">
      <h2 className="text-2xl font-bold mb-6 text-zinc-800 dark:text-zinc-100">
        Inventaris Dapur BUMDes
      </h2>

      {/* Add Item Form */}
      <form
        onSubmit={addItem}
        className="mb-8 p-4 bg-zinc-50 dark:bg-zinc-800 rounded-md border border-zinc-200 dark:border-zinc-700"
      >
        <h3 className="text-lg font-semibold mb-4 text-zinc-700 dark:text-zinc-200">
          Tambah Barang Baru
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-3">
            <label
              htmlFor="location"
              className="block text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-1"
            >
              Lokasi (Padukuhan)
            </label>
            <select
              id="location"
              value={newItemLocation}
              onChange={(e) => setNewItemLocation(e.target.value)}
              className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100"
            >
              {LOCATIONS.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
          </div>
          <div className="md:col-span-4">
            <label
              htmlFor="name"
              className="block text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-1"
            >
              Nama Barang
            </label>
            <input
              type="text"
              id="name"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100"
              placeholder="Contoh: Beras"
              required
            />
          </div>
          <div className="md:col-span-2">
            <label
              htmlFor="quantity"
              className="block text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-1"
            >
              Jumlah
            </label>
            <input
              type="number"
              step="any"
              id="quantity"
              value={newItemQuantity}
              onChange={(e) => setNewItemQuantity(e.target.value)}
              className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100"
              placeholder="0"
              min="0"
              required
            />
          </div>
          <div className="md:col-span-2">
            <label
              htmlFor="unit"
              className="block text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-1"
            >
              Satuan
            </label>
            <input
              type="text"
              id="unit"
              value={newItemUnit}
              onChange={(e) => setNewItemUnit(e.target.value)}
              className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100"
              placeholder="kg, pcs"
            />
          </div>
          <div className="md:col-span-1 flex items-end">
            <button
              type="submit"
              className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors"
            >
              +
            </button>
          </div>
        </div>
      </form>

      {/* Filter */}
      <div className="mb-4 flex items-center gap-4">
        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Filter Lokasi:
        </label>
        <select
          value={filterLocation}
          onChange={(e) => setFilterLocation(e.target.value)}
          className="px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100"
        >
          <option value="Semua">Semua Padukuhan</option>
          {LOCATIONS.map((loc) => (
            <option key={loc} value={loc}>
              {loc}
            </option>
          ))}
        </select>
      </div>

      {/* Inventory List */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50">
              <th className="py-3 px-4 text-sm font-semibold text-zinc-600 dark:text-zinc-400">
                Lokasi
              </th>
              <th className="py-3 px-4 text-sm font-semibold text-zinc-600 dark:text-zinc-400">
                Nama Barang
              </th>
              <th className="py-3 px-4 text-sm font-semibold text-zinc-600 dark:text-zinc-400 text-center">
                Jumlah
              </th>
              <th className="py-3 px-4 text-sm font-semibold text-zinc-600 dark:text-zinc-400">
                Satuan
              </th>
              <th className="py-3 px-4 text-sm font-semibold text-zinc-600 dark:text-zinc-400 text-right">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="py-8 text-center text-zinc-500 dark:text-zinc-400"
                >
                  Tidak ada barang ditemukan.
                </td>
              </tr>
            ) : (
              filteredItems.map((item) => (
                <tr
                  key={item.id}
                  className="border-b border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
                >
                  <td className="py-3 px-4 text-sm text-zinc-500 dark:text-zinc-400">
                    {item.location}
                  </td>
                  <td className="py-3 px-4 text-zinc-800 dark:text-zinc-200 font-medium">
                    {item.name}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.id, -1)}
                        className="w-6 h-6 flex items-center justify-center rounded-full bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-300 dark:hover:bg-zinc-600 transition-colors text-sm"
                      >
                        -
                      </button>
                      <EditableQuantity
                        value={item.quantity}
                        onChange={(val) => setItemQuantity(item.id, val)}
                      />
                      <button
                        onClick={() => updateQuantity(item.id, 1)}
                        className="w-6 h-6 flex items-center justify-center rounded-full bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-300 dark:hover:bg-zinc-600 transition-colors text-sm"
                      >
                        +
                      </button>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-zinc-600 dark:text-zinc-400">
                    {item.unit}
                  </td>
                  <td className="py-3 px-4 text-right flex justify-end gap-2">
                    <button
                      onClick={() => deleteItem(item.id)}
                      className="text-red-500 hover:text-red-700 text-sm font-medium transition-colors"
                    >
                      Hapus
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
