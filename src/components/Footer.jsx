import React from "react";
import {
  FaMapMarkerAlt,
  FaPhone,
  FaEnvelope,
  FaFacebook,
  FaInstagram,
} from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="bg-white border-t border-grayLight py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Logo & Tagline */}
          <div className="col-span-1 lg:col-span-2">
            <img src="/logo.png" alt="CodesSpark" className="h-16 mb-4" />
            <p className="text-darkSecondary text-lg italic mb-4">
              Igniting Innovation with Code
            </p>
            <p className="text-gray-600 text-sm">
              CodesSpark is a creative software agency specializing in modern
              web and app development. We blend innovation, technology, and
              design to craft solutions that empower businesses worldwide.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-darkSecondary font-semibold text-lg mb-4">
              Quick Links
            </h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="#"
                  className="text-gray-600 hover:text-primary transition-colors"
                >
                  Home
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-600 hover:text-primary transition-colors"
                >
                  Products
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-600 hover:text-primary transition-colors"
                >
                  About Us
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-600 hover:text-primary transition-colors"
                >
                  Contact
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-darkSecondary font-semibold text-lg mb-4">
              Contact Us
            </h3>
            <div className="space-y-4 text-gray-600 text-sm">
              {/* 🇵🇰 Pakistan Branch */}
              <div>
                <div className="flex items-start">
                  <FaMapMarkerAlt className="w-4 h-4 mr-2 mt-1 flex-shrink-0" />
                  <span>
                    Main Bazaar Charhoi, Gornal,
                    <br />
                    District Kotli, Azad Kashmir, Pakistan
                  </span>
                </div>
                <div className="flex items-center mt-2">
                  <FaPhone className="w-4 h-4 mr-2 flex-shrink-0" />
                  <a
                    href="tel:00447777279710"
                  className="hover:text-primary transition"
                >
                  00447777279710
                </a>
              </div>
              </div>

              {/* ✉️ Email */}
              <div className="flex items-center">
                <FaEnvelope className="w-4 h-4 mr-2 flex-shrink-0" />
                <a
                  href="mailto:contact@riazbakers.co.uk"
                  className="hover:text-primary transition"
                >
                  contact@riazbakers.co.uk
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Social Icons & Copyright */}
        <div className="border-t border-grayLight mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex space-x-4 mb-4 md:mb-0">
              <a
                href="#"
                className="bg-grayLight hover:bg-primary p-3 rounded-full transition-colors"
              >
                <FaFacebook className="w-5 h-5 text-darkSecondary" />
              </a>
              <a
                href="#"
                className="bg-grayLight hover:bg-primary p-3 rounded-full transition-colors"
              >
                <FaInstagram className="w-5 h-5 text-darkSecondary" />
              </a>
              <a
                href="#"
                className="bg-grayLight hover:bg-primary p-3 rounded-full transition-colors"
              >
                <FaPhone className="w-5 h-5 text-darkSecondary" />
              </a>
            </div>
            <div className="text-gray-600 text-sm text-center md:text-right">
              <p>© {new Date().getFullYear()}{" "}
                <span className="text-darkSecondary font-semibold">Albasti</span>. All
                rights reserved.
              </p>
              <p>Powered by Albasti</p>
              <p>Developed by Ali Aqdas</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
