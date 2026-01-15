"use client";

import { useState, useEffect, useRef } from 'react';

interface PexelsImage {
  id: number;
  url: string;
  thumbnail: string;
  photographer: string;
  photographerUrl: string;
  alt: string;
  width: number;
  height: number;
}

interface ImagePickerProps {
  onSelect: (imageUrl: string) => void;
  currentImage?: string;
  onClose: () => void;
}

export default function ImagePicker({ onSelect, currentImage, onClose }: ImagePickerProps) {
  const [query, setQuery] = useState('');
  const [activeQuery, setActiveQuery] = useState('nature');
  const [images, setImages] = useState<PexelsImage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Load popular images on mount
  useEffect(() => {
    searchImages('nature', 1);
  }, []);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const searchImages = async (searchQuery: string, pageNum: number = 1) => {
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    setError('');
    setActiveQuery(searchQuery.trim());

    try {
      const response = await fetch(
        `/api/pexels/search?query=${encodeURIComponent(searchQuery)}&page=${pageNum}&per_page=20`,
        {
          credentials: 'include',
        }
      );

      const result = await response.json();

      if (result.success) {
        if (pageNum === 1) {
          setImages(result.images);
        } else {
          setImages((prev) => [...prev, ...result.images]);
        }
        setPage(result.page ?? pageNum);
        setHasMore(Boolean(result.nextPage) || (result.images?.length ?? 0) === 20);
      } else {
        setError(result.error || 'Failed to search images');
      }
    } catch (err) {
      console.error('Search error:', err);
      setError('Failed to search images');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setPage(1);
      searchImages(query, 1);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);

    // Debounce search
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      if (value.trim()) {
        setPage(1);
        searchImages(value, 1);
      }
    }, 500);
  };

  const loadMore = () => {
    if (!isLoading && hasMore && activeQuery.trim()) {
      searchImages(activeQuery, page + 1);
    }
  };

  const handleSelect = (image: PexelsImage) => {
    onSelect(image.url);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div
        ref={modalRef}
        className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Search Images</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b border-gray-200">
          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              type="text"
              value={query}
              onChange={handleInputChange}
              placeholder="Search for images (e.g., nature, technology, abstract)..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              autoFocus
            />
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Search
            </button>
          </form>
          {error && (
            <p className="mt-2 text-sm text-red-600">{error}</p>
          )}
        </div>

        {/* Image Grid */}
        <div className="flex-1 overflow-y-auto p-4">
          {isLoading && images.length === 0 ? (
            <div className="flex items-center justify-center h-64">
              <p className="text-gray-500">Searching images...</p>
            </div>
          ) : images.length === 0 ? (
            <div className="flex items-center justify-center h-64">
              <p className="text-gray-500">No images found. Try a different search term.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {images.map((image) => {
                const imageUrl = image.thumbnail || image.url;
                if (!imageUrl) {
                  console.error('No image URL for image:', image.id);
                  return null;
                }
                
                return (
                  <button
                    key={image.id}
                    onClick={() => handleSelect(image)}
                    className="group relative w-full overflow-hidden rounded-lg border-2 border-gray-200 hover:border-purple-500 transition-all bg-gray-50"
                    type="button"
                    style={{ 
                      height: '150px',
                      position: 'relative'
                    }}
                  >
                    <img
                      src={imageUrl}
                      alt={image.alt}
                      className="block w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      style={{ 
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                      onError={(e) => {
                        // Fallback to full URL if thumbnail fails
                        const target = e.target as HTMLImageElement;
                        if (target.src !== image.url && image.url) {
                          target.src = image.url;
                        }
                      }}
                      onLoad={(e) => {
                        // Image loaded successfully
                        const target = e.target as HTMLImageElement;
                        target.style.opacity = '1';
                      }}
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-opacity flex items-center justify-center pointer-events-none" style={{ zIndex: 10 }}>
                      <span className="text-white opacity-0 group-hover:opacity-100 text-sm font-medium">
                        Select
                      </span>
                    </div>
                    {currentImage === image.url && (
                      <div className="absolute top-2 right-2 bg-purple-600 text-white rounded-full p-1.5 shadow-lg" style={{ zIndex: 20 }}>
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* Load More Button */}
          {hasMore && !isLoading && (
            <div className="mt-4 text-center">
              <button
                onClick={loadMore}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Load More
              </button>
            </div>
          )}

          {isLoading && images.length > 0 && (
            <div className="mt-4 text-center">
              <p className="text-gray-500">Loading more images...</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 text-xs text-gray-500 text-center">
          Images provided by{' '}
          <a
            href="https://www.pexels.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-purple-600 hover:underline"
          >
            Pexels
          </a>
        </div>
      </div>
    </div>
  );
}
