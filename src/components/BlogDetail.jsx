import React, { useEffect, useState } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';

const BlogDetail = () => {
  const { blogId } = useParams();
  const location = useLocation();
  const [blog, setBlog] = useState(location.state?.blog || null);
  const [loading, setLoading] = useState(!blog);

  useEffect(() => {
    // If we already have the blog from navigation state, no need to fetch
    if (blog) return;

    const fetchBlog = async () => {
      try {
        const savedBranch = localStorage.getItem('selectedBranch');
        if (!savedBranch) {
            setLoading(false);
            return;
        }

        const branch = JSON.parse(savedBranch);
        
        if (branch.cityId && branch.id) {
            const branchRef = doc(db, 'cities', branch.cityId, 'branches', branch.id);
            const branchSnap = await getDoc(branchRef);
            
            if (branchSnap.exists()) {
                const data = branchSnap.data();
                if (data.blogs && Array.isArray(data.blogs)) {
                    // Find the blog with the matching ID (or index if used as ID)
                    const foundBlog = data.blogs.find((b, index) => (b.id || String(index)) === blogId);
                    
                    if (foundBlog) {
                         setBlog({
                            id: foundBlog.id || blogId,
                            title: foundBlog.title || "Untitled",
                            image: foundBlog.coverImage || "https://via.placeholder.com/800x400?text=No+Image",
                            fallbackImage: "https://via.placeholder.com/800x400?text=No+Image",
                            author: foundBlog.author || "Burlays Team",
                            authorImage: foundBlog.authorImage || "https://ui-avatars.com/api/?name=Burlays",
                            date: foundBlog.createdAt?.toDate ? foundBlog.createdAt.toDate().toLocaleDateString() : (foundBlog.createdAt || new Date().toLocaleDateString()),
                            readTime: foundBlog.readTime || "5 min read",
                            content: foundBlog.content || ""
                        });
                    }
                }
            }
        }
      } catch (error) {
        console.error("Error fetching blog details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBlog();
  }, [blogId, blog]);

  if (loading) {
    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-[#FFC72C] border-t-transparent rounded-full animate-spin"></div>
        </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Blog Post Not Found</h2>
          <Link to="/" className="text-[#E25C1D] hover:underline">Back to Home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-20">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Title */}
        <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
          {blog.title}
        </h1>

        {/* Metadata */}
        <div className="flex items-center gap-4 mb-12 text-sm text-gray-600 border-b pb-8">
          <div className="flex items-center gap-2">
            <img 
              src={blog.authorImage || "https://ui-avatars.com/api/?name=Burlays"} 
              alt={blog.author} 
              className="w-8 h-8 rounded-full object-cover"
            />
            <span className="font-semibold text-gray-900">{blog.author || "Burlays Team"}</span>
          </div>
          <span>|</span>
          <span>Published on: {blog.date || (blog.createdAt?.toDate ? blog.createdAt.toDate().toLocaleDateString() : new Date().toLocaleDateString())}</span>
          <span>|</span>
          <span>{blog.readTime || "3 min read"}</span>
        </div>

        {/* Featured Image */}
        <div className="w-full aspect-video rounded-2xl overflow-hidden mb-12">
            <img 
                src={blog.image || blog.coverImage} 
                onError={(e) => {e.target.src = blog.fallbackImage || "https://via.placeholder.com/800x400?text=No+Image"}}
                alt={blog.title} 
                className="w-full h-full object-cover"
            />
        </div>

        {/* Content */}
        <div 
          className="prose prose-lg max-w-none prose-headings:font-bold prose-a:text-[#E25C1D]"
          dangerouslySetInnerHTML={{ __html: blog.content }}
        />
      </div>
    </div>
  );
};

export default BlogDetail;
