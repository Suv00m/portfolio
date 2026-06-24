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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'oklch(0% 0 0 / 0.72)' }}>
      <div
        ref={modalRef}
        className="w-full max-w-4xl max-h-[90vh] flex flex-col rounded-lg"
        style={{
          background: 'var(--bg-subtle)',
          border: '1px solid var(--border)',
          boxShadow: '0 24px 64px oklch(0% 0 0 / 0.6)',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: '1px solid var(--border-faint)' }}
        >
          <h2 className="text-base font-medium tracking-tight" style={{ color: 'var(--tx-1)' }}>
            Search Images
          </h2>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded transition-colors text-lg leading-none"
            style={{ color: 'var(--tx-3)' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--tx-1)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--tx-3)')}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Search Bar */}
        <div className="px-5 py-3" style={{ borderBottom: '1px solid var(--border-faint)' }}>
          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              type="text"
              value={query}
              onChange={handleInputChange}
              placeholder="Search for images (e.g., nature, technology, abstract)..."
              className="flex-1 px-3 py-2 rounded-md text-sm"
              style={{
                background: 'var(--bg)',
                border: '1px solid var(--border)',
                color: 'var(--tx-1)',
              }}
              autoFocus
            />
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 rounded-md text-sm font-medium transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                background: 'var(--accent)',
                color: 'var(--bg)',
              }}
            >
              Search
            </button>
          </form>
          {error && (
            <p className="mt-2 text-xs" style={{ color: 'oklch(65% 0.18 25)' }}>{error}</p>
          )}
        </div>

        {/* Image Grid */}
        <div className="flex-1 overflow-y-auto p-5">
          {isLoading && images.length === 0 ? (
            <div className="flex items-center justify-center h-64">
              <p className="text-sm" style={{ color: 'var(--tx-3)' }}>Searching images...</p>
            </div>
          ) : images.length === 0 ? (
            <div className="flex items-center justify-center h-64">
              <p className="text-sm" style={{ color: 'var(--tx-3)' }}>No images found. Try a different search term.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
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
                    className="group relative w-full overflow-hidden rounded-md transition-all"
                    type="button"
                    style={{
                      height: '140px',
                      position: 'relative',
                      border: currentImage === image.url ? '2px solid var(--accent)' : '1px solid var(--border)',
                      background: 'var(--bg)',
                    }}
                    onMouseEnter={e => { if (currentImage !== image.url) e.currentTarget.style.borderColor = 'var(--tx-3)'; }}
                    onMouseLeave={e => { if (currentImage !== image.url) e.currentTarget.style.borderColor = 'var(--border)'; }}
                  >
                    <img
                      src={imageUrl}
                      alt={image.alt}
                      className="block w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        if (target.src !== image.url && image.url) {
                          target.src = image.url;
                        }
                      }}
                      onLoad={(e) => {
                        (e.target as HTMLImageElement).style.opacity = '1';
                      }}
                      loading="lazy"
                    />
                    <div
                      className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ background: 'oklch(0% 0 0 / 0.4)', zIndex: 10 }}
                    >
                      <span className="text-xs font-medium tracking-wide" style={{ color: 'var(--tx-1)' }}>
                        Select
                      </span>
                    </div>
                    {currentImage === image.url && (
                      <div
                        className="absolute top-2 right-2 rounded-full p-1"
                        style={{ background: 'var(--accent)', zIndex: 20 }}
                      >
                        <svg className="w-3 h-3" fill="var(--bg)" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {hasMore && !isLoading && (
            <div className="mt-5 text-center">
              <button
                onClick={loadMore}
                className="px-5 py-2 rounded-md text-sm transition-colors"
                style={{
                  background: 'var(--bg)',
                  border: '1px solid var(--border)',
                  color: 'var(--tx-2)',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-hover)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'var(--bg)')}
              >
                Load more
              </button>
            </div>
          )}

          {isLoading && images.length > 0 && (
            <div className="mt-4 text-center">
              <p className="text-sm" style={{ color: 'var(--tx-3)' }}>Loading more images...</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className="px-5 py-3 text-xs text-center"
          style={{ borderTop: '1px solid var(--border-faint)', color: 'var(--tx-3)' }}
        >
          Images provided by{' '}
          <a
            href="https://www.pexels.com"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: 'var(--accent)' }}
          >
            Pexels
          </a>
        </div>
      </div>
    </div>
  );
}
