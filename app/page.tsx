'use client';

import { useState } from 'react';
import Image from 'next/image';

// 1. DATA CONFIGURATION & METADATA FOR THE AUTOMATED LOOP
const CATEGORIES = ['all', 'custom-shapes', 'birthdays', 'wedding-anniversary', 'cupcakes-hampers'] as const;

const FLAVOR_COMBOS = [
  ['Belgian Chocolate Truffle', 'Dark Ganache'],
  ['Classic Red Velvet', 'Cream Cheese Frosting'],
  ['Vanilla Bean Mascarpone', 'Fresh Berries'],
  ['Salted Caramel', 'Toasted Hazelnut Crunch'],
  ['Lotus Biscoff Premium', 'White Chocolate'],
  ['Almond Praline', 'Rich Espresso Cream']
];

const DESCRIPTIONS = [
  "A masterpiece designed completely around your celebration theme with immaculate structural execution.",
  "Elegantly finished with minimal luxury textures, subtle pastel tones, and completely customized formatting.",
  "Crafted with hand-piped artisanal details, ultra-smooth premium crumb coat, and layers of rich flavor.",
  "Perfect for milestone moments. Features clean structural scaling, bold artistic geometry, and divine taste.",
  "An exquisite selection meticulously baked to elevate your party aesthetic and deliver an unmatched dessert experience."
];

// 2. DYNAMICALLY GENERATING CATALOG ITEMS MATCHING YOUR 42 PARSED IMAGES
const CAKE_CATALOG = Array.from({ length: 42 }, (_, index) => {
  const fileNumber = index + 1; // Maps perfectly to /catalog/cake_1.jpg -> cake_42.jpg
  
  // Deterministic math arrays to keep data structure stable on hot-reloads
  // Using categories 1 to 4 so 'all' remains purely a master functional filter
  const categoryIndex = 1 + ((fileNumber * 3) % (CATEGORIES.length - 1)); 
  const flavorIndex = (fileNumber * 7) % FLAVOR_COMBOS.length;
  const descIndex = (fileNumber * 2) % DESCRIPTIONS.length;
  
  const selectedCategory = CATEGORIES[categoryIndex];
  
  // Dynamic Pricing Tier assignments based on structural categories
  let basePrice = 1200;
  if (selectedCategory === 'custom-shapes') basePrice = 1800;
  if (selectedCategory === 'wedding-anniversary') basePrice = 2200;
  if (selectedCategory === 'cupcakes-hampers') basePrice = 650;

  const prettyCategoryName = selectedCategory
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
  
  return {
    id: `cake-${fileNumber}`,
    title: `Premium ${prettyCategoryName} Design #${100 + fileNumber}`,
    category: selectedCategory,
    price: basePrice + ((fileNumber * 50) % 400), // Adds organic pricing variety
    image: `/catalog/cake_${fileNumber}.jpg`,     // Direct link matching your Python download pipeline
    description: DESCRIPTIONS[descIndex],
    flavors: FLAVOR_COMBOS[flavorIndex]
  };
});

