import React from 'react';
import { FaChevronRight } from "react-icons/fa";
import { Link } from 'react-router-dom';
import { BLOGS } from '../utils/blogData';

const BlogSection = () => {
  return (
    <div className="bg-white py-16">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Blogs</h2>
          <button className="text-[#E25C1D] font-bold text-sm hover:underline uppercase">
            View All
          </button>
        </div>

        {/* Blog Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {BLOGS.map((blog) => (
            <Link to={`/blog/${blog.id}`} key={blog.id} className="group cursor-pointer relative overflow-hidden rounded-xl aspect-square">
              {/* Background Image */}
              <img 
                src={blog.image} 
                onError={(e) => {e.target.src = blog.fallbackImage}}
                alt={blog.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>

              {/* Content */}
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <h3 className="font-bold text-lg mb-4 leading-tight">
                    {blog.title}
                </h3>
                <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold opacity-90 group-hover:opacity-100 transition-opacity">
                        Learn more
                    </span>
                    <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center group-hover:bg-[#FFC72C] group-hover:text-black transition-colors">
                        <FaChevronRight className="w-3 h-3" />
                    </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BlogSection;
