"use client";

import Navigation from '@/components/Navigation';
import { ShoppingCart, Trash2, ArrowRight, CheckCircle, Lock, Truck, Shield, XCircle, Plus, X } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/components/CartContext';
import { useToast } from '@/components/ToastContext';

const ESTIMATED_DELIVERY = '7-10 days';
const VALID_CODE = 'AURA10';
const DISCOUNT_AMOUNT = 500;

// Color data for pigmented shades (matching Aura page)
const shaderColors = [
  { id: "thar-grey", name: "Thar Grey", hex: "#898D8D" },
  { id: "amber-rust", name: "Amber Rust", hex: "#E89E6D" },
  { id: "pushkar-sunset", name: "Pushkar Sunset", hex: "#FF8674" },
  { id: "rose-quartz", name: "Rose Quartz", hex: "#E9A2B2" },
  { id: "jaisalmer-dune", name: "Jaisalmer Dune", hex: "#DDCBA4" },
  { id: "sandstone-dust", name: "Sandstone Dust", hex: "#CDA788" },
  { id: "udaipur-terracotta", name: "Udaipur Terracotta", hex: "#E8927C" },
  { id: "aravalli-green", name: "Aravalli Green", hex: "#9ABEAA" },
  { id: "kishangarh-lime", name: "Kishangarh Lime", hex: "#E9DF97" },
  { id: "almond-biege", name: "Almond Biege", hex: "#E0C6AD" },
  { id: "rajasthan-ochre", name: "Rajasthan Ochre", hex: "#FDBE87" },
  { id: "jodhpur-blue", name: "Jodhpur Blue", hex: "#B9D9EB" },
];

// Sample colors (including Natural White)
const sampleColors = [
  { id: "natural-white", name: "Natural White", hex: "#F5F5F5" },
  { id: "thar-grey", name: "Thar Grey", hex: "#898D8D" },
  { id: "amber-rust", name: "Amber Rust", hex: "#E89E6D" },
  { id: "pushkar-sunset", name: "Pushkar Sunset", hex: "#FF8674" },
  { id: "rose-quartz", name: "Rose Quartz", hex: "#E9A2B2" },
  { id: "jaisalmer-dune", name: "Jaisalmer Dune", hex: "#DDCBA4" },
  { id: "sandstone-dust", name: "Sandstone Dust", hex: "#CDA788" },
  { id: "udaipur-terracotta", name: "Udaipur Terracotta", hex: "#E8927C" },
  { id: "aravalli-green", name: "Aravalli Green", hex: "#9ABEAA" },
  { id: "kishangarh-lime", name: "Kishangarh Lime", hex: "#E9DF97" },
  { id: "almond-biege", name: "Almond Biege", hex: "#E0C6AD" },
  { id: "rajasthan-ochre", name: "Rajasthan Ochre", hex: "#FDBE87" },
  { id: "jodhpur-blue", name: "Jodhpur Blue", hex: "#B9D9EB" },
];

const samplePacks = [
  { size: 3, price: 1499, label: "3 Samples" },
  { size: 6, price: 2799, label: "6 Samples" },
  { size: 13, price: 4999, label: "12 + 1 Free" },
];

function EmptyCartSVG() {
  return (
    <svg width="180" height="180" viewBox="0 0 180 180" fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="90" cy="160" rx="60" ry="12" fill="#D4A574" fillOpacity="0.3" />
      <rect x="50" y="60" width="80" height="60" rx="20" fill="#fff" stroke="#8B7355" strokeWidth="4" />
      <rect x="65" y="75" width="50" height="30" rx="10" fill="#D4A574" />
      <circle cx="70" cy="130" r="10" fill="#8B7355" />
      <circle cx="110" cy="130" r="10" fill="#8B7355" />
    </svg>
  );
}

