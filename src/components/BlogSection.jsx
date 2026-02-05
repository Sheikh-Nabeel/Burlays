import React, { useState, useEffect } from 'react';
import { FaChevronRight } from "react-icons/fa";
import { Link } from 'react-router-dom';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';

const BlogSection = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const savedBranch = localStorage.getItem('selectedBranch');
        if (!savedBranch) {
            setLoading(false);
            return;
        }

        const branch = JSON.parse(savedBranch);
        
        // We need both cityId and branchId to find the document
        if (branch.cityId && branch.id) {
            const branchRef = doc(db, 'cities', branch.cityId, 'branches', branch.id);
            const branchSnap = await getDoc(branchRef);
            
            if (branchSnap.exists()) {
                const data = branchSnap.data();
                if (data.blogs && Array.isArray(data.blogs)) {
                    // Map the blogs to include an index or id if missing, though typically they are just objects in array
                    const mappedBlogs = data.blogs.map((blog, index) => ({
                        id: blog.id || index, // Use index as fallback ID if not present
                        title: blog.title || "Untitled",
                        image: blog.coverImage || "https://via.placeholder.com/400x400?text=No+Image",
                        fallbackImage: "https://via.placeholder.com/400x400?text=No+Image",
                        ...blog
                    }));
                    setBlogs(mappedBlogs);
                }
            }
        }
      } catch (error) {
        console.error("Error fetching blogs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  if (loading || blogs.length === 0) {
    return null; // Don't show section if no blogs or loading (or maybe show skeleton?)
  }

  return (
    <div className="bg-white py-16" id="blogs-section">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Blogs</h2>
          {/* <button className="text-[#E25C1D] font-bold text-sm hover:underline uppercase">
            View All
          </button> */}
        </div>

        {/* Blog Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {blogs.map((blog) => (
            <Link to={`/blog/${blog.id}`} state={{ blog }} key={blog.id} className="group cursor-pointer relative overflow-hidden rounded-xl aspect-square">
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
                        Read more
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
