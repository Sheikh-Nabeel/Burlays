import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { getBlogById } from '../utils/blogData';

const BlogDetail = () => {
  const { blogId } = useParams();
  const blog = getBlogById(blogId);

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
              src={blog.authorImage} 
              alt={blog.author} 
              className="w-8 h-8 rounded-full object-cover"
            />
            <span className="font-semibold text-gray-900">{blog.author}</span>
          </div>
          <span>|</span>
          <span>Published on: {blog.date}</span>
          <span>|</span>
          <span>{blog.readTime}</span>
        </div>

        {/* Featured Image */}
        <div className="w-full aspect-video rounded-2xl overflow-hidden mb-12">
            <img 
                src={blog.image} 
                onError={(e) => {e.target.src = blog.fallbackImage}}
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
