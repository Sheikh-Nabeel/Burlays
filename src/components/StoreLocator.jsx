import React, { useState } from "react";
import {
  FaMapMarkerAlt,
  FaClock,
  FaPhone,
  FaExternalLinkAlt,
} from "react-icons/fa";

const COLORS = {
  primary: "#FFC72C",
  primaryDark: "#FFC72C",
  darkBg: "#000000",
  darkSecondary: "#1E1E1E",
  white: "#FFFFFF",
  gray: "#F1F3F4",
};

const BRANCHES = [
  {
    id: 1,
    name: "Al-Riaz Bakers, Fast Food, Restaurant & General Store",
    timing: "6 AM - 11 PM",
    phone: "+92 344 5556665",
    image: "/branch1.png",
    mapsUrl: "https://maps.app.goo.gl/tr9MB8xDn7GhnDuP8?g_st=ipc",
    address: "Main Bazaar, Charhoi, District Kotli, Azad Kashmir, Pakistan",
  },
  {
    id: 2,
    name: "Riaz Bakers & Restaurant Branch 2",
    timing: "6 AM - 11 PM",
    phone: "+92 348 8464800",
    image: "/branch2.png",
    mapsUrl: "https://maps.app.goo.gl/sgh8ak9HRvnEoqWeA?g_st=ipc",
    address:
      "Riaz Bakers Branch 2, Near Charhoi Bypass Road, Kotli, AJK, Pakistan",
  },
  {
    id: 3,
    name: "Riaz bakers UK branch",
    timing: "6 AM - 11 PM",
    phone: "00447777279710",
    image: "/branch3.jpg",
    mapsUrl: "https://maps.app.goo.gl/sgh8ak9HRvnEoqWeA?g_st=ipc",
    address: "Riaz Bakers Branch 3, 221B Baker Street, London, UK",
  },
];


