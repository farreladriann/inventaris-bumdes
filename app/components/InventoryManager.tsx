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
      className="w-20 text-center border-2 border-stone-300 rounded px-2 py-1 bg-white text-stone-900 text-sm font-medium focus:border-orange-500 focus:ring-1 focus:ring-orange-500 focus:outline-none"
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
    <div className="w-full max-w-4xl mx-auto p-8 bg-white rounded-xl shadow-lg border border-stone-200 relative">
      <h2 className="text-3xl font-bold mb-8 text-stone-900 tracking-tight">
        Inventaris Dapur BUMDes
      </h2>

      {/* Add Item Form */}
      <form
        onSubmit={addItem}
        className="mb-10 p-6 bg-stone-100 rounded-xl border border-stone-300 shadow-sm"
      >
        <h3 className="text-lg font-bold mb-5 text-stone-800 flex items-center gap-2">
          <span className="text-orange-600 text-xl">+</span> Tambah Barang Baru
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
          <div className="md:col-span-3">
            <label
              htmlFor="location"
              className="block text-sm font-bold text-stone-700 mb-2"
            >
              Lokasi (Padukuhan)
            </label>
            <select
              id="location"
              value={newItemLocation}
              onChange={(e) => setNewItemLocation(e.target.value)}
              className="w-full px-4 py-2.5 border-2 border-stone-300 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 bg-white text-stone-900 font-medium"
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
              className="block text-sm font-bold text-stone-700 mb-2"
            >
              Nama Barang
            </label>
            <input
              type="text"
              id="name"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              className="w-full px-4 py-2.5 border-2 border-stone-300 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 bg-white text-stone-900 font-medium"
              placeholder="Contoh: Beras"
              required
            />
          </div>
          <div className="md:col-span-2">
            <label
              htmlFor="quantity"
              className="block text-sm font-bold text-stone-700 mb-2"
            >
              Jumlah
            </label>
            <input
              type="number"
              step="any"
              id="quantity"
              value={newItemQuantity}
              onChange={(e) => setNewItemQuantity(e.target.value)}
              className="w-full px-4 py-2.5 border-2 border-stone-300 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 bg-white text-stone-900 font-medium"
              placeholder="0"
              min="0"
              required
            />
          </div>
          <div className="md:col-span-2">
            <label
              htmlFor="unit"
              className="block text-sm font-bold text-stone-700 mb-2"
            >
              Satuan
            </label>
            <input
              type="text"
              id="unit"
              value={newItemUnit}
              onChange={(e) => setNewItemUnit(e.target.value)}
              className="w-full px-4 py-2.5 border-2 border-stone-300 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 bg-white text-stone-900 font-medium"
              placeholder="kg, pcs"
            />
          </div>
          <div className="md:col-span-1 flex items-end">
            <button
              type="submit"
              className="w-full h-[46px] bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-lg transition-all shadow-sm hover:shadow-md flex items-center justify-center text-xl"
            >
              +
            </button>
          </div>
        </div>
      </form>

      {/* Filter */}
      <div className="mb-6 flex items-center gap-4 p-4 bg-stone-50 rounded-lg border border-stone-200">
        <label className="text-sm font-bold text-stone-800">
          Filter Lokasi:
        </label>
        <select
          value={filterLocation}
          onChange={(e) => setFilterLocation(e.target.value)}
          className="px-4 py-2 border-2 border-stone-300 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 bg-white text-stone-900 font-medium"
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
      <div className="overflow-hidden rounded-xl border border-stone-300 shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-stone-100 border-b border-stone-300">
              <th className="py-4 px-6 text-sm font-bold text-stone-700 uppercase tracking-wider">
                Lokasi
              </th>
              <th className="py-4 px-6 text-sm font-bold text-stone-700 uppercase tracking-wider">
                Nama Barang
              </th>
              <th className="py-4 px-6 text-sm font-bold text-stone-700 uppercase tracking-wider text-center">
                Jumlah
              </th>
              <th className="py-4 px-6 text-sm font-bold text-stone-700 uppercase tracking-wider">
                Satuan
              </th>
              <th className="py-4 px-6 text-sm font-bold text-stone-700 uppercase tracking-wider text-right">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-200 bg-white">
            {filteredItems.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="py-12 text-center text-stone-500 font-medium"
                >
                  Tidak ada barang ditemukan.
                </td>
              </tr>
            ) : (
              filteredItems.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-stone-50 transition-colors group"
                >
                  <td className="py-4 px-6 text-sm text-stone-600 font-medium">
                    {item.location}
                  </td>
                  <td className="py-4 px-6 text-stone-900 font-semibold text-base">
                    {item.name}
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center justify-center gap-3">
                      <button
                        onClick={() => updateQuantity(item.id, -1)}
                        className="w-8 h-8 flex items-center justify-center rounded-full bg-stone-200 text-stone-700 hover:bg-stone-300 hover:text-stone-900 transition-colors font-bold shadow-sm"
                      >
                        -
                      </button>
                      <EditableQuantity
                        value={item.quantity}
                        onChange={(val) => setItemQuantity(item.id, val)}
                      />
                      <button
                        onClick={() => updateQuantity(item.id, 1)}
                        className="w-8 h-8 flex items-center justify-center rounded-full bg-stone-200 text-stone-700 hover:bg-stone-300 hover:text-stone-900 transition-colors font-bold shadow-sm"
                      >
                        +
                      </button>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-stone-600 font-medium">
                    {item.unit}
                  </td>
                  <td className="py-4 px-6 text-right">
                    <button
                      onClick={() => deleteItem(item.id)}
                      className="px-3 py-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md text-sm font-semibold transition-colors"
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
