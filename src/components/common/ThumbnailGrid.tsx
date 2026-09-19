import React from 'react';
import { RotateCw, Trash2, ZoomIn, Plus, Move } from 'lucide-react';
import type { PageThumbnail } from '../../types';

interface ThumbnailGridProps {
  pages: PageThumbnail[];
  onReorder?: (newOrder: PageThumbnail[]) => void;
  onRotate?: (pageIndex: number, degrees: number) => void;
  onDelete?: (pageIndex: number) => void;
  onDuplicate?: (pageIndex: number) => void;
  onSelectPage?: (pageIndex: number) => void;
  selectedPageIndex?: number;
  allowDelete?: boolean;
  allowRotate?: boolean;
}

export const ThumbnailGrid: React.FC<ThumbnailGridProps> = ({
  pages,
  onRotate,
  onDelete,
  onSelectPage,
  selectedPageIndex,
  allowDelete = true,
  allowRotate = true,
}) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 p-4">
      {pages.map((page, index) => {
        const isSelected = selectedPageIndex === index;

        return (
          <div
            key={`${page.originalPageNumber}_${index}`}
            onClick={() => onSelectPage?.(index)}
            className={`group relative bg-white rounded-2xl p-3 border-2 transition-all cursor-pointer shadow-sm hover:shadow-md ${
              isSelected
                ? 'border-[#e5322d] ring-2 ring-red-200 shadow-md'
                : 'border-gray-200 hover:border-[#e5322d]/60'
            }`}
          >
            {/* Page number badge */}
            <div className="absolute top-2 left-2 z-10 bg-slate-900/80 text-white text-[11px] font-bold px-2 py-0.5 rounded-md shadow-xs">
              {page.pageNumber}
            </div>

            {/* Thumbnail Canvas / Image */}
            <div className="w-full aspect-[1/1.414] bg-gray-50 rounded-xl overflow-hidden flex items-center justify-center relative border border-gray-100">
              {page.dataUrl ? (
                <img
                  src={page.dataUrl}
                  alt={`Page ${page.pageNumber}`}
                  style={{ transform: `rotate(${page.rotation}deg)` }}
                  className="w-full h-full object-contain transition-transform duration-200"
                />
              ) : (
                <div className="text-gray-400 text-xs font-mono">Page {page.pageNumber}</div>
              )}

              {/* Hover actions */}
              <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                {allowRotate && onRotate && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRotate(index, 90);
                    }}
                    className="p-2 bg-white text-gray-800 rounded-full hover:bg-red-50 hover:text-[#e5322d] shadow-md transition-colors"
                    title="Rotate 90° right"
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                  </button>
                )}
                {allowDelete && onDelete && pages.length > 1 && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(index);
                    }}
                    className="p-2 bg-white text-gray-800 rounded-full hover:bg-red-50 hover:text-red-600 shadow-md transition-colors"
                    title="Delete page"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Bottom Caption */}
            <div className="mt-2 text-center text-xs font-semibold text-gray-600 truncate">
              Page {page.pageNumber}
              {page.rotation > 0 && <span className="text-[#e5322d] ml-1">({page.rotation}°)</span>}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ThumbnailGrid;
