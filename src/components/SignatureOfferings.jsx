import React from "react";

const SignatureOfferings = () => {
  return (
    <>
      <section className="py-20 text-white">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-5xl font-extrabold mb-16">OUR SIGNATURE OFFERINGS</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-[80%] mx-auto">
            <div className="bg-[#1E1E1E] rounded-2xl p-8 py-12 hover:border border-[#FFC72C] flex flex-col items-center space-y-4">
              <div className="border border-[#FFC72C] rounded-full p-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-10 w-10 text-[#FFC72C]"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 3c.828 0 1.5.672 1.5 1.5S12.828 6 12 6s-1.5-.672-1.5-1.5S11.172 3 12 3zm5 8H7c-1.104 0-2 .896-2 2v2h14v-2c0-1.104-.896-2-2-2zm2 5H5v2c0 1.104.896 2 2 2h10c1.104 0 2-.896 2-2v-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold">Artisan Cakes</h3>
              <p className="text-gray-300">
                Hand-decorated masterpieces for your celebrations
              </p>
            </div>

            <div className="bg-[#1E1E1E] rounded-2xl p-8 hover:border border-[#FFC72C] py-12 flex flex-col items-center space-y-4">
              <div className="border border-[#FFC72C] rounded-full p-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-10 w-10 text-[#FFC72C]"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M3 13h1.18a3 3 0 015.64 0h5.36a3 3 0 015.64 0H21v-2h-1.34l-1.6-3.2A2 2 0 0016.34 6H6.66a2 2 0 00-1.72 1.05L3.34 11H3v2zm5.5 3a1.5 1.5 0 11.001 3.001A1.5 1.5 0 018.5 16zm9 0a1.5 1.5 0 11.001 3.001A1.5 1.5 0 0117.5 16z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold">Express Delivery</h3>
              <p className="text-gray-300">
                Freshness guaranteed within 30 minutes
              </p>
            </div>

            <div className="bg-[#1E1E1E] rounded-2xl p-8 py-12 hover:border border-[#FFC72C] flex flex-col items-center space-y-4">
              <div className="border border-[#FFC72C] rounded-full p-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-10 w-10 text-[#FFC72C]"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2C6.48 2 2 6.48 2 12c0 4.12 2.5 7.64 6 9.17C8.33 20.45 10 18.37 10 16h4c0 2.37 1.67 4.45 2 5.17 3.5-1.53 6-5.05 6-9.17 0-5.52-4.48-10-10-10zm-2.5 12a1.5 1.5 0 11.001-3.001A1.5 1.5 0 019.5 14zm5 0a1.5 1.5 0 11.001-3.001A1.5 1.5 0 0114.5 14z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold">Gourmet Pizzas</h3>
              <p className="text-gray-300">
                Stone-fired perfection with premium ingredients
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default SignatureOfferings;
