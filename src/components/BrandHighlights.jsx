import React, { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

const defaultHighlights = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1617347454431-f49d7ff5c3b1?w=500&auto=format&fit=crop&q=60",
    fallbackImage: "https://images.unsplash.com/photo-1617347454431-f49d7ff5c3b1?w=500&auto=format&fit=crop&q=60",
    title: "Delivering tasty happiness",
    description: "We deliver happiness at your doorstep."
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1531545514256-b1400bc00f31?w=500&auto=format&fit=crop&q=60",
    fallbackImage: "https://images.unsplash.com/photo-1531545514256-b1400bc00f31?w=500&auto=format&fit=crop&q=60",
    title: "Fastest Growing Brand of the Year",
    description: "Awarded for our commitment to quality."
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&auto=format&fit=crop&q=60",
    fallbackImage: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&auto=format&fit=crop&q=60",
    title: "Made with fresh, local ingredients and love",
    description: "Quality ingredients for the best taste."
  }
];

const BrandHighlights = () => {
  const [highlights, setHighlights] = useState(defaultHighlights);

  useEffect(() => {
    const fetchHighlights = async () => {
      try {
        const selectedBranch = JSON.parse(localStorage.getItem('selectedBranch'));
        if (!selectedBranch) return;

        const branchRef = doc(db, `cities/${selectedBranch.cityId}/branches/${selectedBranch.id}`);
        const branchSnap = await getDoc(branchRef);

        if (branchSnap.exists()) {
          const data = branchSnap.data();
          if (data.features && Array.isArray(data.features) && data.features.length > 0) {
            const mappedFeatures = data.features.map((feature, index) => ({
              id: index,
              image: feature.image_path || "https://via.placeholder.com/500", 
              title: feature.title || "",
              description: "" 
            }));
            setHighlights(mappedFeatures);
          }
        }
      } catch (error) {
        console.error("Error fetching brand highlights:", error);
      }
    };

    fetchHighlights();
  }, []);

  if (highlights.length === 0) return null;

  return (
    <div className="bg-white py-16">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {highlights.map((item) => (
            <div key={item.id} className="flex flex-col gap-4 group cursor-pointer">
              <div className="rounded-2xl overflow-hidden aspect-square bg-gray-100 relative">
                <img 
                  src={item.image} 
                  onError={(e) => {e.target.src = item.fallbackImage || "https://via.placeholder.com/500"}}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <h3 className="text-xl font-bold text-gray-900 leading-tight pr-4">
                {item.title}
              </h3>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BrandHighlights;
