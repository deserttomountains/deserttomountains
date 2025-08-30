"use client";

import { useState } from "react";
import Navigation from "@/components/Navigation";
import {
  Sparkles,
  Shield,
  CheckCircle,
  Leaf,
  Heart,
  Star,
  ArrowRight,
  Package,
  Clock,
  Palette,
  ShoppingCart,
  Mountain,
  Sun,
  ChevronDown,
  X,
  Download,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/CartContext";
import { useToast } from "@/components/ToastContext";

export default function AuraClient() {
  const router = useRouter();
  const { addToCart } = useCart();
  const { showToast } = useToast();
  const [selectedSize, setSelectedSize] = useState<
    "small" | "medium" | "large"
  >("medium");
  const [selectedSamplePack, setSelectedSamplePack] = useState<3 | 6 | 13>(3);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [wallPlasterType, setWallPlasterType] = useState<
    "natural" | "pigmented"
  >("natural");
  const [neutralQuantity, setNeutralQuantity] = useState(0);
  const [pigmentedSelections, setPigmentedSelections] = useState<{
    [shadeId: string]: number;
  }>({});
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [showCoverageDetails, setShowCoverageDetails] = useState(false);
  const [showSampleModal, setShowSampleModal] = useState(false);

  // Helper for pigmented total price
  const getPigmentedTotalQty = () =>
    Object.values(pigmentedSelections).reduce((sum, qty) => sum + qty, 0);
  const getPigmentedTotalPrice = () => getPigmentedTotalQty() * 689;

  // Only one size: 25kg pack
  const pack = {
    label: "25kg Pack",
    mrp: 689,
    price: 499,
    coverageSummary: "20–40 sq ft per 25kg (by surface)",
  };

  const samplePacks = [
    { size: 3, price: 1499, label: "3 Samples" },
    { size: 6, price: 2799, label: "6 Samples" },
    { size: 13, price: 4999, label: "12 + 1 Free" },
  ];

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

  const features = [
    {
      icon: Shield,
      title: "100% Natural",
      desc: "Pure gypsum and organic cow dung",
    },
    {
      icon: Leaf,
      title: "Breathable",
      desc: "Regulates humidity naturally",
    },
    {
      icon: Heart,
      title: "Health Benefits",
      desc: "Improves indoor air quality",
    },
  ];

  const benefits = [
    "Natural air purification",
    "Humidity regulation",
    "Thermal insulation",
    "Fire resistance",
    "Anti-bacterial properties",
    "Easy application",
  ];

  const selectedPack = samplePacks.find((p) => p.size === selectedSamplePack);

  const handleColorToggle = (colorId: string) => {
    if (selectedColors.includes(colorId)) {
      setSelectedColors(selectedColors.filter((id) => id !== colorId));
    } else {
      if (selectedColors.length < selectedSamplePack) {
        setSelectedColors([...selectedColors, colorId]);
      }
    }
  };

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

  const canAddToCart = wallPlasterType === "natural" ? neutralQuantity > 0 : getPigmentedTotalQty() > 0;
  
  const canAddSampleToCart = selectedColors.length === selectedSamplePack;

  const getCurrentPrice = () => {
    if (wallPlasterType === "natural") {
      return pack.price * neutralQuantity;
    } else {
      return getPigmentedTotalPrice();
    }
  };
  
  const getSamplePrice = () => {
    return selectedPack?.price || 0;
  };

  const handleAddToCart = async () => {
    if (!canAddToCart) return;

    setIsAddingToCart(true);

    try {
      let cartItem;

      if (wallPlasterType === "natural") {
        cartItem = {
          id: 1,
          name: "Aura Wall Plaster 25kg",
          image: "/images/aura_1.webp",
          price: pack.price,
          quantity: neutralQuantity,
          subtitle: "Natural Gypsum & Cow Dung",
        };
      } else {
        // Pigmented wall plaster with shade details
        const selectedShades = Object.entries(pigmentedSelections)
          .filter(([_, qty]) => qty > 0)
          .map(([shadeId, qty]) => {
            const color = shaderColors.find((c) => c.id === shadeId);
            return {
              shadeId,
              shadeName: color?.name || "",
              shadeHex: color?.hex || "",
              quantity: qty,
            };
          });
        cartItem = {
          id: 3,
          name: "Aura Wall Plaster Pigmented",
          image: "/images/aura_1.webp",
          price: 689, // price per unit
          quantity: getPigmentedTotalQty(),
          subtitle: "Pigmented Shades",
          shades: selectedShades,
        };
      }
      addToCart(cartItem);
      showToast("Added to cart!", "success");
      router.push("/cart");
    } catch (error) {
      console.error("Error adding to cart:", error);
      // You could show an error message here
    } finally {
      setIsAddingToCart(false);
    }
  };
  
  const handleAddSampleToCart = async () => {
    if (!canAddSampleToCart) return;

    setIsAddingToCart(true);

    try {
      const cartItem = {
        id: 2,
        name: selectedSamplePack === 13 
          ? "Mock Sample (12 + 1 Free Colors)" 
          : `Mock Sample (${selectedSamplePack} Colors)`,
        image: "/images/gallery/1.webp",
        price: selectedPack?.price || 0,
        quantity: 1,
        subtitle: "Choose your favorite shades",
      };
      addToCart(cartItem);
      showToast("Added to cart!", "success");
      setShowSampleModal(false);
      router.push("/cart");
    } catch (error) {
      console.error("Error adding to cart:", error);
    } finally {
      setIsAddingToCart(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8F6F0] via-[#F0EDE4] to-[#E8E4D8] relative overflow-hidden">
      <Navigation />

      {/* Hero/Product Image Section */}
      <section className="relative z-10">
        <div className="w-full h-[350px] md:h-[500px] relative overflow-hidden">
          <img
            src="/images/gallery/60.webp"
            alt="Aura On Site"
            className="w-full h-full object-cover object-center"
            style={{ objectPosition: '50% 25%' }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#2A2418]/30 to-transparent"></div>
          <div className="absolute top-6 left-6 bg-gradient-to-br from-[#5E4E06] to-[#8B7A1A] rounded-full p-3 shadow-lg animate-float">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <div className="absolute top-6 right-6 bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-[#E6C866] fill-current" />
              <span className="text-sm font-bold text-[#2A2418]">4.9/5</span>
            </div>
          </div>
        </div>
      </section>

      {/* Product Info Card */}
      <section className="relative -mt-20 mb-8 z-10">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-gradient-to-br from-[#F8F6F0] to-[#F0EDE4] rounded-3xl shadow-2xl p-4 sm:p-6 md:p-8 border border-[#E8E4D8] animate-fade-in-up">
            <h1 className="text-4xl md:text-5xl font-black text-[#2A2418] mb-2 animate-fade-in-up">
              Aura
            </h1>
            <p className="text-[#5E4E06] font-bold text-xl mb-4 animate-fade-in-up">
              Natural Wall Plaster
            </p>
            <p className="text-[#2A2418]/70 text-lg mb-6 animate-fade-in-up">
              AURA is more than a wall finish—it is a living surface shaped by
              nature and heritage. Formulated from gypsum, cow dung, and earth
              minerals, it naturally balances indoor air while offering strength
              and timeless beauty. Each wall becomes a canvas of wellness,
              sustainability, and design reimagined for modern living.
            </p>

            {/* Quick Features */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              {features.map((feature, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 p-4 bg-gradient-to-br from-[#F8F6F0] to-[#F0EDE4] rounded-xl border border-[#E8E4D8]"
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-[#5E4E06] to-[#8B7A1A] rounded-lg flex items-center justify-center">
                    <feature.icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 text-sm">
                      {feature.title}
                    </div>
                    <div className="text-gray-600 text-xs">{feature.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Product Options - Tabs */}
            <div className="space-y-6">
              {/* Wall Plaster Type Selection - Tabs */}
              <div>
                <h3 className="text-lg font-bold text-[#2A2418] mb-4">
                  Choose Wall Plaster Type
                </h3>
                <div className="flex bg-gradient-to-r from-[#F8F6F0] to-[#F0EDE4] rounded-xl p-1 border border-[#E8E4D8]">
                  <button
                    onClick={() => setWallPlasterType("natural")}
                    className={`flex-1 px-4 py-3 rounded-lg font-bold transition-all duration-300 focus:outline-none cursor-pointer text-sm sm:text-base ${
                      wallPlasterType === "natural"
                        ? "bg-gradient-to-r from-[#5E4E06] to-[#8B7A1A] text-white shadow-lg transform scale-105"
                        : "text-[#2A2418] hover:bg-white/50 hover:text-[#5E4E06] hover:shadow-md"
                    }`}
                  >
                    Natural
                  </button>
                  <button
                    onClick={() => setWallPlasterType("pigmented")}
                    className={`flex-1 px-4 py-3 rounded-lg font-bold transition-all duration-300 focus:outline-none cursor-pointer text-sm sm:text-base ${
                      wallPlasterType === "pigmented"
                        ? "bg-gradient-to-r from-[#5E4E06] to-[#8B7A1A] text-white shadow-lg transform scale-105"
                        : "text-[#2A2418] hover:bg-white/50 hover:text-[#5E4E06] hover:shadow-md"
                    }`}
                  >
                    Pigmented
                  </button>
                </div>
              </div>

              {/* Product Configuration */}
              <div>
                {/* Wall Plaster Natural */}
                {wallPlasterType === "natural" && (
                    <div className="bg-gradient-to-br from-[#F8F6F0] to-[#F0EDE4] rounded-xl p-6 border border-[#E8E4D8]">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <div className="text-2xl font-bold text-[#2A2418]">
                            {pack.label}
                          </div>
                          <div className="text-sm text-[#2A2418]/70 flex items-center gap-2">
                            <span>Coverage: {pack.coverageSummary}</span>
                            <button
                              type="button"
                              onClick={() => setShowCoverageDetails((v) => !v)}
                              className="inline-flex items-center gap-1 px-2 py-1 rounded-lg border border-[#B8A94A] text-[#5E4E06] bg-white/60 hover:bg-white transition-colors cursor-pointer"
                              aria-expanded={showCoverageDetails}
                              aria-controls="coverage-details"
                            >
                              <span className="text-xs font-bold">Details</span>
                              <ChevronDown
                                className={`w-3 h-3 transition-transform ${
                                  showCoverageDetails ? "rotate-180" : ""
                                }`}
                              />
                            </button>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-3xl font-black text-[#5E4E06]">
                            ₹{pack.price}
                          </div>
                          <div className="text-base text-gray-400 line-through">
                            ₹{pack.mrp}
                          </div>
                          <div className="text-sm text-gray-600">
                            per 25kg pack
                          </div>
                        </div>
                      </div>
                      {showCoverageDetails && (
                        <div
                          id="coverage-details"
                          className="mb-4 mt-2 p-4 bg-gradient-to-br from-[#FFF8DC] to-[#F0E68C] rounded-xl border border-[#D4AF37] text-[#2A2418]"
                        >
                          <ul className="list-disc pl-5 space-y-1 text-sm">
                            <li>
                              20 sq. ft. coverage on regular bricks or stones
                              with a 12–15mm thickness.
                            </li>
                            <li>
                              25–30 sq. ft. coverage on AAC blocks with an
                              8–10mm thickness.
                            </li>
                            <li>
                              40 sq. ft. coverage on concrete or plaster with a
                              4–6mm thickness.
                            </li>
                          </ul>
                          <p className="text-xs text-[#2A2418]/70 mt-2">
                            Actual coverage varies by surface smoothness and
                            applicator technique.
                          </p>
                        </div>
                      )}

                      {/* Quantity Selector */}
                      <div className="flex items-center justify-between p-3 sm:p-4 bg-white/50 rounded-xl border border-[#B8A94A]">
                        <span className="font-semibold text-[#2A2418] text-sm sm:text-base">
                          Quantity:
                        </span>
                        <div className="flex items-center gap-2 sm:gap-3">
                          <button
                            onClick={() =>
                              setNeutralQuantity(
                                Math.max(0, neutralQuantity - 1)
                              )
                            }
                            className="w-8 h-8 sm:w-8 sm:h-8 flex items-center justify-center rounded-full bg-gradient-to-r from-[#5E4E06] to-[#8B7A1A] text-white font-bold text-sm shadow hover:scale-110 transition-all duration-200 cursor-pointer"
                          >
                            -
                          </button>
                          <input
                            type="number"
                            min={0}
                            value={neutralQuantity}
                            onChange={(e) => {
                              const val = Math.max(
                                0,
                                parseInt(e.target.value) || 0
                              );
                              setNeutralQuantity(val);
                            }}
                            className="w-12 sm:w-12 text-center font-bold text-[#2A2418] text-sm sm:text-base bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-[#5E4E06] rounded"
                          />
                          <button
                            onClick={() =>
                              setNeutralQuantity(neutralQuantity + 1)
                            }
                            className="w-8 h-8 sm:w-8 sm:h-8 flex items-center justify-center rounded-full bg-gradient-to-r from-[#5E4E06] to-[#8B7A1A] text-white font-bold text-sm shadow hover:scale-110 transition-all duration-200 cursor-pointer"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                {/* Wall Plaster Pigmented */}
                {wallPlasterType === "pigmented" && (
                    <div className="space-y-6">
                      {/* Price Banner */}
                      <div className="bg-gradient-to-r from-[#5E4E06] to-[#8B7A1A] rounded-xl p-6 text-white">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-3xl font-black">₹689</div>
                            <div className="text-sm opacity-90">
                              per 25kg pack
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg opacity-70 line-through">
                              ₹1099
                            </div>
                            <div className="text-sm font-bold text-yellow-300">
                              Save ₹410!
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Color Palette Concept */}
                      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                        {/* Header */}
                        <div className="bg-gradient-to-r from-[#F8F6F0] to-[#F0EDE4] p-6 border-b border-gray-200">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="text-2xl font-bold text-gray-900">
                                Color Palette
                              </h3>
                              <p className="text-gray-600">
                                Select your perfect shades
                              </p>
                            </div>
                            <div className="text-right">
                              <div className="text-sm text-gray-600">
                                Selected:{" "}
                                {
                                  Object.entries(pigmentedSelections).filter(
                                    ([_, qty]) => qty > 0
                                  ).length
                                }{" "}
                                colors
                              </div>
                              <div className="text-lg font-bold text-[#5E4E06]">
                                ₹689 per pack
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Color Swatches */}
                        <div className="p-6">
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {shaderColors.map((color) => {
                              const selectedQty =
                                pigmentedSelections[color.id] || 0;
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
                                            ₹
                                            {(
                                              selectedQty * 689
                                            ).toLocaleString()}
                                          </div>
                                        </div>
                                      )}
                                    </div>

                                    {/* Quantity Selector */}
                                    <div className="flex items-center gap-3">
                                      <button
                                        type="button"
                                        className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-600 font-bold hover:bg-[#5E4E06] hover:text-white transition-all duration-200 disabled:opacity-50 cursor-pointer"
                                        onClick={() =>
                                          setPigmentedSelections((s) => ({
                                            ...s,
                                            [color.id]: Math.max(
                                              (s[color.id] || 0) - 1,
                                              0
                                            ),
                                          }))
                                        }
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
                                            const val = Math.max(
                                              Number(e.target.value),
                                              0
                                            );
                                            setPigmentedSelections((s) => ({
                                              ...s,
                                              [color.id]: val,
                                            }));
                                          }}
                                          className="w-full text-center border-2 border-gray-200 rounded-lg py-2 font-bold text-sm focus:ring-2 focus:ring-[#5E4E06] focus:border-[#5E4E06]"
                                          placeholder="0"
                                        />
                                      </div>
                                      <button
                                        type="button"
                                        className="w-8 h-8 flex items-center justify-center rounded-full bg-[#5E4E06] text-white font-bold hover:bg-[#8B7A1A] transition-all duration-200 cursor-pointer"
                                        onClick={() =>
                                          setPigmentedSelections((s) => ({
                                            ...s,
                                            [color.id]: (s[color.id] || 0) + 1,
                                          }))
                                        }
                                      >
                                        +
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>

                      {/* Quick Summary */}
                      {Object.entries(pigmentedSelections).filter(
                        ([_, qty]) => qty > 0
                      ).length > 0 && (
                        <div className="bg-gradient-to-br from-[#F8F6F0] to-[#F0EDE4] rounded-xl p-6 border border-[#E8E4D8]">
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="text-xl font-bold text-gray-900">
                              Your Selection
                            </h4>
                            <div className="text-sm text-gray-600">
                              {getPigmentedTotalQty()} packs selected
                            </div>
                          </div>

                          {/* Color chips */}
                          <div className="flex flex-wrap gap-2 mb-4">
                            {Object.entries(pigmentedSelections)
                              .filter(([_, qty]) => qty > 0)
                              .map(([shadeId, qty]) => {
                                const color = shaderColors.find(
                                  (c) => c.id === shadeId
                                );
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
                            <span className="text-lg font-bold text-gray-900">
                              Total
                            </span>
                            <span className="text-2xl font-black text-[#5E4E06]">
                              ₹{getPigmentedTotalPrice().toLocaleString()}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}


              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Want to try Aura first? Section */}
      <section className="relative z-10 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-gradient-to-br from-[#F8F6F0] to-[#F0EDE4] rounded-3xl shadow-lg p-8 border border-[#E8E4D8] text-center">
            <div className="flex items-center justify-center gap-3 mb-6">
              <Palette className="w-8 h-8 text-[#5E4E06]" />
              <h3 className="text-2xl font-bold text-[#2A2418]">
                Want to try Aura first?
              </h3>
            </div>
            <p className="text-[#2A2418]/70 mb-8 max-w-2xl mx-auto text-lg leading-relaxed">
              Get 1x1 ft sample boards on 6mm board to see how Aura Natural Wall Plaster looks and feels in your space. Perfect for testing colors and textures before committing to a full application.
            </p>
            <button
              onClick={() => setShowSampleModal(true)}
              className="px-8 py-4 bg-gradient-to-r from-[#5E4E06] to-[#8B7A1A] text-white font-bold rounded-xl hover:shadow-lg transition-all duration-300 hover:scale-105 flex items-center justify-center gap-3 mx-auto"
            >
              <Palette className="w-5 h-5" />
              Get Mock Samples
            </button>
          </div>
        </div>
      </section>

      {/* Sample Modal */}
      {showSampleModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-6xl w-full max-h-[90vh] sm:max-h-[85vh] overflow-hidden mb-16 sm:mb-20 flex flex-col">
            {/* Modal Header - Fixed */}
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 sm:p-6 flex items-center justify-between rounded-t-3xl z-20 flex-shrink-0">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-[#2A2418]">Mock Sample Boards</h2>
                <p className="text-sm sm:text-base text-gray-600">Choose your perfect colors</p>
              </div>
              <button
                onClick={() => setShowSampleModal(false)}
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
                  onClick={handleAddSampleToCart}
                  disabled={!canAddSampleToCart || isAddingToCart}
                  className={`w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 font-bold rounded-xl shadow-lg transition-all duration-300 flex items-center justify-center gap-3 text-sm sm:text-base ${
                    canAddSampleToCart && !isAddingToCart
                      ? "bg-gradient-to-r from-[#5E4E06] to-[#8B7A1A] text-white hover:shadow-xl hover:scale-105 cursor-pointer"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
                  {isAddingToCart
                    ? "Adding..."
                    : !canAddSampleToCart
                    ? `Select ${selectedSamplePack - selectedColors.length} more color${
                        selectedSamplePack - selectedColors.length === 1 ? "" : "s"
                      }`
                    : "Add to Cart"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sticky Add to Cart Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
        <div className="max-w-4xl mx-auto px-3 sm:px-4 py-2 sm:py-3 md:py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3 md:gap-4">
            <div className="flex items-center justify-between sm:justify-start gap-2 sm:gap-4">
              <span className="text-lg sm:text-xl md:text-2xl font-black text-[#5E4E06]">
                {wallPlasterType === "natural" ? (
                  `₹${pack.price * neutralQuantity}`
                ) : getPigmentedTotalQty() > 0 ? (
                  `Total: ₹${getPigmentedTotalPrice()}`
                ) : (
                  "₹0"
                )}
              </span>
              <span className="text-xs sm:text-sm text-gray-500">
                Inclusive of all taxes
              </span>
            </div>
            <button
              onClick={handleAddToCart}
              disabled={!canAddToCart || isAddingToCart}
              className={`w-full sm:w-auto px-4 sm:px-6 md:px-8 py-2 sm:py-3 font-bold rounded-xl shadow-lg transition-all duration-300 flex items-center justify-center gap-2 text-sm sm:text-base ${
                canAddToCart && !isAddingToCart
                  ? "bg-gradient-to-r from-[#5E4E06] to-[#8B7A1A] text-white hover:shadow-xl hover:scale-105 cursor-pointer"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
              {isAddingToCart ? "Adding..." : "Add to Cart"}
            </button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-6">
              Why Choose Aura?
            </h2>
            <a
              href="/pdfs/DTM_Brochure.pdf"
              download="Aura-Natural-Wall-Plaster-Brochure.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-[#5E4E06] to-[#8B7A1A] text-white font-bold rounded-xl hover:shadow-lg transition-all duration-300 hover:scale-105"
            >
              <Download className="w-5 h-5" />
              Download Brochure
            </a>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Shield,
                title: "Traditional Knowledge, Modern Benefits",
                desc: "Crafted using traditional Indian techniques with natural ingredients that have been trusted for centuries",
              },
              {
                icon: Leaf,
                title: "Natural Climate Control",
                desc: "Regulates humidity and temperature naturally, creating a comfortable living environment year-round",
              },
              {
                icon: Heart,
                title: "Health-First Approach",
                desc: "Improves indoor air quality and promotes respiratory health through natural air purification",
              },
              {
                icon: Sparkles,
                title: "Eco-Friendly Excellence",
                desc: "100% natural ingredients sourced sustainably, reducing your carbon footprint",
              },
              {
                icon: Star,
                title: "Superior Durability",
                desc: "Fire-resistant, mold-resistant, and built to last with exceptional wear resistance",
              },
              {
                icon: CheckCircle,
                title: "Easy & Versatile",
                desc: "Simple application process with professional finish on any wall surface",
              },
            ].map((feature, idx) => (
              <div
                key={idx}
                className="p-8 bg-gradient-to-br from-[#F8F6F0] to-[#F0EDE4] rounded-2xl shadow-lg border border-[#E8E4D8] text-center group hover:shadow-2xl transition-all duration-300"
              >
                <div className="w-16 h-16 mx-auto mb-6 flex items-center justify-center rounded-full bg-gradient-to-br from-[#5E4E06] to-[#8B7A1A] shadow-lg group-hover:scale-110 transition-transform">
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-base">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Natural Ingredients Section */}
      <section className="py-16 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-12 text-center">
            Natural Ingredients
          </h2>
          <p className="text-xl text-gray-600 mb-12 text-center max-w-4xl mx-auto">
            Aura is crafted from carefully selected natural ingredients, each
            bringing unique properties that work together to create the perfect
            wall plaster.
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12">
            {/* Earthen Clay */}
            <div className="bg-gradient-to-br from-[#F8F6F0] to-[#F0EDE4] rounded-2xl p-4 sm:p-6 md:p-8 border border-[#E8E4D8] shadow-lg">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-gradient-to-br from-[#8B4513] to-[#A0522D] rounded-full flex items-center justify-center flex-shrink-0">
                  <Mountain className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-white" />
                </div>
                <div className="text-center sm:text-left">
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900">
                    Earthen Clay
                  </h3>
                  <p className="text-gray-600 text-sm sm:text-base">
                    Earth clay enhances the plaster's inherent durability
                  </p>
                </div>
              </div>
              <div className="space-y-4 text-gray-700">
                <p className="leading-relaxed text-sm sm:text-base">
                  Earth clay enhances the plaster's inherent durability. The
                  natural earth clay absorbs excess humidity in the air and
                  releases it slowly, thus helping in regulating the house
                  temperature. An often overlooked and subtle benefit of clay is
                  that when it comes into contact with water, it emits a
                  negative charge. These negative ions help humans to absorb
                  more oxygen. This also helps to counteract the positive
                  charges and ions that are emitted by home electronics. Earth
                  clay makes wall surfaces fireproof and mold resistant as well.
                </p>
              </div>
            </div>

            {/* Gypsum */}
            <div className="bg-gradient-to-br from-[#F8F6F0] to-[#F0EDE4] rounded-2xl p-4 sm:p-6 md:p-8 border border-[#E8E4D8] shadow-lg">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-gradient-to-br from-[#F5F5DC] to-[#DEB887] rounded-full flex items-center justify-center flex-shrink-0">
                  <Shield className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-white" />
                </div>
                <div className="text-center sm:text-left">
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900">
                    Gypsum
                  </h3>
                  <p className="text-gray-600 text-sm sm:text-base">
                    The primary ingredient or the dominant binder in Aura
                  </p>
                </div>
              </div>
              <div className="space-y-4 text-gray-700">
                <p className="leading-relaxed text-sm sm:text-base">
                  Gypsum offers exceptional yield and high-performance with
                  superior acoustic and thermal insulation properties.
                  Additionally, it provides passive fire-resistance, moisture &
                  vapour control with shock resistance, that helps in regulating
                  the interior climate and air quality. It's timeless appeal
                  lies in its excellent resistance to wear and tear, making the
                  wall surface impervious to natural ageing or deterioration
                  over time.
                </p>
              </div>
            </div>

            {/* Cow Dung */}
            <div className="bg-gradient-to-br from-[#F8F6F0] to-[#F0EDE4] rounded-2xl p-4 sm:p-6 md:p-8 border border-[#E8E4D8] shadow-lg">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-gradient-to-br from-[#8B4513] to-[#A0522D] rounded-full flex items-center justify-center flex-shrink-0">
                  <Leaf className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-white" />
                </div>
                <div className="text-center sm:text-left">
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900">
                    Cow Dung
                  </h3>
                  <p className="text-gray-600 text-sm sm:text-base">
                    Effective protection from microbial growth
                  </p>
                </div>
              </div>
              <div className="space-y-4 text-gray-700">
                <p className="leading-relaxed text-sm sm:text-base">
                  Vaccae present in cow dung provides effective protection from
                  microbial growth that affects most wall surfaces. Not only is
                  it a good binder, but the fibers present in it creates a
                  smooth, fine floor finish that stops cracks from appearing.
                  What's more, it also increases the insulation properties of
                  the plaster.
                </p>
                <div className="bg-gradient-to-r from-[#5E4E06]/10 to-[#8B7A1A]/10 rounded-lg p-3 sm:p-4 border border-[#B8A94A]">
                  <p className="text-xs sm:text-sm text-gray-700 italic">
                    Traditionally used for plastering walls and floors, the cow
                    dung used in Aura Natural Wall Plaster is only of the Desi
                    (Bhartiya) cows. grazed in a natural habitat on the land of
                    Thar. This results in a quality organic insulation of your
                    home, giving you a very pleasant earthy freshness.
                  </p>
                </div>
                <div className="bg-gradient-to-r from-[#5E4E06]/10 to-[#8B7A1A]/10 rounded-lg p-3 sm:p-4 border border-[#B8A94A]">
                  <p className="text-xs sm:text-sm text-gray-700 italic">
                    We source our cow dung from an independently run Gaushala,
                    helping in the upkeep and maintenance of local
                    community-driven intitiatives.
                  </p>
                </div>
              </div>
            </div>

            {/* Other Ingredients */}
            <div className="bg-gradient-to-br from-[#F8F6F0] to-[#F0EDE4] rounded-2xl p-4 sm:p-6 md:p-8 border border-[#E8E4D8] shadow-lg">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-gradient-to-br from-[#F0E68C] to-[#DAA520] rounded-full flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-white" />
                </div>
                <div className="text-center sm:text-left">
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900">
                    Other Ingredients
                  </h3>
                  <p className="text-gray-600 text-sm sm:text-base">
                    Aura also contains lime concentrate
                  </p>
                </div>
              </div>
              <div className="space-y-4 text-gray-700">
                <p className="leading-relaxed text-sm sm:text-base">
                  Aura also contains lime concentrate that makes your wall
                  surface durable and all- weather resistant. It makes the wall
                  impervious to mold and bacteria and also enhances the
                  workability and ease of application of the final mixture,
                  providing good whiteness index, smooth finish and supreme
                  natural adhesion.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Origin Section */}
      <section className="py-16 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-12 text-center">
            The Story of Aura
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-12">
            {/* Left Side - Image */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-[#5E4E06] to-[#8B7A1A] rounded-3xl blur-2xl opacity-20"></div>
              <img
                src="/images/aura_1.webp"
                alt="Aura Natural Wall Plaster"
                className="relative w-full h-80 object-cover rounded-3xl shadow-2xl"
              />
              <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#E6C866]" />
                  <span className="text-sm font-bold text-gray-900">
                    Created in Jodhpur
                  </span>
                </div>
              </div>
            </div>

            {/* Right Side - Content */}
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#F8F6F0] to-[#F0EDE4] border border-[#B8A94A] text-[#5E4E06] rounded-full text-sm font-semibold">
                <Leaf className="w-4 h-4" />
                <span>Eco-Friendly Innovation</span>
              </div>

              <h3 className="text-2xl font-bold text-gray-900">
                A Natural Revolution
              </h3>

              <div className="space-y-4 text-gray-700 leading-relaxed">
                <p>
                  Many people have come to realize the damage caused to oneself
                  and the environment by using sand-cement plasters. As more
                  people come face-to-face with grim reality, a growing demand
                  for natural, organic alternative options came to the foray,
                  opening demand for economically feasible and naturally
                  beneficial alternatives for the purpose of plastering or
                  finishing.
                </p>
                <p>
                  After years of conducting tests and experimentation,
                  practicing Eco-friendly sourcing and manufacturing methods,
                  Aura was developed in Jodhpur, home to a rich ecosystem of raw
                  materials, an aesthetically-pleasing yet strong gypsum-based
                  plaster, the ingredients in Aura are naturally sturdy, created
                  in the harshest of environments to withstand the most inhuman
                  conditions
                </p>
              </div>
            </div>
          </div>

          {/* Journey Timeline */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6 bg-gradient-to-br from-[#F8F6F0] to-[#F0EDE4] rounded-2xl border border-[#E8E4D8] shadow-lg">
              <div className="w-16 h-16 bg-gradient-to-br from-[#5E4E06] to-[#8B7A1A] rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <span className="text-2xl font-bold text-white">1</span>
              </div>
              <h4 className="text-lg font-bold text-gray-900 mb-2">
                Environmental Awareness
              </h4>
              <p className="text-gray-600 text-sm">
                Recognition of sand-cement plaster damage to environment and
                health
              </p>
            </div>

            <div className="text-center p-6 bg-gradient-to-br from-[#F8F6F0] to-[#F0EDE4] rounded-2xl border border-[#E8E4D8] shadow-lg">
              <div className="w-16 h-16 bg-gradient-to-br from-[#5E4E06] to-[#8B7A1A] rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <span className="text-2xl font-bold text-white">2</span>
              </div>
              <h4 className="text-lg font-bold text-gray-900 mb-2">
                Research & Development
              </h4>
              <p className="text-gray-600 text-sm">
                Years of testing and eco-friendly manufacturing methods
              </p>
            </div>

            <div className="text-center p-6 bg-gradient-to-br from-[#F8F6F0] to-[#F0EDE4] rounded-2xl border border-[#E8E4D8] shadow-lg">
              <div className="w-16 h-16 bg-gradient-to-br from-[#5E4E06] to-[#8B7A1A] rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <span className="text-2xl font-bold text-white">3</span>
              </div>
              <h4 className="text-lg font-bold text-gray-900 mb-2">
                Creation of Aura
              </h4>
              <p className="text-gray-600 text-sm">
                Natural plaster developed in Jodhpur's rich ecosystem
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Video Section */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-12 text-center">
            Learn More About Aura
          </h2>
          <p className="text-xl text-gray-600 mb-12 text-center max-w-4xl mx-auto">
            Discover the story behind Aura and learn how to apply it for the
            best results
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Introduction Video */}
            <div className="bg-gradient-to-br from-[#F8F6F0] to-[#F0EDE4] rounded-2xl p-6 border border-[#E8E4D8] shadow-lg">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Introduction to Aura
              </h3>
              <p className="text-gray-600 mb-6">
                Learn about the natural ingredients and benefits that make Aura
                the perfect choice for your walls.
              </p>
              <div className="aspect-video bg-gray-200 rounded-xl overflow-hidden">
                <iframe
                  src="https://www.youtube.com/embed/NqhIR2jV1Jc"
                  title="Introduction to Aura"
                  className="w-full h-full"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
            </div>

            {/* Application Video */}
            <div className="bg-gradient-to-br from-[#F8F6F0] to-[#F0EDE4] rounded-2xl p-6 border border-[#E8E4D8] shadow-lg">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Application Guide
              </h3>
              <p className="text-gray-600 mb-6">
                Step-by-step guide on how to apply Aura Natural Wall Plaster for
                professional results.
              </p>
              <div className="aspect-video bg-gray-200 rounded-xl overflow-hidden">
                <iframe
                  src="https://www.youtube.com/embed/JFsBu5BIw0o"
                  title="Aura Application Guide"
                  className="w-full h-full"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-8">
                Transform Your Space
              </h2>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Aura Natural Wall Plaster goes beyond traditional wall finishes.
                It creates a living, breathing surface that actively contributes
                to your health and wellbeing.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-gray-600 flex-shrink-0" />
                    <span className="text-gray-700 font-medium">{benefit}</span>
                  </div>
                ))}
              </div>
              <div className="mt-8">
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-[#5E4E06] to-[#8B7A1A] text-white font-bold rounded-xl hover:shadow-lg transition-all duration-300 hover:scale-105"
                >
                  <span>Get Free Consultation</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-[#5E4E06] to-[#8B7A1A] rounded-3xl blur-2xl opacity-20"></div>
              <img
                src="/images/aura_1.webp"
                alt="Aura Application"
                className="relative w-full h-96 object-cover rounded-3xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Shipping & Support */}
      <section className="py-16 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-12 text-center">
            Shipping & Support
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="text-center p-8 bg-white rounded-2xl shadow-lg border border-gray-100">
              <Clock className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Fast Delivery
              </h3>
              <p className="text-gray-600">7-10 business days across India</p>
            </div>
            <div className="text-center p-8 bg-white rounded-2xl shadow-lg border border-gray-100">
              <Shield className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Quality Guarantee
              </h3>
              <p className="text-gray-600">100% satisfaction or money back</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-br from-[#5E4E06] to-[#8B7A1A]">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-black text-white mb-6">
            Ready to Transform Your Space?
          </h2>
          <p className="text-xl text-gray-100 mb-8">
            Join thousands of happy customers who have already experienced the
            benefits of Aura Natural Wall Plaster.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-8 py-4 bg-white text-gray-900 font-bold rounded-xl hover:shadow-lg transition-all duration-300 hover:scale-105">
              Order Now
            </button>
            <Link
              href="/contact"
              className="px-8 py-4 border-2 border-white text-white font-bold rounded-xl hover:bg-white hover:text-gray-900 transition-all duration-300"
            >
              Get Consultation
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