const StoreLocator = () => {
  const [selectedBranch, setSelectedBranch] = useState(0);
  const [activeTab, setActiveTab] = useState("branches");

  const TABS = [
    { key: "branches", label: "Branches Location" },
    { key: "download", label: "Download APP" },
    { key: "brand", label: "Brand Story" },
  ];

  return (
    <div className="bg-black py-20 min-h-screen">
      <div className="max-w-7xl mx-auto px-4">
        {/* Tab Headers */}
        <div className="flex space-x-6 justify-center mb-10 relative">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`relative text-lg font-semibold px-4 py-2 transition-colors ${
                activeTab === tab.key ? "text-white" : "text-gray-400"
              }`}
            >
              {tab.label}
              {activeTab === tab.key && (
                <span
                  className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-3/5 h-[3px] rounded-full"
                  style={{ backgroundColor: COLORS.primary }}
                />
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === "branches" && (
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Left Side - Branch List */}
            <div className="space-y-4">
              <h3 className="text-2xl font-bold text-white mb-6">
                Our Branches
              </h3>
              {BRANCHES.map((branch, index) => (
                <div
                  key={branch.id}
                  onClick={() => setSelectedBranch(index)}
                  className={`p-4 rounded-lg cursor-pointer transition-all ${
                    selectedBranch === index
                      ? "text-white"
                      : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                  }`}
                  style={{
                    backgroundColor:
                      selectedBranch === index ? COLORS.primary : undefined,
                  }}
                >
                  <div className="flex items-start space-x-4">
                    <div className="mt-1">
                      <FaMapMarkerAlt className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-lg">{branch.name}</h4>
                      <p className="text-sm opacity-80">{branch.address}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Right Side - Branch Details */}
            <div
              className="rounded-xl p-6"
              style={{ backgroundColor: COLORS.darkSecondary }}
            >
              <h3
                className="text-2xl font-bold mb-4"
                style={{ color: COLORS.primary }}
              >
                {BRANCHES[selectedBranch].name}
              </h3>

              <div className="space-y-3 mb-6 text-gray-300">
                <div className="flex items-center">
                  <FaClock className="w-5 h-5 mr-3" />
                  <span>Timing: {BRANCHES[selectedBranch].timing}</span>
                </div>

                <div className="flex items-center">
                  <FaPhone className="w-5 h-5 mr-3" />
                  <a
                    href={`tel:${BRANCHES[selectedBranch].phone.replace(
                      /\s/g,
                      ""
                    )}`}
                  className="hover:text-[#FFC72C] transition"
                  >
                    {BRANCHES[selectedBranch].phone}
                  </a>
                </div>

                <div className="flex items-center">
                  <FaMapMarkerAlt className="w-5 h-5 mr-3" />
                  <a
                    href={BRANCHES[selectedBranch].mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  className="hover:text-[#FFC72C] transition"
                  >
                    {BRANCHES[selectedBranch].address}
                  </a>
                </div>
              </div>

              <img
                src={BRANCHES[selectedBranch].image}
                alt={BRANCHES[selectedBranch].name}
                className="w-full h-64 object-cover rounded-lg mb-6"
              />

              <a
                href={BRANCHES[selectedBranch].mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-6 py-3 rounded-lg font-semibold transition-colors"
                style={{
                  backgroundColor: COLORS.primary,
                  color: COLORS.white,
                }}
              >
                <FaExternalLinkAlt className="w-5 h-5 mr-2" />
                Get Directions
              </a>
            </div>
          </div>
        )}

        {/* Download App Tab */}
        {activeTab === "download" && (
          <div className="grid md:grid-cols-2 gap-10 items-center mt-16">
            <div className="flex justify-center md:justify-end gap-4">
              <img
                src="/appimg.png"
                alt="App Preview 1"
                className="max-w-[160px] md:max-w-[300px] drop-shadow-lg"
              />
            </div>

            <div className="text-white text-center md:text-left space-y-6">
              <p className="text-sm tracking-widest font-semibold uppercase" style={{ color: '#FFC72C' }}>
                Enhance your ordering experience
              </p>
              <h2 className="text-xl md:text-2xl font-bold leading-tight">
                Get Our Mobile App For <br /> Faster Ordering
              </h2>
              <p className=" text-gray-400">
                Enjoy exclusive app-only benefits, faster checkout, order
                tracking, and special discounts.
              </p>

              <div className="flex justify-center md:justify-start gap-4 mt-4">
                <a href="#" target="_blank" rel="noopener noreferrer">
                  <img
                    src="/playstore.png"
                    alt="Google Play"
                    className="h-10"
                  />
                </a>
                <a href="#" target="_blank" rel="noopener noreferrer">
                  <img src="/appstore.png" alt="App Store" className="h-10" />
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Brand Story Tab */}
        {activeTab === "brand" && (
          <div className="mt-10 space-y-10">
            <h2 className="text-center text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#FFC72C] to-[#FFC72C]">
              OUR JOURNEY
            </h2>

            <div className="flex flex-col lg:flex-row gap-8 p-4 bg-[#140e0e] rounded-xl">
              {/* Left Image */}
              <div className="lg:w-1/2">
                <img
                  src="/main.jpg"
                  alt="Riaz Bakers Store"
                  className="w-full h-[60vh] rounded-xl object-cover shadow-xl shadow-[#380303]"
                />
              </div>

              {/* Right Text */}
              <div className="lg:w-1/2 p-8 rounded-xl">
                <h3 className="text-3xl font-bold mb-4 text-[#FFC72C]">
                  Al Riaz Bakers
                </h3>
                <p className="text-gray-300 mb-6">
                  Since 1998, Al Riaz Bakers has been crafting unforgettable
                  flavors in the heart of Charhoi, AJK. What began as a modest
                  family bakery has grown into a beloved institution, where
                  tradition meets innovation in every recipe.
                </p>

                {/* Value Cards */}
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { title: "Organic", subtitle: "Ingredients" },
                    { title: "Fresh", subtitle: "Daily baking" },
                    { title: "Traditional", subtitle: "Family recipes" },
                    { title: "Community", subtitle: "Local favorite" },
                  ].map((item, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-lg border border-[#FFC72C] bg-black/40 text-white shadow-md flex flex-col justify-center items-start"
                    >
                      <h4 className="font-semibold">{item.title}</h4>
                      <p className="text-sm text-gray-300">{item.subtitle}</p>
                    </div>
                  ))}
                </div>

                {/* Founder */}
                <p className="mt-6 text-[#FFC72C] font-semibold italic">
                  Muhammad Riaz Ahmed, Founder & Master Baker
                </p>
              </div>
            </div>

            {/* Timeline */}
            <div className="flex flex-wrap justify-center gap-6 mt-12">
              {[
                {
                  year: "1998",
                  title: "Founded",
                  subtitle: "Small bakery in Charhoi",
                },
                {
                  year: "2005",
                  title: "First Expansion",
                  subtitle: "New equipment & staff",
                },
                { year: "2012", title: "Award", subtitle: "Best local bakery" },
                {
                  year: "2020",
                  title: "Modernized",
                  subtitle: "Facility upgrades",
                },
                { year: "2025", title: "Digital", subtitle: "Online presence" },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="flex flex-col items-center p-4 rounded-lg shadow-lg"
                  style={{ backgroundColor: COLORS.darkSecondary }}
                >
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold mb-2"
                    style={{ backgroundColor: COLORS.primary }}
                  >
                    {item.year}
                  </div>
                  <h4 className="text-white font-semibold">{item.title}</h4>
                  <p className="text-gray-400 text-sm text-center">
                    {item.subtitle}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StoreLocator;
