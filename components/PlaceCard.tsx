import React from 'react';
import { GroundingChunk } from '../types';

interface PlaceCardProps {
  chunk: GroundingChunk;
  index: number;
}

const PlaceCard: React.FC<PlaceCardProps> = ({ chunk, index }) => {
  // Only render if it contains map data
  if (!chunk.maps) return null;

  const { title, uri, placeAnswerSources, address, phoneNumber, websiteUri } = chunk.maps;
  const reviews = placeAnswerSources?.reviewSnippets || [];

  return (
    <div className="bg-white rounded-[2rem] shadow-sm hover:shadow-2xl hover:shadow-rose-100/50 transition-all duration-500 border border-gray-50 flex flex-col h-full group hover:-translate-y-2 hover:scale-[1.02] relative overflow-hidden">
      
      {/* Decorative gradient top border */}
      <div className="h-2 w-full bg-gradient-to-r from-rose-400 via-orange-400 to-rose-400 opacity-0 group-hover:opacity-100 transition-opacity"></div>

      <div className="p-7 flex-1">
        <div className="flex items-start justify-between gap-3 mb-4">
          <h3 className="font-bold text-xl text-gray-800 leading-tight group-hover:text-rose-600 transition-colors">
            {title || "ไม่ทราบชื่อ"}
          </h3>
          <span className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-rose-50 text-rose-600 font-extrabold text-sm border-2 border-rose-100 shadow-sm">
            {index + 1}
          </span>
        </div>

        {/* Contact Info Section */}
        <div className="space-y-3 mb-6">
           {address && (
            <div className="flex items-start gap-3 text-sm text-gray-500">
              <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center flex-shrink-0 text-rose-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <span className="leading-relaxed py-1">{address}</span>
            </div>
           )}
           {phoneNumber && (
            <div className="flex items-center gap-3 text-sm text-gray-500">
               <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center flex-shrink-0 text-green-500">
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                 </svg>
               </div>
               <span>{phoneNumber}</span>
            </div>
           )}
        </div>

        {reviews.length > 0 && (
          <div className="mt-5 pt-5 border-t border-gray-50">
            <div className="relative pl-4 bg-orange-50/50 p-3 rounded-xl border border-orange-100/50">
              <span className="absolute -top-2 -left-1 text-2xl">❝</span>
              {reviews.slice(0, 1).map((review, idx) => (
                <p key={idx} className="text-sm text-gray-600 italic leading-relaxed line-clamp-3 font-medium">
                  {review.reviewText}
                </p>
              ))}
              <span className="absolute -bottom-4 right-2 text-2xl rotate-180">❝</span>
            </div>
          </div>
        )}
      </div>

      {/* Footer Buttons */}
      <div className="p-4 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between gap-3">
        <div className="flex gap-2">
            {websiteUri && (
            <a
                href={websiteUri}
                target="_blank"
                rel="noopener noreferrer"
                title="เว็บไซต์"
                className="w-11 h-11 flex items-center justify-center bg-white border-2 border-gray-100 rounded-full text-gray-500 hover:text-purple-500 hover:border-purple-200 hover:bg-purple-50 hover:scale-110 transition-all shadow-sm"
            >
                {/* Globe Icon for Website */}
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-9 3-9s-1.343-9-3-9m0 18c-1.657 0-3-9-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                </svg>
            </a>
            )}
            
            <a
            href={uri}
            target="_blank"
            rel="noopener noreferrer"
            title="ดูแผนที่"
            className="w-11 h-11 flex items-center justify-center bg-white border-2 border-gray-100 rounded-full text-gray-500 hover:text-blue-500 hover:border-blue-200 hover:bg-blue-50 hover:scale-110 transition-all shadow-sm"
            >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
            </a>
        </div>

        <a
          href={uri ? uri.replace('maps/search/', 'maps/dir/') : '#'}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 max-w-[150px] flex items-center justify-center gap-2 py-3 px-5 bg-gray-900 text-white rounded-full text-sm font-bold hover:bg-rose-500 hover:shadow-lg hover:shadow-rose-200 hover:-translate-y-1 transition-all"
        >
          <span>ไปกันเลย</span>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </a>
      </div>
    </div>
  );
};

export default PlaceCard;