export default function CartPage() {
  const router = useRouter();
  const { cart, removeFromCart, updateQuantity, updateShadeQuantity, clearCart, addToCart } = useCart();
  const { showToast } = useToast();
  const [discountCode, setDiscountCode] = useState('');
  const [appliedCode, setAppliedCode] = useState('');
  const [discountFeedback, setDiscountFeedback] = useState('');
  const [expandedItemId, setExpandedItemId] = useState<number | null>(null);
  const [newShadeSelections, setNewShadeSelections] = useState<{[shadeId: string]: number}>({});
  const [showSampleModal, setShowSampleModal] = useState(false);
  const [selectedSamplePack, setSelectedSamplePack] = useState<3 | 6 | 13>(3);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [editingSampleItemId, setEditingSampleItemId] = useState<number | null>(null);
  const [showPigmentedModal, setShowPigmentedModal] = useState(false);
  const [editingPigmentedItemId, setEditingPigmentedItemId] = useState<number | null>(null);
  const quantityMap = Object.fromEntries(cart.map(item => [item.id, item.quantity]));

  const subtotal = cart.reduce((sum, item) => sum + item.price * quantityMap[item.id], 0);
  const discount = appliedCode === VALID_CODE ? DISCOUNT_AMOUNT : 0;
  const shipping = cart.length === 0 ? 0 : 0; // Placeholder, will be calculated at next step
  const total = subtotal - discount + shipping; // 5% GST already included in product prices

  const handleRemove = (id: number) => {
    removeFromCart(id);
    showToast('Removed from cart', 'info');
  };

  const handleQuantity = (id: number, delta: number) => {
    const current = quantityMap[id] || 1;
    const newQty = Math.max(1, current + delta);
    updateQuantity(id, newQty);
    showToast('Quantity updated', 'info');
  };

  const handleShadeQuantity = (itemId: number, shadeId: string, delta: number) => {
    const item = cart.find(i => i.id === itemId);
    if (!item || !item.shades) return;
    
    const shade = item.shades.find(s => s.shadeId === shadeId);
    if (!shade) return;
    
    const newQty = Math.max(0, shade.quantity + delta);
    updateShadeQuantity(itemId, shadeId, newQty);
    showToast('Shade quantity updated', 'info');
  };

  const handleAddMoreColors = (itemId: number) => {
    setExpandedItemId(itemId);
    setNewShadeSelections({});
  };

  const handleCloseColorSelector = () => {
    setExpandedItemId(null);
    setNewShadeSelections({});
  };

  const handleShadeSelection = (shadeId: string, quantity: number) => {
    setNewShadeSelections(prev => ({
      ...prev,
      [shadeId]: quantity
    }));
  };



  const handleEditPigmented = (itemId: number) => {
    const item = cart.find(i => i.id === itemId);
    if (!item || item.type !== 'wallputty' || item.variant !== 'pigmented') return;

    // Extract current shades and convert to selections format
    const currentSelections: {[shadeId: string]: number} = {};
    item.shades?.forEach(shade => {
      currentSelections[shade.shadeId] = shade.quantity;
    });

    setNewShadeSelections(currentSelections);
    setEditingPigmentedItemId(itemId);
    setShowPigmentedModal(true);
  };

  const handleUpdatePigmented = () => {
    if (!editingPigmentedItemId) return;

    const item = cart.find(i => i.id === editingPigmentedItemId);
    if (!item) return;

    // Get shades with quantities > 0
    const selectedShades = Object.entries(newShadeSelections)
      .filter(([_, qty]) => qty > 0)
      .map(([shadeId, qty]) => {
        const color = shaderColors.find(c => c.id === shadeId);
        return {
          shadeId,
          shadeName: color?.name || "",
          shadeHex: color?.hex || "",
          quantity: qty,
        };
      });

    // Calculate new total quantity
    const totalQuantity = selectedShades.reduce((sum, shade) => sum + shade.quantity, 0);

    // Create updated cart item
    const updatedItem = {
      ...item,
      shades: selectedShades,
      quantity: totalQuantity
    };

    // Remove old item and add updated item
    removeFromCart(editingPigmentedItemId);
    addToCart(updatedItem);
    
    setShowPigmentedModal(false);
    setEditingPigmentedItemId(null);
    setNewShadeSelections({});
    showToast('Pigmented colors updated successfully!', 'success');
  };

  // Mock Sample functions
  const handleSamplePackChange = (packSize: 3 | 6 | 13) => {
    setSelectedSamplePack(packSize);
    
    // If 12 + 1 Free pack selected, automatically select all colors
    if (packSize === 13) {
      setSelectedColors(sampleColors.map((color) => color.id));
    } else {
      // For 3 and 6 samples, clear all selections and let user choose manually
      setSelectedColors([]);
    }
  };

  const handleColorToggle = (colorId: string) => {
    if (selectedColors.includes(colorId)) {
      setSelectedColors(selectedColors.filter((id) => id !== colorId));
    } else {
      if (selectedColors.length < selectedSamplePack) {
        setSelectedColors([...selectedColors, colorId]);
      }
    }
  };

  const canEditSample = selectedColors.length === selectedSamplePack;

  const getSamplePrice = () => {
    const selectedPack = samplePacks.find((p) => p.size === selectedSamplePack);
    return selectedPack?.price || 0;
  };

  const handleEditSample = (itemId: number) => {
    const item = cart.find(i => i.id === itemId);
    if (!item || item.type !== 'sample') return;

    // Extract current colors from shades
    const currentColors = item.shades?.map(shade => shade.shadeId) || [];
    
    // Determine pack size based on current colors
    let packSize: 3 | 6 | 13 = 3;
    if (currentColors.length === 13) {
      packSize = 13;
    } else if (currentColors.length === 6) {
      packSize = 6;
    } else {
      packSize = 3;
    }

    setSelectedSamplePack(packSize);
    setSelectedColors(currentColors);
    setEditingSampleItemId(itemId);
    setShowSampleModal(true);
  };

  const handleUpdateSample = () => {
    if (!editingSampleItemId) return;

    const item = cart.find(i => i.id === editingSampleItemId);
    if (!item) return;

    // Create shades array from selected colors
    const selectedShades = selectedColors.map(colorId => {
      const color = sampleColors.find(c => c.id === colorId);
      return {
        shadeId: colorId,
        shadeName: color?.name || "",
        shadeHex: color?.hex || "",
        quantity: 1, // Each sample has quantity 1
      };
    });

    const selectedPack = samplePacks.find((p) => p.size === selectedSamplePack);
    
    const updatedItem = {
      ...item,
      name: selectedSamplePack === 13 
        ? "Mock Sample (12 + 1 Free Colors)" 
        : `Mock Sample (${selectedSamplePack} Colors)`,
      price: selectedPack?.price || 0,
      shades: selectedShades,
    };

    // Remove old item and add updated item
    removeFromCart(editingSampleItemId);
    addToCart(updatedItem);
    
    setShowSampleModal(false);
    setEditingSampleItemId(null);
    setSelectedColors([]);
    showToast('Sample updated successfully!', 'success');
  };

  const handleApplyCode = () => {
    if (discountCode.trim().toUpperCase() === VALID_CODE) {
      setAppliedCode(VALID_CODE);
      setDiscountFeedback('Discount applied!');
      showToast('Discount applied!', 'success');
    } else {
      setDiscountFeedback('Invalid code');
      showToast('Invalid code', 'error');
    }
  };

  const handleRemoveCode = () => {
    setAppliedCode('');
    setDiscountFeedback('');
    setDiscountCode('');
  };

  const handleClearCart = () => {
    clearCart();
    showToast('Cart cleared', 'info');
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#F5F2E8] via-[#F8F6F0] to-[#E6DCC0] font-sans relative overflow-hidden">
      <Navigation />

      <main className="flex-1 flex flex-col items-center py-8 px-4 md:px-0 relative z-10">
        <div className="w-full max-w-6xl mx-auto flex flex-col lg:flex-row gap-6 lg:gap-8 min-h-[70vh]">
          {/* Cart Items Section */}
          <div className="flex-1 flex flex-col">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
              <h1 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-[#5E4E06] to-[#8B7A1A] bg-clip-text text-transparent flex items-center gap-2">
                <ShoppingCart className="w-8 h-8 md:w-10 md:h-10 text-[#5E4E06]" />
                Your Cart
              </h1>
              {cart.length > 0 && (
                <button 
                  onClick={handleClearCart} 
                  className="flex items-center gap-1 text-red-600 hover:text-white hover:bg-red-600 px-3 py-2 rounded-lg border border-red-200 shadow-md transition-all duration-200 text-sm font-semibold cursor-pointer w-fit"
                >
                  <Trash2 className="w-4 h-4" /> Clear Cart
                </button>
              )}
            </div>

            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full py-16 animate-fade-in">
                <div className="relative">
                  <EmptyCartSVG />
                  <div className="absolute inset-0 bg-gradient-to-br from-[#D4AF37]/20 to-[#8B7A1A]/20 rounded-full blur-2xl animate-pulse"></div>
                </div>
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold bg-gradient-to-r from-[#5E4E06] to-[#8B7A1A] bg-clip-text text-transparent mt-8 mb-3 text-center">
                  Your cart is empty
                </h2>
                <p className="text-base md:text-lg text-[#5E4E06] mb-8 text-center max-w-md">
                  Start your journey to a beautiful, natural home.
                </p>
                <a 
                  href="/aura" 
                  className="group inline-flex items-center gap-2 px-8 md:px-10 py-3 md:py-4 bg-gradient-to-r from-[#5E4E06] to-[#8B7A1A] text-white font-bold rounded-full shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 text-lg md:text-xl cursor-pointer relative overflow-hidden"
                >
                  <span className="relative z-10">Shop Now</span>
                  <ArrowRight className="w-5 h-5 md:w-6 md:h-6 relative z-10 group-hover:translate-x-1 transition-transform" />
                  <div className="absolute inset-0 bg-gradient-to-r from-[#8B7A1A] to-[#B8A94A] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </a>
              </div>
            ) : (
              <>
                {/* Mobile stacked view (no horizontal scroll) */}
                <div className="sm:hidden space-y-4 animate-fade-in">
                  {cart.map(item => (
                    <div key={item.id} className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-[#D4AF37] p-4">
                      <div className="flex items-center gap-3">
                        <img src={item.image} alt={item.name} className="w-14 h-14 object-cover rounded-xl border border-[#D4AF37] shadow-md" />
                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-[#5E4E06] text-base truncate">{item.name}</div>
                          <div className="text-[#8B7A1A] text-xs">{item.subtitle}</div>
                        </div>
                        <button 
                          onClick={() => handleRemove(item.id)}
                          className="text-red-500 hover:text-white hover:bg-red-500 p-2 rounded-full border border-red-200 shadow-md transition-all duration-200 cursor-pointer"
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                                            {item.shades && item.shades.length > 0 && (
                        <div className="mt-3 space-y-2">
                          {item.shades.map(shade => (
                            <div key={shade.shadeId} className="flex items-center justify-between gap-2 p-2 bg-[#F5F2E8] rounded-lg">
                              <div className="flex items-center gap-2 flex-1">
                                <span className="inline-block w-4 h-4 rounded-full border border-[#D4AF37]" style={{ backgroundColor: shade.shadeHex }}></span>
                                <span className="font-medium text-sm">{shade.shadeName}</span>
                              </div>
                              {item.type === 'wallputty' && item.variant === 'pigmented' && (
                                <div className="flex items-center gap-1">
                                  <button 
                                    onClick={() => handleShadeQuantity(item.id, shade.shadeId, -1)}
                                    className="w-6 h-6 rounded-full bg-white text-[#5E4E06] font-bold flex items-center justify-center hover:bg-[#E6C866] transition-colors cursor-pointer"
                                  >
                                    -
                                  </button>
                                  <span className="w-8 text-center font-bold text-[#5E4E06] text-sm">{shade.quantity}</span>
                                  <button 
                                    onClick={() => handleShadeQuantity(item.id, shade.shadeId, 1)}
                                    className="w-6 h-6 rounded-full bg-white text-[#5E4E06] font-bold flex items-center justify-center hover:bg-[#E6C866] transition-colors cursor-pointer"
                                  >
                                    +
                                  </button>
                                </div>
                              )}
                            </div>
                          ))}
                          
                          {/* Add More Colors Button */}
                          <button
                            onClick={() => item.type === 'sample' ? handleEditSample(item.id) : handleEditPigmented(item.id)}
                            className="w-full mt-2 px-4 py-2 bg-gradient-to-r from-[#5E4E06] to-[#8B7A1A] text-white font-semibold rounded-lg hover:bg-[#3D3204] transition-colors cursor-pointer flex items-center justify-center gap-2"
                          >
                            <Plus className="w-4 h-4" />
                            {item.type === 'sample' ? 'Edit Colors' : 'Edit Colors'}
                          </button>
                        </div>
                      )}
                      
                      {/* Color Selector Modal */}
                      {expandedItemId === item.id && (
                        <div className="mt-4 p-6 bg-gradient-to-br from-[#F8F6F0] to-[#F0EDE4] rounded-xl border border-[#D4AF37]">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-[#5E4E06] text-lg">Add More Colors</h3>
                            <button
                              onClick={handleCloseColorSelector}
                              className="text-[#8B7A1A] hover:text-[#5E4E06] transition-colors"
                            >
                              <X className="w-5 h-5" />
                            </button>
                          </div>
                          
                          {/* Color Selection Summary */}
                          <div className="mb-4 p-4 bg-white rounded-lg border border-[#E8E4D8]">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm text-[#5E4E06] font-semibold">
                                  Select your perfect shades
                                </p>
                              </div>
                              <div className="text-right">
                                <div className="text-sm text-gray-600">
                                  Selected: {Object.entries(newShadeSelections).filter(([_, qty]) => qty > 0).length} colors
                                </div>
                                <div className="text-sm font-bold text-[#5E4E06]">
                                  ₹689 per pack
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Color Swatches */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                            {shaderColors.map((color) => {
                              const selectedQty = newShadeSelections[color.id] || 0;
                              return (
                                <div
                                  key={color.id}
                                  className={`group relative overflow-hidden rounded-xl border-2 transition-all duration-300 ${
                                    selectedQty > 0
                                      ? "border-[#5E4E06] shadow-lg"
                                      : "border-gray-200 hover:border-[#5E4E06] hover:shadow-md"
                                  }`}
                                >
                                  {/* Color Swatch */}
                                  <div
                                    className="h-20 w-full relative"
                                    style={{ background: color.hex }}
                                  >
                                    {/* Overlay on hover */}
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300"></div>

                                    {/* Selected indicator */}
                                    {selectedQty > 0 && (
                                      <div className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-lg">
                                        <CheckCircle className="w-4 h-4 text-[#5E4E06]" />
                                      </div>
                                    )}
                                  </div>

                                  {/* Color Info */}
                                  <div className="p-3 bg-white">
                                    <div className="flex items-center justify-between mb-2">
                                      <div>
                                        <h4 className="font-bold text-gray-900 text-sm">
                                          {color.name}
                                        </h4>
                                        <p className="text-xs text-gray-500">
                                          Natural shade
                                        </p>
                                      </div>
                                      {selectedQty > 0 && (
                                        <div className="text-right">
                                          <div className="text-sm font-bold text-[#5E4E06]">
                                            ₹{(selectedQty * 689).toLocaleString()}
                                          </div>
                                        </div>
                                      )}
                                    </div>

                                    {/* Quantity Selector */}
                                    <div className="flex items-center gap-2">
                                      <button
                                        type="button"
                                        className="w-7 h-7 flex items-center justify-center rounded-full bg-gray-100 text-gray-600 font-bold hover:bg-[#5E4E06] hover:text-white transition-all duration-200 disabled:opacity-50 cursor-pointer text-sm"
                                        onClick={() => handleShadeSelection(color.id, Math.max((newShadeSelections[color.id] || 0) - 1, 0))}
                                        disabled={selectedQty === 0}
                                      >
                                        -
                                      </button>
                                      <div className="flex-1 text-center">
                                        <input
                                          type="number"
                                          min={0}
                                          value={selectedQty}
                                          onChange={(e) => {
                                            const val = Math.max(Number(e.target.value), 0);
                                            handleShadeSelection(color.id, val);
                                          }}
                                          className="w-full text-center border-2 border-gray-200 rounded-lg py-1 font-bold text-sm focus:ring-2 focus:ring-[#5E4E06] focus:border-[#5E4E06]"
                                          placeholder="0"
                                        />
                                      </div>
                                      <button
                                        type="button"
                                        className="w-7 h-7 flex items-center justify-center rounded-full bg-[#5E4E06] text-white font-bold hover:bg-[#8B7A1A] transition-all duration-200 cursor-pointer text-sm"
                                        onClick={() => handleShadeSelection(color.id, (newShadeSelections[color.id] || 0) + 1)}
                                      >
                                        +
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                          {/* Quick Summary */}
                          {Object.entries(newShadeSelections).filter(([_, qty]) => qty > 0).length > 0 && (
                            <div className="bg-white rounded-xl p-4 border border-[#E8E4D8] mb-4">
                              <div className="flex items-center justify-between mb-3">
                                <h4 className="text-lg font-bold text-gray-900">Your New Selection</h4>
                                <div className="text-sm text-gray-600">
                                  {Object.values(newShadeSelections).reduce((sum, qty) => sum + qty, 0)} packs selected
                                </div>
                              </div>

                              {/* Color chips */}
                              <div className="flex flex-wrap gap-2 mb-3">
                                {Object.entries(newShadeSelections)
                                  .filter(([_, qty]) => qty > 0)
                                  .map(([shadeId, qty]) => {
                                    const color = shaderColors.find((c) => c.id === shadeId);
                                    return (
                                      <div
                                        key={shadeId}
                                        className="flex items-center gap-2 bg-[#F8F6F0] px-3 py-2 rounded-full border border-[#E8E4D8] shadow-sm"
                                      >
                                        <span
                                          className="w-4 h-4 rounded-full"
                                          style={{ background: color?.hex }}
                                        ></span>
                                        <span className="text-sm font-medium text-gray-700">
                                          {color?.name}
                                        </span>
                                        <span className="text-xs text-gray-500">
                                          ×{qty}
                                        </span>
                                      </div>
                                    );
                                  })}
                              </div>

                              {/* Total */}
                              <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                                <span className="text-base font-bold text-gray-900">Total</span>
                                <span className="text-lg font-black text-[#5E4E06]">
                                  ₹{(Object.values(newShadeSelections).reduce((sum, qty) => sum + qty, 0) * 689).toLocaleString()}
                                </span>
                              </div>
                            </div>
                          )}

                          <div className="flex gap-2">
                            <button
                              onClick={() => handleAddMoreColors(item.id)}
                              className="flex-1 px-4 py-2 bg-gradient-to-r from-[#5E4E06] to-[#8B7A1A] text-white font-semibold rounded-lg hover:bg-[#3D3204] transition-colors cursor-pointer"
                              disabled={Object.values(newShadeSelections).every(qty => qty === 0)}
                            >
                              Add Colors
                            </button>
                            <button
                              onClick={handleCloseColorSelector}
                              className="px-4 py-2 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors cursor-pointer"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                      
                      {(!item.shades || item.shades.length === 0) && (
                        <div className="mt-4 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={() => handleQuantity(item.id, -1)}
                              className="w-7 h-7 rounded-full bg-[#F5F2E8] text-[#5E4E06] font-bold flex items-center justify-center hover:bg-[#E6C866] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                              disabled={quantityMap[item.id] <= 1}
                            >
                              -
                            </button>
                            <input
                              type="number"
                              min={1}
                              value={quantityMap[item.id]}
                              onChange={e => {
                                const val = Math.max(1, parseInt(e.target.value) || 1);
                                handleQuantity(item.id, val - (quantityMap[item.id] || 1));
                              }}
                              className="w-14 text-center font-bold text-[#5E4E06] bg-white border border-[#D4AF37] rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-[#8B7A1A] transition text-sm"
                            />
                            <button 
                              onClick={() => handleQuantity(item.id, 1)}
                              className="w-7 h-7 rounded-full bg-[#F5F2E8] text-[#5E4E06] font-bold flex items-center justify-center hover:bg-[#E6C866] transition-colors cursor-pointer"
                            >
                              +
                            </button>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-[#5E4E06]">₹{item.price}</div>
                            <div className="font-bold text-[#5E4E06] text-sm">Total: ₹{item.price * quantityMap[item.id]}</div>
                          </div>
                        </div>
                      )}
                      {item.shades && item.shades.length > 0 && (
                        <div className="mt-4 text-right">
                          <div className="font-bold text-[#5E4E06]">₹{item.price} per unit</div>
                          <div className="font-bold text-[#5E4E06] text-sm">Total: ₹{item.price * quantityMap[item.id]}</div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Desktop/tablet table view */}
                <div className="hidden sm:block overflow-x-auto rounded-2xl shadow-xl bg-white/95 backdrop-blur-sm border border-[#D4AF37] animate-fade-in">
                  <table className="min-w-full divide-y divide-[#D4AF37]">
                    <thead>
                      <tr className="bg-gradient-to-r from-[#F5F2E8] to-[#E6DCC0]">
                        <th className="px-3 md:px-4 py-3 text-left text-xs font-bold text-[#5E4E06] uppercase">Product</th>
                        <th className="px-3 md:px-4 py-3 text-left text-xs font-bold text-[#5E4E06] uppercase">Qty</th>
                        <th className="px-3 md:px-4 py-3 text-left text-xs font-bold text-[#5E4E06] uppercase">Price</th>
                        <th className="px-3 md:px-4 py-3 text-left text-xs font-bold text-[#5E4E06] uppercase">Total</th>
                        <th className="px-3 md:px-4 py-3"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {cart.map(item => (
                        <tr key={item.id} className="hover:bg-[#F5F2E8]/50 transition-all duration-200">
                          <td className="flex items-center gap-3 md:gap-4 px-3 md:px-4 py-4">
                            <img src={item.image} alt={item.name} className="w-12 h-12 md:w-16 md:h-16 object-cover rounded-xl border border-[#D4AF37] shadow-md" />
                            <div className="min-w-0 flex-1">
                              <div className="font-bold text-[#5E4E06] text-sm md:text-base truncate">{item.name}</div>
                              <div className="text-[#8B7A1A] text-xs md:text-sm">{item.subtitle}</div>
                                                            {item.shades && item.shades.length > 0 && (
                                <div className="mt-2 space-y-2">
                                  {item.shades.map((shade, idx) => (
                                    <div key={shade.shadeId} className="flex items-center justify-between gap-2 p-2 bg-[#F5F2E8] rounded-lg">
                                      <div className="flex items-center gap-2 flex-1">
                                        <span className="inline-block w-4 h-4 rounded-full border border-[#D4AF37]" style={{ backgroundColor: shade.shadeHex }}></span>
                                        <span className="font-medium text-xs md:text-sm">{shade.shadeName}</span>
                                      </div>
                                      {item.type === 'wallputty' && item.variant === 'pigmented' && (
                                        <div className="flex items-center gap-1">
                                          <button 
                                            onClick={() => handleShadeQuantity(item.id, shade.shadeId, -1)}
                                            className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-white text-[#5E4E06] font-bold flex items-center justify-center hover:bg-[#E6C866] transition-colors cursor-pointer text-xs"
                                          >
                                            -
                                          </button>
                                          <span className="w-6 md:w-8 text-center font-bold text-[#5E4E06] text-xs md:text-sm">{shade.quantity}</span>
                                          <button 
                                            onClick={() => handleShadeQuantity(item.id, shade.shadeId, 1)}
                                            className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-white text-[#5E4E06] font-bold flex items-center justify-center hover:bg-[#E6C866] transition-colors cursor-pointer text-xs"
                                          >
                                            +
                                          </button>
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                  
                                  {/* Add More Colors Button */}
                                  <button
                                    onClick={() => item.type === 'sample' ? handleEditSample(item.id) : handleEditPigmented(item.id)}
                                    className="w-full px-3 py-2 bg-gradient-to-r from-[#5E4E06] to-[#8B7A1A] text-white font-semibold rounded-lg hover:bg-[#3D3204] transition-colors cursor-pointer flex items-center justify-center gap-2 text-sm"
                                  >
                                    <Plus className="w-4 h-4" />
                                    {item.type === 'sample' ? 'Edit Colors' : 'Edit Colors'}
                                  </button>
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-3 md:px-4 py-4">
                            {(!item.shades || item.shades.length === 0) ? (
                              <div className="flex items-center gap-1 md:gap-2">
                                <button 
                                  onClick={() => handleQuantity(item.id, -1)} 
                                  className="w-6 h-6 md:w-7 md:h-7 rounded-full bg-[#F5F2E8] text-[#5E4E06] font-bold flex items-center justify-center hover:bg-[#E6C866] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed" 
                                  disabled={quantityMap[item.id] <= 1}
                                >
                                  -
                                </button>
                                <input
                                  type="number"
                                  min={1}
                                  value={quantityMap[item.id]}
                                  onChange={e => {
                                    const val = Math.max(1, parseInt(e.target.value) || 1);
                                    handleQuantity(item.id, val - (quantityMap[item.id] || 1));
                                  }}
                                  className="w-12 md:w-16 text-center font-bold text-[#5E4E06] bg-white border border-[#D4AF37] rounded-lg px-1 md:px-2 py-1 focus:outline-none focus:ring-2 focus:ring-[#8B7A1A] transition text-sm"
                                />
                                <button 
                                  onClick={() => handleQuantity(item.id, 1)} 
                                  className="w-6 h-6 md:w-7 md:h-7 rounded-full bg-[#F5F2E8] text-[#5E4E06] font-bold flex items-center justify-center hover:bg-[#E6C866] transition-colors cursor-pointer"
                                >
                                  +
                                </button>
                              </div>
                            ) : (
                              <div className="text-center">
                                <div className="font-bold text-[#5E4E06] text-sm md:text-base">{quantityMap[item.id]}</div>
                                <div className="text-[#8B7A1A] text-xs">Total</div>
                              </div>
                            )}
                          </td>
                          <td className="px-3 md:px-4 py-4 font-bold text-[#5E4E06] text-sm md:text-base">₹{item.price}</td>
                          <td className="px-3 md:px-4 py-4 font-bold text-[#5E4E06] text-sm md:text-base">₹{item.price * quantityMap[item.id]}</td>
                          <td className="px-3 md:px-4 py-4">
                            <button 
                              onClick={() => handleRemove(item.id)} 
                              className="text-red-500 hover:text-white hover:bg-red-500 p-1.5 md:p-2 rounded-full border border-red-200 shadow-md transition-all duration-200 cursor-pointer" 
                              aria-label="Remove item"
                            >
                              <Trash2 className="w-4 h-4 md:w-5 md:h-5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {/* Discount Code Section */}
            {cart.length > 0 && (
              <div className="mt-6 md:mt-8 flex flex-col sm:flex-row items-start sm:items-center gap-4 animate-fade-in">
                <div className="flex-1 flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full">
                  <input
                    type="text"
                    placeholder="Discount code"
                    value={appliedCode ? appliedCode : discountCode}
                    onChange={e => { setDiscountCode(e.target.value); setDiscountFeedback(''); }}
                    disabled={!!appliedCode}
                    className="px-4 py-3 rounded-lg border border-[#D4AF37] bg-white/90 text-[#5E4E06] font-semibold focus:outline-none focus:ring-2 focus:ring-[#8B7A1A] transition w-full sm:w-64 placeholder:text-[#8B7A1A] placeholder:font-medium"
                  />
                  {appliedCode ? (
                    <button 
                      onClick={handleRemoveCode} 
                      className="flex items-center gap-1 px-4 py-3 rounded-lg bg-red-100 text-red-600 font-bold hover:bg-red-500 hover:text-white transition-colors cursor-pointer w-full sm:w-auto"
                    >
                      <XCircle className="w-4 h-4" /> Remove
                    </button>
                  ) : (
                    <button 
                      onClick={handleApplyCode} 
                      className="px-4 py-3 rounded-lg bg-[#5E4E06] text-white font-bold hover:bg-[#3D3204] transition-colors cursor-pointer w-full sm:w-auto"
                    >
                      Apply
                    </button>
                  )}
                </div>
                {discountFeedback && (
                  <span className={`text-sm font-semibold ${discountFeedback === 'Discount applied!' ? 'text-green-600' : 'text-red-500'}`}>
                    {discountFeedback}
                  </span>
                )}
                {appliedCode && (
                  <span className="text-green-600 text-sm font-semibold flex items-center gap-1">
                    <CheckCircle className="w-4 h-4" /> Applied
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Order Summary Section */}
          <div className="w-full lg:w-96 flex-shrink-0 lg:sticky lg:top-32 h-fit bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl border border-[#D4AF37] p-6 md:p-8 flex flex-col gap-6 md:gap-8 mt-8 lg:mt-0 mx-auto lg:mx-0 animate-fade-in">
            <h2 className="text-xl md:text-2xl font-extrabold bg-gradient-to-r from-[#5E4E06] to-[#8B7A1A] bg-clip-text text-transparent mb-2 flex items-center gap-3">
              <ShoppingCart className="w-6 h-6 md:w-7 md:h-7 text-[#5E4E06]" /> Order Summary
            </h2>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-[#8B7A1A]">Subtotal</span>
                <span className="font-bold text-[#5E4E06]">₹{subtotal}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount ({appliedCode})</span>
                  <span>-₹{discount}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-[#8B7A1A]">Shipping</span>
                <span className="font-bold text-[#5E4E06]">Pending</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8B7A1A]">GST (5% included)</span>
                <span className="font-bold text-[#5E4E06]">Included</span>
              </div>
              <div className="flex justify-between border-t border-[#D4AF37] pt-3 mt-3">
                <span className="text-lg md:text-xl font-extrabold text-[#5E4E06]">Total</span>
                <span className="text-lg md:text-xl font-extrabold text-[#5E4E06]">₹{total}</span>
              </div>
            </div>

            <button
              onClick={() => {
                // Set checkout flow flag before proceeding
                localStorage.setItem('checkoutFlow', 'true');
                router.push('/address');
              }}
              className="group mt-2 px-6 py-3 bg-gradient-to-r from-[#5E4E06] to-[#8B7A1A] text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 text-base md:text-lg flex items-center gap-2 justify-center disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer relative overflow-hidden"
              disabled={cart.length === 0}
            >
              <span className="relative z-10">Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4 md:w-5 md:h-5 relative z-10 group-hover:translate-x-1 transition-transform" />
              <div className="absolute inset-0 bg-gradient-to-r from-[#8B7A1A] to-[#B8A94A] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>

            <div className="flex flex-col gap-3 mt-4">
              <div className="flex items-center gap-2 text-[#5E4E06] font-semibold text-sm md:text-base">
                <Shield className="w-4 h-4 md:w-5 md:h-5" /> Eco-Friendly Packaging
              </div>
              <div className="flex items-center gap-2 text-[#8B7A1A] font-semibold text-sm md:text-base">
                <Lock className="w-4 h-4 md:w-5 md:h-5" /> 100% Secure Payment
              </div>
              <div className="flex items-center gap-2 text-[#8B7A1A] font-semibold text-sm md:text-base">
                <CheckCircle className="w-4 h-4 md:w-5 md:h-5" /> Delivery: {ESTIMATED_DELIVERY}
              </div>
            </div>
            
            <p className="text-xs text-[#8B7A1A] text-center mt-2">Inclusive of all taxes</p>
            
            {/* Shipping Information Note */}
            <div className="mt-4 p-3 bg-gradient-to-r from-[#FFF8DC] to-[#F0E68C] rounded-lg border border-[#D4AF37]">
              <p className="text-xs text-[#5E4E06] font-semibold mb-1">📦 Shipping Information</p>
              <p className="text-xs text-[#8B7A1A]">
                Shipping charges will be calculated separately and collected as cash on delivery. We negotiate with multiple transport companies to provide you the best rates.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Mock Sample Modal */}
      {showSampleModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-6xl w-full max-h-[90vh] sm:max-h-[85vh] overflow-hidden mb-16 sm:mb-20 flex flex-col">
            {/* Modal Header - Fixed */}
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 sm:p-6 flex items-center justify-between rounded-t-3xl z-20 flex-shrink-0">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-[#2A2418]">
                  {editingSampleItemId ? 'Edit Mock Sample' : 'Mock Sample Boards'}
                </h2>
                <p className="text-sm sm:text-base text-gray-600">Choose your perfect colors</p>
              </div>
              <button
                onClick={() => {
                  setShowSampleModal(false);
                  setEditingSampleItemId(null);
                  setSelectedColors([]);
                }}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6 text-gray-500" />
              </button>
            </div>

            {/* Modal Content - Scrollable */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                {/* Sample Pack Selection - Tabs */}
                <div>
                  <h3 className="text-lg font-bold text-[#2A2418] mb-4">Choose Sample Pack</h3>
                  <div className="flex bg-gradient-to-r from-[#F8F6F0] to-[#F0EDE4] rounded-xl p-1 mb-4 border border-[#E8E4D8]">
                    {samplePacks.map((pack) => (
                      <button
                        key={pack.size}
                        onClick={() => handleSamplePackChange(pack.size as 3 | 6 | 13)}
                        className={`flex-1 px-4 py-3 rounded-lg font-bold transition-all duration-300 focus:outline-none cursor-pointer text-center ${
                          selectedSamplePack === pack.size
                            ? "bg-gradient-to-r from-[#5E4E06] to-[#8B7A1A] text-white shadow-lg transform scale-105"
                            : "text-[#2A2418] hover:bg-white/50 hover:text-[#5E4E06] hover:shadow-md"
                        }`}
                      >
                        <div className="text-sm font-bold">{pack.label}</div>
                        <div className={`text-lg ${selectedSamplePack === pack.size ? "text-[#E6C866]" : "text-[#5E4E06]"}`}>₹{pack.price}</div>
                      </button>
                    ))}
                  </div>
                  <p className="text-sm text-gray-600">
                    {selectedSamplePack === 13
                      ? "All 12 colors + 1 Free Natural White will be automatically selected"
                      : `Select ${selectedSamplePack} colors from the options below`}
                  </p>
                </div>

                {/* Color Selection */}
                <div>
                  <h3 className="text-lg font-bold text-[#2A2418] mb-4">
                    Select Colors ({selectedColors.length}/{selectedSamplePack})
                  </h3>
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
                    {sampleColors.map((color) => (
                      <button
                        key={color.id}
                        onClick={() => handleColorToggle(color.id)}
                        disabled={
                          !selectedColors.includes(color.id) &&
                          selectedColors.length >= selectedSamplePack
                        }
                        className={`group relative flex flex-col items-center p-3 rounded-xl border-2 transition-all duration-300 focus:outline-none ${
                          selectedColors.includes(color.id)
                            ? "border-[#5E4E06] bg-gradient-to-r from-[#F8F6F0] to-[#F0EDE4] scale-105 cursor-pointer"
                            : selectedColors.length >= selectedSamplePack
                            ? "border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed"
                            : "border-gray-200 bg-white hover:border-[#5E4E06] hover:shadow-md cursor-pointer"
                        }`}
                      >
                        <div
                          className={`w-16 h-16 rounded-full mb-3 shadow-md border-2 border-white ${
                            selectedColors.includes(color.id) ? "ring-2 ring-[#5E4E06]" : ""
                          }`}
                          style={{ backgroundColor: color.hex }}
                        />
                        <span className="text-xs font-semibold text-gray-800 text-center leading-tight">
                          {color.name}
                        </span>
                        {/* Free tag for Natural White - only show for 12 + 1 Free pack */}
                        {color.id === "natural-white" && selectedSamplePack === 13 && (
                          <div className="absolute top-1 left-1 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                            FREE
                          </div>
                        )}
                        {selectedColors.includes(color.id) && (
                          <div className="absolute top-1 right-1 w-6 h-6 bg-[#5E4E06] rounded-full flex items-center justify-center">
                            <CheckCircle className="w-4 h-4 text-white" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer - Fixed */}
            <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 sm:p-6 flex-shrink-0 z-20">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="text-center sm:text-left">
                  <div className="text-xl sm:text-2xl font-bold text-[#5E4E06]">₹{getSamplePrice()}</div>
                  <div className="text-xs sm:text-sm text-gray-600">Inclusive of all taxes</div>
                </div>
                <button
                  onClick={editingSampleItemId ? handleUpdateSample : undefined}
                  disabled={!canEditSample}
                  className={`w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 font-bold rounded-xl shadow-lg transition-all duration-300 flex items-center justify-center gap-3 text-sm sm:text-base ${
                    canEditSample
                      ? "bg-gradient-to-r from-[#5E4E06] to-[#8B7A1A] text-white hover:shadow-xl hover:scale-105 cursor-pointer"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                  {!canEditSample
                    ? `Select ${selectedSamplePack - selectedColors.length} more color${
                        selectedSamplePack - selectedColors.length === 1 ? "" : "s"
                      }`
                    : editingSampleItemId
                    ? "Update Sample"
                    : "Add to Cart"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pigmented Color Selection Modal */}
      {showPigmentedModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-6xl w-full max-h-[90vh] sm:max-h-[85vh] overflow-hidden mb-16 sm:mb-20 flex flex-col">
            {/* Modal Header - Fixed */}
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 sm:p-6 flex items-center justify-between rounded-t-3xl z-20 flex-shrink-0">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-[#2A2418]">Edit Pigmented Colors</h2>
                <p className="text-sm sm:text-base text-gray-600">Select your perfect shades</p>
              </div>
              <button
                onClick={() => {
                  setShowPigmentedModal(false);
                  setEditingPigmentedItemId(null);
                  setNewShadeSelections({});
                }}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6 text-gray-500" />
              </button>
            </div>

            {/* Modal Content - Scrollable */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                {/* Color Selection Summary */}
                <div className="bg-gradient-to-br from-[#F8F6F0] to-[#F0EDE4] rounded-xl p-6 border border-[#E8E4D8]">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-[#2A2418] mb-2">
                        Select your perfect shades
                      </h3>
                      <p className="text-sm text-[#5E4E06]">
                        Choose quantities for each color you want
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-600">
                        Selected: {Object.entries(newShadeSelections).filter(([_, qty]) => qty > 0).length} colors
                      </div>
                      <div className="text-lg font-bold text-[#5E4E06]">
                        ₹689 per pack
                      </div>
                    </div>
                  </div>
                </div>

                {/* Color Swatches */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {shaderColors.map((color) => {
                    const selectedQty = newShadeSelections[color.id] || 0;
                    return (
                      <div
                        key={color.id}
                        className={`group relative overflow-hidden rounded-xl border-2 transition-all duration-300 ${
                          selectedQty > 0
                            ? "border-[#5E4E06] shadow-lg"
                            : "border-gray-200 hover:border-[#5E4E06] hover:shadow-md"
                        }`}
                      >
                        {/* Color Swatch */}
                        <div
                          className="h-24 w-full relative"
                          style={{ background: color.hex }}
                        >
                          {/* Overlay on hover */}
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300"></div>

                          {/* Selected indicator */}
                          {selectedQty > 0 && (
                            <div className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-lg">
                              <CheckCircle className="w-4 h-4 text-[#5E4E06]" />
                            </div>
                          )}
                        </div>

                        {/* Color Info */}
                        <div className="p-4 bg-white">
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <h4 className="font-bold text-gray-900">
                                {color.name}
                              </h4>
                              <p className="text-xs text-gray-500">
                                Natural shade
                              </p>
                            </div>
                            {selectedQty > 0 && (
                              <div className="text-right">
                                <div className="text-sm font-bold text-[#5E4E06]">
                                  ₹{(selectedQty * 689).toLocaleString()}
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Quantity Selector */}
                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-600 font-bold hover:bg-[#5E4E06] hover:text-white transition-all duration-200 disabled:opacity-50 cursor-pointer"
                              onClick={() => handleShadeSelection(color.id, Math.max((newShadeSelections[color.id] || 0) - 1, 0))}
                              disabled={selectedQty === 0}
                            >
                              -
                            </button>
                            <div className="flex-1 text-center">
                              <input
                                type="number"
                                min={0}
                                value={selectedQty}
                                onChange={(e) => {
                                  const val = Math.max(Number(e.target.value), 0);
                                  handleShadeSelection(color.id, val);
                                }}
                                className="w-full text-center border-2 border-gray-200 rounded-lg py-2 font-bold text-sm focus:ring-2 focus:ring-[#5E4E06] focus:border-[#5E4E06]"
                                placeholder="0"
                              />
                            </div>
                            <button
                              type="button"
                              className="w-8 h-8 flex items-center justify-center rounded-full bg-[#5E4E06] text-white font-bold hover:bg-[#8B7A1A] transition-all duration-200 cursor-pointer"
                              onClick={() => handleShadeSelection(color.id, (newShadeSelections[color.id] || 0) + 1)}
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Quick Summary */}
                {Object.entries(newShadeSelections).filter(([_, qty]) => qty > 0).length > 0 && (
                  <div className="bg-gradient-to-br from-[#F8F6F0] to-[#F0EDE4] rounded-xl p-6 border border-[#E8E4D8]">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-xl font-bold text-gray-900">Your Selection</h4>
                      <div className="text-sm text-gray-600">
                        {Object.values(newShadeSelections).reduce((sum, qty) => sum + qty, 0)} packs selected
                      </div>
                    </div>

                    {/* Color chips */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {Object.entries(newShadeSelections)
                        .filter(([_, qty]) => qty > 0)
                        .map(([shadeId, qty]) => {
                          const color = shaderColors.find((c) => c.id === shadeId);
                          return (
                            <div
                              key={shadeId}
                              className="flex items-center gap-2 bg-white px-3 py-2 rounded-full border border-gray-200 shadow-sm"
                            >
                              <span
                                className="w-4 h-4 rounded-full"
                                style={{ background: color?.hex }}
                              ></span>
                              <span className="text-sm font-medium text-gray-700">
                                {color?.name}
                              </span>
                              <span className="text-xs text-gray-500">
                                ×{qty}
                              </span>
                            </div>
                          );
                        })}
                    </div>

                    {/* Total */}
                    <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                      <span className="text-lg font-bold text-gray-900">Total</span>
                      <span className="text-2xl font-black text-[#5E4E06]">
                        ₹{(Object.values(newShadeSelections).reduce((sum, qty) => sum + qty, 0) * 689).toLocaleString()}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer - Fixed */}
            <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 sm:p-6 flex-shrink-0 z-20">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="text-center sm:text-left">
                  <div className="text-xl sm:text-2xl font-bold text-[#5E4E06]">
                    ₹{(Object.values(newShadeSelections).reduce((sum, qty) => sum + qty, 0) * 689).toLocaleString()}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-600">Inclusive of all taxes</div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setShowPigmentedModal(false);
                      setEditingPigmentedItemId(null);
                      setNewShadeSelections({});
                    }}
                    className="px-6 sm:px-8 py-3 sm:py-4 font-bold rounded-xl border-2 border-[#5E4E06] text-[#5E4E06] bg-white hover:bg-[#5E4E06] hover:text-white transition-all duration-300 flex items-center justify-center gap-2 text-sm sm:text-base cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpdatePigmented}
                    className="px-6 sm:px-8 py-3 sm:py-4 font-bold rounded-xl shadow-lg transition-all duration-300 flex items-center justify-center gap-3 text-sm sm:text-base bg-gradient-to-r from-[#5E4E06] to-[#8B7A1A] text-white hover:shadow-xl hover:scale-105 cursor-pointer"
                  >
                    <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                    Update Colors
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.8s cubic-bezier(0.4,0,0.2,1);
        }
      `}</style>
    </div>
  );
} 