'use client';

import { useState } from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Sparkles, Shield, CheckCircle, Leaf, Heart, Star, ArrowRight, Package, Truck, Clock, Palette, ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function AuraClient() {
  const router = useRouter();
  const [selectedSize, setSelectedSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [productType, setProductType] = useState<'wallputty' | 'sample'>('wallputty');
  const [selectedSamplePack, setSelectedSamplePack] = useState<3 | 6 | 12>(3);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [wallPuttyType, setWallPuttyType] = useState<'neutral' | 'pigmented'>('neutral');
  const [pigmentedSelections, setPigmentedSelections] = useState<{ [shadeId: string]: number }>({});
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  // Only one size: 25kg pack
  const pack = { label: '25kg Pack', mrp: 499, price: 400, coverage: '125 sq ft' };

  const samplePacks = [
    { size: 3, price: 1499, label: '3 Samples' },
    { size: 6, price: 2799, label: '6 Samples' },
    { size: 12, price: 4999, label: '12 Samples' }
  ];

  const shaderColors = [
    { id: 'thar-grey', name: 'Thar Grey', hex: '#898D8D' },
    { id: 'amber-rust', name: 'Amber Rust', hex: '#E89E6D' },
    { id: 'pushkar-sunset', name: 'Pushkar Sunset', hex: '#FF8674' },
    { id: 'rose-quartz', name: 'Rose Quartz', hex: '#E9A2B2' }, 
    { id: 'jaisalmer-dune', name: 'Jaisalmer Dune', hex: '#DDCBA4' },
    { id: 'sandstone-dust', name: 'Sandstone Dust', hex: '#CDA788' },
    { id: 'udaipur-terracotta', name: 'Udaipur Terracotta', hex: '#E8927C' },
    { id: 'aravalli-green', name: 'Aravalli Green', hex: '#9ABEAA' },
    { id: 'kishangarh-lime', name: 'Kishangarh Lime', hex: '#E9DF97' },
    { id: 'almond-biege', name: 'Almond Biege', hex: '#E0C6AD' },
    { id: 'rajasthan-ochre', name: 'Rajasthan Ochre', hex: '#FDBE87' },
    { id: 'jodhpur-blue', name: 'Jodhpur Blue', hex: '#B9D9EB' },
  ];

  const features = [
    {
      icon: Shield,
      title: "100% Natural",
      desc: "Pure gypsum and organic cow dung"
    },
    {
      icon: Leaf,
      title: "Breathable",
      desc: "Regulates humidity naturally"
    },
    {
      icon: Heart,
      title: "Health Benefits",
      desc: "Improves indoor air quality"
    }
  ];

  const benefits = [
    "Natural air purification",
    "Humidity regulation",
    "Thermal insulation",
    "Fire resistance",
    "Anti-bacterial properties",
    "Easy application"
  ];

  const selectedPack = samplePacks.find(p => p.size === selectedSamplePack);

  const handleColorToggle = (colorId: string) => {
    if (selectedColors.includes(colorId)) {
      setSelectedColors(selectedColors.filter(id => id !== colorId));
    } else {
      if (selectedColors.length < selectedSamplePack) {
        setSelectedColors([...selectedColors, colorId]);
      }
    }
  };

  const handleSamplePackChange = (packSize: 3 | 6 | 12) => {
    setSelectedSamplePack(packSize);
    
    // If 12 samples selected, automatically select all colors
    if (packSize === 12) {
      setSelectedColors(shaderColors.map(color => color.id));
    } else {
      // For 3 and 6 samples, clear all selections and let user choose manually
      setSelectedColors([]);
    }
  };

  const canAddToCart = productType === 'wallputty' || 
    (productType === 'sample' && selectedColors.length === selectedSamplePack);

  const getCurrentPrice = () => {
    if (productType === 'wallputty') {
      return pack.price;
    } else {
      return selectedPack?.price || 0;
    }
  };

  const handleAddToCart = async () => {
    if (!canAddToCart) return;
    
    setIsAddingToCart(true);
    
    try {
      let cartItem;
      
      if (productType === 'wallputty') {
        if (wallPuttyType === 'neutral') {
          cartItem = {
            id: 'aura-neutral-wallputty',
            name: 'Aura Natural Wall Plaster - Neutral',
            type: 'wallputty',
            variant: 'neutral',
            quantity: 1,
            price: pack.price,
            packSize: '25kg',
            coverage: pack.coverage
          };
        } else {
          // Pigmented wall putty
          const selectedShades = Object.entries(pigmentedSelections)
            .filter(([_, qty]) => qty > 0)
            .map(([shadeId, qty]) => {
              const color = shaderColors.find(c => c.id === shadeId);
              return {
                shadeId,
                shadeName: color?.name,
                shadeHex: color?.hex,
                quantity: qty
              };
            });
          
          cartItem = {
            id: 'aura-pigmented-wallputty',
            name: 'Aura Natural Wall Plaster - Pigmented',
            type: 'wallputty',
            variant: 'pigmented',
            shades: selectedShades,
            totalQuantity: getPigmentedTotalQty(),
            price: getPigmentedTotalPrice(),
            pricePerKg: 400
          };
        }
      } else {
        // Sample pack
        const selectedShadeNames = selectedColors.map(id => shaderColors.find(c => c.id === id)?.name);
        cartItem = {
          id: 'aura-sample-pack',
          name: `Aura Sample Pack - ${selectedSamplePack} Colors`,
          type: 'sample',
          packSize: selectedSamplePack,
          selectedColors: selectedShadeNames,
          price: getCurrentPrice()
        };
      }
      
      // Add to cart (store in localStorage for now)
      const existingCart = JSON.parse(localStorage.getItem('cart') || '[]');
      existingCart.push(cartItem);
      localStorage.setItem('cart', JSON.stringify(existingCart));
      
      // Redirect to cart page
      router.push('/cart');
      
    } catch (error) {
      console.error('Error adding to cart:', error);
      // You could show an error message here
    } finally {
      setIsAddingToCart(false);
    }
  };

  // Helper for pigmented total price
  const getPigmentedTotalQty = () => Object.values(pigmentedSelections).reduce((sum, qty) => sum + qty, 0);
  const getPigmentedTotalPrice = () => getPigmentedTotalQty() * 400;

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-amber-50">
      <Navigation />
      
      {/* Hero/Product Image Section */}
      <section className="relative">
        <div className="w-full h-96 md:h-[500px] relative overflow-hidden">
          <img
            src="https://picsum.photos/1200/600?random=1"
            alt="Aura Natural Wall Plaster"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
          <div className="absolute top-6 left-6 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full p-3 shadow-lg">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <div className="absolute top-6 right-6 bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-amber-500 fill-current" />
              <span className="text-sm font-bold text-gray-900">4.9/5</span>
            </div>
          </div>
        </div>
      </section>

      {/* Product Info Card */}
      <section className="relative -mt-20 mb-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
            <div className="mb-4 inline-flex items-center gap-2 px-6 py-2 bg-amber-100 border border-amber-200 text-amber-700 rounded-full text-sm font-semibold">
              <Sparkles className="w-4 h-4" />
              <span>Natural Wall Plaster • Ancient Wisdom</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-2">Aura</h1>
            <p className="text-amber-600 font-bold text-xl mb-4">Natural Wall Plaster</p>
            <p className="text-gray-600 text-lg mb-6">
              Revolutionary gypsum and cow dung-based plaster that naturally regulates air quality 
              while creating stunning, healthy surfaces inspired by ancient Indian wisdom.
            </p>
            
            {/* Quick Features */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              {features.map((feature, idx) => (
                <div key={idx} className="flex items-center gap-3 p-4 bg-amber-50 rounded-xl border border-amber-200">
                  <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-500 rounded-lg flex items-center justify-center">
                    <feature.icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 text-sm">{feature.title}</div>
                    <div className="text-gray-600 text-xs">{feature.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Product Options */}
            <div className="space-y-6">
              {/* Step 1: Product Type Selection */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4">Step 1: Choose Product Type</h3>
                <div className="flex gap-4">
                  <button
                    onClick={() => setProductType('wallputty')}
                    className={`flex-1 px-6 py-4 rounded-xl border-2 font-bold transition-all duration-300 focus:outline-none flex items-center justify-center gap-3 ${
                      productType === 'wallputty' 
                        ? 'border-amber-600 bg-amber-100 text-amber-700 shadow-lg' 
                        : 'border-gray-200 bg-white text-gray-700 hover:border-amber-400 hover:shadow-md'
                    }`}
                  >
                    <Package className="w-6 h-6" />
                    Wall Putty
                  </button>
                  <button
                    onClick={() => setProductType('sample')}
                    className={`flex-1 px-6 py-4 rounded-xl border-2 font-bold transition-all duration-300 focus:outline-none flex items-center justify-center gap-3 ${
                      productType === 'sample' 
                        ? 'border-amber-600 bg-amber-100 text-amber-700 shadow-lg' 
                        : 'border-gray-200 bg-white text-gray-700 hover:border-amber-400 hover:shadow-md'
                    }`}
                  >
                    <Palette className="w-6 h-6" />
                    Sample Pack
                  </button>
                </div>
              </div>

              {/* Step 2: Wall Putty Type Selection */}
              {productType === 'wallputty' && (
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Step 2: Choose Wall Putty Type</h3>
                  <div className="flex gap-4">
                    <button
                      onClick={() => setWallPuttyType('neutral')}
                      className={`flex-1 px-6 py-4 rounded-xl border-2 font-bold transition-all duration-300 focus:outline-none ${
                        wallPuttyType === 'neutral'
                          ? 'border-amber-600 bg-amber-100 text-amber-700 shadow-lg'
                          : 'border-gray-200 bg-white text-gray-700 hover:border-amber-400 hover:shadow-md'
                      }`}
                    >
                      Neutral
                    </button>
                    <button
                      onClick={() => setWallPuttyType('pigmented')}
                      className={`flex-1 px-6 py-4 rounded-xl border-2 font-bold transition-all duration-300 focus:outline-none ${
                        wallPuttyType === 'pigmented'
                          ? 'border-amber-600 bg-amber-100 text-amber-700 shadow-lg'
                          : 'border-gray-200 bg-white text-gray-700 hover:border-amber-400 hover:shadow-md'
                      }`}
                    >
                      Pigmented
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Product Configuration */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  Step 3: {productType === 'wallputty' ? (wallPuttyType === 'neutral' ? 'Pack Details' : 'Select Shades') : 'Choose Sample Pack'}
                </h3>
                
                {/* Wall Putty Neutral */}
                {productType === 'wallputty' && wallPuttyType === 'neutral' && (
                  <div className="bg-amber-50 rounded-xl p-6 border border-amber-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-2xl font-bold text-amber-700">{pack.label}</div>
                        <div className="text-sm text-gray-600">{pack.coverage} coverage</div>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-black text-amber-600">₹{pack.price}</div>
                        <div className="text-base text-gray-400 line-through">₹{pack.mrp}</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Wall Putty Pigmented */}
                {productType === 'wallputty' && wallPuttyType === 'pigmented' && (
                  <div className="space-y-4">
                    <div className="text-amber-700 font-bold text-lg">₹400 per 25kg</div>
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {shaderColors.map((color) => {
                          const selectedQty = pigmentedSelections[color.id] || 0;
                          return (
                            <div key={color.id} className={`relative flex flex-col items-center p-4 rounded-xl border-2 transition-all duration-200 shadow-sm bg-white group hover:shadow-md ${selectedQty > 0 ? 'border-amber-500 bg-amber-50 shadow-lg scale-105' : 'border-gray-200 hover:border-amber-400'}`}>
                              <div className="w-14 h-14 rounded-full mb-3 border-4 border-white shadow-lg" style={{ background: color.hex }}></div>
                              <div className="font-bold text-gray-800 text-xs mb-3 text-center leading-tight">{color.name}</div>
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  className="w-7 h-7 flex items-center justify-center rounded-full bg-amber-400 text-white font-bold text-sm disabled:opacity-50 shadow hover:bg-amber-500 transition"
                                  onClick={() => setPigmentedSelections(s => ({ ...s, [color.id]: Math.max((s[color.id] || 0) - 1, 0) }))}
                                  disabled={selectedQty === 0}
                                >-</button>
                                <input
                                  type="number"
                                  min={0}
                                  value={selectedQty}
                                  onChange={e => {
                                    const val = Math.max(Number(e.target.value), 0);
                                    setPigmentedSelections(s => ({ ...s, [color.id]: val }));
                                  }}
                                  className="w-10 text-center border-2 border-gray-300 rounded font-bold text-sm focus:ring-2 focus:ring-amber-400 focus:border-amber-400 text-gray-400"
                                />
                                <button
                                  type="button"
                                  className="w-7 h-7 flex items-center justify-center rounded-full bg-amber-400 text-white font-bold text-sm shadow hover:bg-amber-500 transition"
                                  onClick={() => setPigmentedSelections(s => ({ ...s, [color.id]: (s[color.id] || 0) + 1 }))}
                                >+</button>
                              </div>
                              {selectedQty > 0 && (
                                <div className="absolute -top-2 -right-2 bg-amber-400 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">x{selectedQty}</div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                      {/* Summary of selected shades */}
                      {Object.entries(pigmentedSelections).filter(([_, qty]) => qty > 0).length > 0 && (
                        <div className="mt-6 p-4 bg-amber-100 rounded-lg border border-amber-300">
                          <div className="font-semibold mb-3 text-amber-900">Selected Shades:</div>
                          <div className="flex flex-wrap gap-2">
                            {Object.entries(pigmentedSelections).filter(([_, qty]) => qty > 0).map(([shadeId, qty]) => {
                              const color = shaderColors.find(c => c.id === shadeId);
                              return (
                                <div key={shadeId} className="flex items-center gap-2 bg-white px-3 py-2 rounded-full border border-amber-300 shadow-sm">
                                  <span className="w-4 h-4 rounded-full border border-gray-300" style={{ background: color?.hex }}></span>
                                  <span className="text-gray-700 text-sm font-medium">{color?.name}</span>
                                  <span className="text-amber-700 font-bold text-sm">x{qty}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Sample Pack Selection */}
                {productType === 'sample' && (
                  <div className="space-y-4">
                    <div className="flex gap-4">
                      {samplePacks.map(pack => (
                        <button
                          key={pack.size}
                          onClick={() => handleSamplePackChange(pack.size as 3 | 6 | 12)}
                          className={`flex-1 px-6 py-4 rounded-xl border-2 font-bold transition-all duration-300 focus:outline-none ${
                            selectedSamplePack === pack.size 
                              ? 'border-amber-600 bg-amber-100 text-amber-700 shadow-lg' 
                              : 'border-gray-200 bg-white text-gray-700 hover:border-amber-400 hover:shadow-md'
                          }`}
                        >
                          <div>{pack.label}</div>
                          <div className="text-lg">₹{pack.price}</div>
                        </button>
                      ))}
                    </div>
                    <p className="text-sm text-gray-600">
                      {selectedSamplePack === 12 
                        ? 'All 12 colors will be automatically selected'
                        : `Select ${selectedSamplePack} colors from the shader card below`
                      }
                    </p>
                    
                    {/* Shader Card for Sample Selection */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                      <div className="font-semibold text-gray-800 mb-4">Select Colors ({selectedColors.length}/{selectedSamplePack}):</div>
                      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
                        {shaderColors.map(color => (
                          <button
                            key={color.id}
                            onClick={() => handleColorToggle(color.id)}
                            disabled={!selectedColors.includes(color.id) && selectedColors.length >= selectedSamplePack}
                            className={`group relative flex flex-col items-center p-3 rounded-xl border-2 transition-all duration-300 focus:outline-none ${
                              selectedColors.includes(color.id)
                                ? 'border-amber-600 bg-amber-50 shadow-lg scale-105'
                                : selectedColors.length >= selectedSamplePack
                                  ? 'border-gray-200 opacity-50 cursor-not-allowed'
                                  : 'border-gray-200 hover:border-amber-400 hover:shadow-md'
                            }`}
                          >
                            <div 
                              className={`w-12 h-12 rounded-full mb-2 shadow-md border-2 border-white ${
                                selectedColors.includes(color.id) ? 'ring-2 ring-amber-300' : ''
                              }`}
                              style={{ backgroundColor: color.hex }}
                            />
                            <span className="text-xs font-semibold text-gray-800 text-center">{color.name}</span>
                            {selectedColors.includes(color.id) && (
                              <div className="absolute top-2 right-2 w-6 h-6 bg-amber-600 rounded-full flex items-center justify-center">
                                <CheckCircle className="w-4 h-4 text-white" />
                              </div>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sticky Add to Cart Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {productType === 'wallputty' && wallPuttyType === 'neutral' && (
                <span className="text-2xl font-black text-amber-600">₹{pack.price}</span>
              )}
              {productType === 'wallputty' && wallPuttyType === 'pigmented' && getPigmentedTotalQty() > 0 && (
                <span className="text-2xl font-black text-amber-600">Total: ₹{getPigmentedTotalPrice()}</span>
              )}
              {productType === 'sample' && (
                <span className="text-2xl font-black text-amber-600">₹{getCurrentPrice()}</span>
              )}
              <span className="text-sm text-gray-500">Inclusive of all taxes</span>
            </div>
            <button
              onClick={handleAddToCart}
              disabled={!canAddToCart || isAddingToCart}
              className={`px-8 py-3 font-bold rounded-xl shadow-lg transition-all duration-300 flex items-center gap-2 ${
                canAddToCart && !isAddingToCart
                  ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white hover:shadow-xl hover:scale-105'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              <ShoppingCart className="w-5 h-5" />
              {isAddingToCart 
                ? 'Adding...'
                : productType === 'sample' && selectedColors.length < selectedSamplePack
                  ? `Select ${selectedSamplePack - selectedColors.length} more color${selectedSamplePack - selectedColors.length === 1 ? '' : 's'}`
                  : 'Add to Cart'
              }
            </button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-10 text-center">Why Choose Aura?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Shield,
                title: "Natural Air Purification",
                desc: "Removes toxins and improves indoor air quality naturally"
              },
              {
                icon: Leaf,
                title: "Humidity Regulation",
                desc: "Maintains optimal moisture levels for comfort"
              },
              {
                icon: Heart,
                title: "Health Benefits",
                desc: "Promotes respiratory health and wellbeing"
              },
              {
                icon: Sparkles,
                title: "Thermal Insulation",
                desc: "Keeps your space cool in summer and warm in winter"
              },
              {
                icon: Star,
                title: "Fire Resistant",
                desc: "Enhanced safety with natural fire resistance"
              },
              {
                icon: CheckCircle,
                title: "Easy Application",
                desc: "Simple to apply with professional finish"
              }
            ].map((feature, idx) => (
              <div key={idx} className="p-8 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl shadow-lg border border-amber-200 text-center group hover:shadow-2xl transition-all duration-300">
                <div className="w-16 h-16 mx-auto mb-6 flex items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-orange-500 shadow-lg group-hover:scale-110 transition-transform">
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 text-base">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-8">Transform Your Space</h2>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Aura Natural Wall Plaster goes beyond traditional wall finishes. It creates a living, 
                breathing surface that actively contributes to your health and wellbeing.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                    <span className="text-gray-700 font-medium">{benefit}</span>
                  </div>
                ))}
              </div>
              <div className="mt-8">
                <Link href="/contact" className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-amber-600 to-orange-600 text-white font-bold rounded-xl hover:shadow-lg transition-all duration-300 hover:scale-105">
                  <span>Get Free Consultation</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500 to-orange-500 rounded-3xl blur-2xl opacity-20"></div>
              <img
                src="https://picsum.photos/600/500?random=2"
                alt="Aura Application"
                className="relative w-full h-96 object-cover rounded-3xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Application Process */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-12 text-center">Simple Application Process</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-8 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border border-amber-200">
              <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <span className="text-2xl font-bold text-white">1</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Surface Preparation</h3>
              <p className="text-gray-600">Clean and prepare your wall surface for optimal adhesion</p>
            </div>
            <div className="text-center p-8 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border border-amber-200">
              <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <span className="text-2xl font-bold text-white">2</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Application</h3>
              <p className="text-gray-600">Apply Aura plaster using traditional techniques</p>
            </div>
            <div className="text-center p-8 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border border-amber-200">
              <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <span className="text-2xl font-bold text-white">3</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Curing</h3>
              <p className="text-gray-600">Allow natural curing for best results</p>
            </div>
          </div>
        </div>
      </section>

      {/* Shipping & Support */}
      <section className="py-16 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-12 text-center">Shipping & Support</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-8 bg-white rounded-2xl shadow-lg border border-gray-100">
              <Truck className="w-12 h-12 text-amber-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-3">Free Shipping</h3>
              <p className="text-gray-600">Free delivery on orders above ₹2000</p>
            </div>
            <div className="text-center p-8 bg-white rounded-2xl shadow-lg border border-gray-100">
              <Clock className="w-12 h-12 text-amber-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-3">Fast Delivery</h3>
              <p className="text-gray-600">3-5 business days across India</p>
            </div>
            <div className="text-center p-8 bg-white rounded-2xl shadow-lg border border-gray-100">
              <Shield className="w-12 h-12 text-amber-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-3">Quality Guarantee</h3>
              <p className="text-gray-600">100% satisfaction or money back</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-br from-amber-600 to-orange-600">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-black text-white mb-6">Ready to Transform Your Space?</h2>
          <p className="text-xl text-amber-100 mb-8">
            Join thousands of happy customers who have already experienced the benefits of Aura Natural Wall Plaster.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-8 py-4 bg-white text-amber-600 font-bold rounded-xl hover:shadow-lg transition-all duration-300 hover:scale-105">
              Order Now
            </button>
            <Link href="/contact" className="px-8 py-4 border-2 border-white text-white font-bold rounded-xl hover:bg-white hover:text-amber-600 transition-all duration-300">
              Get Consultation
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
} 