export default function Home() {
  const [activeTab, setActiveTab] = useState<typeof CATEGORIES[number]>('all');

  // Filter functionality block
  const filteredCakes = activeTab === 'all' 
    ? CAKE_CATALOG 
    : CAKE_CATALOG.filter(cake => cake.category === activeTab);

  // Conversion-focused WhatsApp routing mechanism
  const handleWhatsAppOrder = (cakeTitle: string) => {
    const message = encodeURIComponent(
      `Hi Cakes n' Shapes! I saw the beautiful "${cakeTitle}" on your website catalog and would love to discuss custom sizing, flavor availability, and pricing options for an upcoming event.`
    );
    // Replace with your client's genuine WhatsApp contact number when ready for deployment
    window.open(`https://wa.me/919869600561?text=${message}`, '_blank'); 
  };

  return (
    <div className="bg-[#FFFDF9] min-h-screen text-[#4A3728] antialiased">
      
      {/* 1. BRAND NAVIGATION HEADER */}
      <header className="sticky top-0 z-50 bg-[#FFFDF9]/90 backdrop-blur-md border-b border-stone-100 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          {/* Logo Identity Context */}
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 rounded-full overflow-hidden border border-stone-200">
              <Image 
                src="/logo.png" 
                alt="Cakes n' Shapes Logo" 
                fill
                className="object-cover"
                priority
              />
            </div>
            <span className="font-serif font-medium tracking-wide text-lg text-[#4A3728]">
              Cakes n&apos; Shapes
            </span>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-semibold tracking-wider uppercase text-stone-600">
            <a href="#catalog" className="hover:text-[#E8A7A1] transition-colors">The Collection</a>
            <a 
              href="https://www.instagram.com/cakes_n_shapes73" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="hover:text-[#E8A7A1] transition-colors"
            >
              Instagram Profile
            </a>
          </nav>

          {/* Direct Pipeline Call-To-Action */}
          <div>
            <button 
              onClick={() => handleWhatsAppOrder('General Custom Inquiry')}
              className="border border-[#4A3728] text-[#4A3728] px-5 py-2 rounded-full text-xs font-semibold tracking-wider uppercase hover:bg-[#4A3728] hover:text-white transition-all duration-300"
            >
              Inquire Now
            </button>
          </div>

        </div>
      </header>

      {/* 2. HERO STATEMENT BANNER */}
      <section className="relative h-[80vh] flex items-center justify-center bg-gradient-to-b from-[#FDF0EE] to-[#FFFDF9] px-6 text-center">
        <div className="max-w-3xl space-y-6">
          <span className="text-xs tracking-[0.25em] uppercase text-[#E8A7A1] font-semibold">Artisanal Custom Bakery</span>
          <h1 className="text-5xl md:text-7xl font-serif font-light leading-tight">
            Where Art Meets <span className="italic font-normal text-[#E8A7A1]">Confectionery</span>
          </h1>
          <p className="text-sm md:text-base text-stone-600 max-w-xl mx-auto font-light leading-relaxed">
            Crafting premium bespoke custom cakes, elegant shapes, and unforgettable flavors for your milestone celebrations.
          </p>
          <div className="pt-4">
            <a 
              href="#catalog" 
              className="bg-[#4A3728] text-white px-8 py-3 rounded-full text-xs font-semibold tracking-wider uppercase hover:bg-opacity-90 transition-all duration-300 shadow-md"
            >
              Explore Our Catalog
            </a>
          </div>
        </div>
      </section>

      {/* 3. CATALOUGE CONTEXT & GRID FILTERS */}
      <section id="catalog" className="max-w-7xl mx-auto px-6 py-24">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between border-b border-stone-200 pb-8 mb-12">
          <div>
            <h2 className="text-3xl font-serif">The Collection</h2>
            <p className="text-xs text-stone-500 mt-1">Browse our hand-crafted structural selections and design styles</p>
          </div>
          
          {/* Functional Filters Tab Bar */}
          <div className="flex flex-wrap gap-2 mt-6 lg:mt-0">
            {CATEGORIES.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-2 rounded-full text-xs font-medium tracking-wide transition-all uppercase ${
                  activeTab === tab 
                    ? 'bg-[#E8A7A1] text-white shadow-sm' 
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                {tab.replace('-', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* 4. PRODUCT CARD RENDER ENGINE */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredCakes.map((cake) => (
            <div 
              key={cake.id} 
              className="group bg-white rounded-2xl overflow-hidden border border-stone-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full"
            >
              {/* Product Visual Container */}
              <div className="relative aspect-square w-full bg-stone-100 overflow-hidden">
                <div className="absolute inset-0 bg-black/5 group-hover:bg-black/0 transition-colors z-10" />
                <Image 
                  src={cake.image} 
                  alt={cake.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-w-1200px) 33vw, 50vw"
                />
              </div>

              {/* Product Copy Block */}
              <div className="p-6 flex flex-col flex-grow justify-between space-y-4">
                <div>
                  <div className="flex justify-between items-start">
                    <h3 className="font-serif text-lg leading-snug group-hover:text-[#E8A7A1] transition-colors">
                      {cake.title}
                    </h3>
                    <span className="text-sm font-semibold whitespace-nowrap ml-4">
                      ₹{cake.price}+
                    </span>
                  </div>
                  <p className="text-xs text-stone-500 font-light mt-2 line-clamp-2 leading-relaxed">
                    {cake.description}
                  </p>
                  
                  {/* Dynamic Custom Ingredients/Flavors Markers */}
                  <div className="flex flex-wrap gap-1 mt-3">
                    {cake.flavors.map((flv, idx) => (
                      <span 
                        key={idx} 
                        className="bg-stone-50 border border-stone-200/60 text-[10px] text-stone-600 px-2 py-0.5 rounded"
                      >
                        {flv}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Main Conversion CTA Element */}
                <button 
                  onClick={() => handleWhatsAppOrder(cake.title)}
                  className="w-full bg-[#4A3728] text-white py-3 rounded-xl text-xs font-semibold tracking-wider uppercase group-hover:bg-[#E8A7A1] transition-colors duration-300 flex items-center justify-center gap-2 shadow-sm"
                >
                  <span>Order / Inquire via WhatsApp</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. BRAND TAILPIECE / CALLOUT SECTION */}
      <section className="bg-[#FDF0EE] py-20 text-center px-6">
        <div className="max-w-xl mx-auto space-y-4">
          <h3 className="font-serif text-2xl">Have a custom design in mind?</h3>
          <p className="text-xs text-stone-600 font-light leading-relaxed">
            We specialize in turning complex 3D themes, elegant geometry, and specialized celebratory motifs into delicious realities. Share your references directly to lock in custom configurations.
          </p>
          <div className="pt-2">
            <a 
              href="https://www.instagram.com/cakes_n_shapes73" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-xs underline tracking-widest uppercase text-[#4A3728] font-semibold hover:text-[#E8A7A1] transition-colors"
            >
              Follow Our Journey On Instagram
            </a>
          </div>
        </div>
      </section>

    </div>
  );
}