import React, { useState, useEffect } from 'react';
import SearchBar from './components/SearchBar';
import PlaceCard from './components/PlaceCard';
import MarkdownText from './components/MarkdownText';
import { Coordinates, LoadingState, SearchResult } from './types';
import { searchPlacesWithGemini } from './services/geminiService';

const ITEMS_PER_PAGE = 100;

// Quick search options for better UX (Thai) - Updated styles in render
const QUICK_TAGS = [
  { label: "☕ คาเฟ่น่ารัก", value: "คาเฟ่บรรยากาศดี ถ่ายรูปสวย น่ารักๆ ใกล้ฉัน", emoji: "🍰" },
  { label: "🍜 ของกินอร่อย", value: "ร้านอาหารอร่อยๆ ชื่อดัง ใกล้ฉัน", emoji: "😋" },
  { label: "🛍️ ช้อปปิ้ง", value: "ห้างสรรพสินค้า หรือ ตลาดนัด ใกล้ฉัน", emoji: "👗" },
  { label: "💊 ร้านยา", value: "ร้านขายยา ใกล้ฉัน", emoji: "🩹" },
  { label: "⛽ ปั๊มน้ำมัน", value: "ปั๊มน้ำมัน ใกล้ฉัน", emoji: "🚗" },
];

const PROVINCES = [
  "ทุกจังหวัด",
  "กระบี่", "กรุงเทพมหานคร", "กาญจนบุรี", "กาฬสินธุ์", "กำแพงเพชร",
  "ขอนแก่น", "จันทบุรี", "ฉะเชิงเทรา", "ชลบุรี", "ชัยนาท", "ชัยภูมิ", "ชุมพร", "เชียงราย", "เชียงใหม่",
  "ตรัง", "ตราด", "ตาก", "นครนายก", "นครปฐม", "นครพนม", "นครราชสีมา", "นครศรีธรรมราช", "นครสวรรค์", "นนทบุรี", "นราธิวาส", "น่าน",
  "บึงกาฬ", "บุรีรัมย์", "ปทุมธานี", "ประจวบคีรีขันธ์", "ปราจีนบุรี", "ปัตตานี", "พระนครศรีอยุธยา", "พะเยา", "พังงา", "พัทลุง", "พิจิตร", "พิษณุโลก", "เพชรบุรี", "เพชรบูรณ์", "แพร่",
  "ภูเก็ต", "มหาสารคาม", "มุกดาหาร", "แม่ฮ่องสอน", "ยโสธร", "ยะลา", "ร้อยเอ็ด", "ระนอง", "ระยอง", "ราชบุรี", "ลพบุรี", "ลำปาง", "ลำพูน", "เลย",
  "ศรีสะเกษ", "สกลนคร", "สงขลา", "สตูล", "สมุทรปราการ", "สมุทรสงคราม", "สมุทรสาคร", "สระแก้ว", "สระบุรี", "สิงห์บุรี", "สุโขทัย", "สุพรรณบุรี", "สุราษฎร์ธานี", "สุรินทร์",
  "หนองคาย", "หนองบัวลำภู", "อ่างทอง", "อำนาจเจริญ", "อุดรธานี", "อุตรดิตถ์", "อุทัยธานี", "อุบลราชธานี"
];

const App: React.FC = () => {
  const [loadingState, setLoadingState] = useState<LoadingState>(LoadingState.IDLE);
  const [location, setLocation] = useState<Coordinates | null>(null);
  const [result, setResult] = useState<SearchResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [filterText, setFilterText] = useState('');
  const [selectedProvince, setSelectedProvince] = useState('ทุกจังหวัด');
  const [baseQuery, setBaseQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Attempt to get location on mount
  useEffect(() => {
    if (navigator.geolocation) {
      setLoadingState(LoadingState.GETTING_LOCATION);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
          setLoadingState(LoadingState.IDLE);
        },
        (error) => {
          console.warn("Location permission denied or unavailable", error);
          setErrorMsg("เปิดพิกัดหน่อยนะ จะได้หาของอร่อยใกล้ๆ เจอ");
          setLoadingState(LoadingState.IDLE);
        }
      );
    } else {
      setLoadingState(LoadingState.IDLE);
    }
  }, []);

  // Reset pagination when filter or results change
  useEffect(() => {
    setCurrentPage(1);
  }, [filterText, result, selectedProvince]);

  // Core search execution
  const executeSearch = async (query: string, ignoreLocation: boolean = false) => {
    setLoadingState(LoadingState.SEARCHING);
    setErrorMsg(null);
    setResult(null);
    setFilterText(''); // Reset local text filter
    
    try {
      // If ignoring location (e.g. searching specific province), pass null. 
      // Otherwise use the user's current location state.
      const searchLocation = ignoreLocation ? null : location;

      const data = await searchPlacesWithGemini(query, searchLocation);
      setResult(data);
      setLoadingState(LoadingState.SUCCESS);
    } catch (error: any) {
      console.error(error);
      setErrorMsg("อุ๊ย! น้อง AI งอแงนิดหน่อย ลองค้นหาใหม่นะ");
      setLoadingState(LoadingState.ERROR);
    }
  };

  // Called when user types in search bar or clicks quick tags
  const handleNewSearch = (query: string) => {
    setBaseQuery(query);
    setSelectedProvince('ทุกจังหวัด'); // Reset province on new topic search
    executeSearch(query, false); // Use location for default search
  };

  // Called when user changes province
  const handleProvinceChange = (province: string) => {
    setSelectedProvince(province);
    
    // If we have a base query, combine it. If not (shouldn't happen if UI is hidden), just use province name.
    const queryTerm = baseQuery || "สถานที่น่าสนใจ";
    
    if (province === 'ทุกจังหวัด') {
        executeSearch(queryTerm, false);
    } else {
        // Construct a new query with the province context
        // e.g. "Coffee shop" -> "Coffee shop ใน จังหวัดเชียงใหม่"
        executeSearch(`${queryTerm} ใน จังหวัด${province}`, true);
    }
  };

  // Handle Enter key in the secondary filter input to trigger a new AI search
  const handleFilterKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && filterText.trim()) {
       // Perform a new AI search instead of just filtering
       setBaseQuery(filterText);
       
       if (selectedProvince === 'ทุกจังหวัด') {
           executeSearch(filterText, false);
       } else {
           executeSearch(`${filterText} ใน จังหวัด${selectedProvince}`, true);
       }
    }
  };

  // Filter logic (Client-side refinement)
  const getFilteredChunks = () => {
    if (!result || !result.chunks) return [];
    
    // First, only get chunks with map data
    let chunks = result.chunks.filter(c => c.maps);
    
    // NOTE: Removed strict address string filtering for provinces.
    // Since we now query the AI specifically with "in Province X", we trust the AI results.
    // Strict string matching (chunk.maps.address.includes(province)) causes issues if Maps returns English addresses or variations.

    // 2. Filter by Text (Client-side only for instant feedback)
    if (filterText.trim()) {
      const term = filterText.toLowerCase().trim();
      chunks = chunks.filter(chunk => {
        const title = chunk.maps?.title?.toLowerCase() || '';
        const address = chunk.maps?.address?.toLowerCase() || '';
        // Check reviews for the keyword as well
        const reviews = chunk.maps?.placeAnswerSources?.reviewSnippets?.map(
          r => r.reviewText?.toLowerCase() || ''
        ).join(' ') || '';
        
        return title.includes(term) || reviews.includes(term) || address.includes(term);
      });
    }

    return chunks;
  };

  const filteredChunks = getFilteredChunks();

  // Pagination Logic
  const totalPages = Math.ceil(filteredChunks.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedChunks = filteredChunks.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      const resultsContainer = document.getElementById('results-container');
      if (resultsContainer) {
        resultsContainer.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 4) {
        for (let i = 1; i <= 5; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 3) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      }
    }
    return pages;
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-rose-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white/70 backdrop-blur-xl border-b border-rose-100 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => window.location.reload()}>
            <div className="w-10 h-10 bg-gradient-to-tr from-rose-400 to-orange-300 rounded-2xl rotate-3 group-hover:rotate-12 transition-all duration-300 flex items-center justify-center text-white shadow-lg shadow-rose-200">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
              </svg>
            </div>
            <h1 className="text-2xl font-extrabold text-gray-800 tracking-tight">
              Store<span className="text-rose-500">Finder</span> <span className="text-sm bg-rose-100 text-rose-600 px-2 py-0.5 rounded-full ml-1 font-semibold">AI</span>
            </h1>
          </div>
          <div className="text-sm font-medium flex items-center gap-2">
            {location ? (
              <span className="text-emerald-600 flex items-center gap-2 bg-emerald-50/80 px-4 py-2 rounded-full border border-emerald-100 shadow-sm">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
                พิกัดพร้อมแล้ว!
              </span>
            ) : (
              <span className="text-rose-400 bg-rose-50 px-4 py-2 rounded-full border border-rose-100 text-sm font-semibold flex items-center gap-2">
                 <span className="text-lg">📍</span> ยังไม่รู้พิกัด
              </span>
            )}
          </div>
        </div>
      </header>

      <main className="flex-grow">
        {/* Hero & Search Section */}
        <section className="pt-16 pb-20 px-4 sm:px-6 relative overflow-hidden">
           {/* Cute Blobs Background */}
           <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
             <div className="absolute top-10 right-0 w-[500px] h-[500px] bg-rose-200/30 rounded-full blur-3xl animate-pulse"></div>
             <div className="absolute bottom-0 -left-20 w-[400px] h-[400px] bg-purple-200/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
             <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-orange-100/40 rounded-full blur-3xl opacity-50"></div>
           </div>

           <div className="relative max-w-4xl mx-auto text-center z-10">
             <div className="inline-block mb-4 px-4 py-1.5 rounded-full bg-white border border-rose-100 shadow-sm text-rose-500 font-semibold text-sm animate-bounce">
                ✨ ผู้ช่วยค้นหาร้านเด็ดแบบน่ารักๆ
             </div>
             <h2 className="text-4xl sm:text-6xl font-black text-gray-800 mb-6 tracking-tight leading-tight">
               หิวไหม? หรือหาที่เที่ยว? <br/>
               <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 via-orange-400 to-rose-500">ให้ AI ช่วยหาให้สิ!</span>
             </h2>
             <p className="text-lg text-gray-500 max-w-2xl mx-auto mb-12 font-medium">
               ค้นหาร้านอาหาร คาเฟ่เก๋ๆ หรือร้านบริการต่างๆ ใกล้คุณง่ายๆ <br className="hidden sm:block"/> ด้วยพลังของ Gemini 2.5 และข้อมูลแม่นๆ จาก Google Maps
             </p>
             
             <SearchBar onSearch={handleNewSearch} isLoading={loadingState === LoadingState.SEARCHING || loadingState === LoadingState.GETTING_LOCATION} />
             
             {/* Quick Tags */}
             <div className="mt-10 flex flex-wrap justify-center gap-3">
                {QUICK_TAGS.map((tag, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleNewSearch(tag.value)}
                    disabled={loadingState === LoadingState.SEARCHING}
                    className="group flex items-center gap-2 px-5 py-2.5 bg-white border-2 border-transparent hover:border-rose-200 rounded-full text-sm font-semibold text-gray-600 hover:text-rose-600 hover:bg-rose-50 transition-all transform hover:-translate-y-1 hover:shadow-lg shadow-sm active:scale-95"
                  >
                    <span className="text-xl group-hover:scale-125 transition-transform">{tag.emoji}</span> {tag.label}
                  </button>
                ))}
             </div>

             {errorMsg && (
               <div className="max-w-xl mx-auto mt-8 p-4 bg-red-50 text-red-600 rounded-3xl text-base font-medium text-center border-2 border-red-100 shadow-sm flex items-center justify-center gap-3 animate-pulse">
                 <span className="text-2xl">🥺</span> {errorMsg}
               </div>
             )}
           </div>
        </section>

        {/* Results Section */}
        <section id="results-container" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 pb-20">
          {loadingState === LoadingState.GETTING_LOCATION && (
            <div className="text-center py-24 flex flex-col items-center">
               <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mb-6 relative">
                  <div className="w-20 h-20 absolute border-4 border-rose-100 rounded-full animate-ping opacity-75"></div>
                  <span className="text-4xl animate-bounce">📍</span>
               </div>
               <p className="text-gray-600 text-lg font-semibold">แป๊บนึงนะ... กำลังส่องหาพิกัด</p>
            </div>
          )}

          {result && (
            <div className="animate-fade-in-up space-y-10">
              {/* AI Summary */}
              <div className="bg-white/80 backdrop-blur-md rounded-[2rem] shadow-xl shadow-rose-100/50 border border-white p-6 md:p-10 relative overflow-hidden group hover:shadow-2xl hover:shadow-rose-200/50 transition-all duration-500">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-rose-100 to-orange-100 rounded-bl-[100px] -mr-8 -mt-8 opacity-50 group-hover:scale-110 transition-transform"></div>
                
                <div className="flex items-center gap-4 mb-6 relative z-10">
                  <div className="w-12 h-12 bg-gradient-to-tr from-rose-500 to-orange-400 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-rose-300 transform -rotate-6">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800">คำแนะนำจาก AI จ้า</h3>
                </div>
                <div className="pl-1 relative z-10">
                   <MarkdownText content={result.text} />
                </div>
              </div>

              {/* Places Grid Header with Filter */}
              {result.chunks && (
                <div className="bg-white/90 backdrop-blur rounded-[2rem] p-3 border border-gray-100 shadow-lg shadow-gray-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4 sticky top-24 z-40 transition-all">
                  <div className="flex items-center gap-3 px-4 py-2">
                    <div className="bg-rose-100 p-2 rounded-xl text-rose-500">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-800">เจอร้านน่าสนใจ!</h3>
                        <p className="text-xs text-gray-500 font-medium">
                          {loadingState === LoadingState.SEARCHING ? 'กำลังค้นหา...' : `${filteredChunks.length} สถานที่`}
                        </p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-3 p-1 w-full lg:w-auto">
                    {/* Province Dropdown */}
                    <div className="relative">
                      <select
                        value={selectedProvince}
                        onChange={(e) => handleProvinceChange(e.target.value)}
                        disabled={loadingState === LoadingState.SEARCHING}
                        className="w-full sm:w-auto px-5 py-3 pr-10 bg-gray-50 hover:bg-white border-2 border-transparent hover:border-rose-200 rounded-2xl text-sm font-semibold text-gray-700 focus:outline-none focus:ring-4 focus:ring-rose-100 focus:border-rose-300 cursor-pointer appearance-none transition-all shadow-sm max-h-40 overflow-y-auto disabled:opacity-50"
                        style={{
                          backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23f43f5e' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
                          backgroundRepeat: "no-repeat",
                          backgroundPosition: "right 1rem center",
                          backgroundSize: "1.2em"
                        }}
                      >
                        {PROVINCES.map((province, idx) => (
                          <option key={idx} value={province}>
                            {province}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Text Search Input */}
                    <div className="relative w-full sm:w-72">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                        </div>
                        <input
                          type="text"
                          placeholder="พิมพ์ชื่อร้าน แล้วกด Enter เพื่อหา..."
                          className="pl-11 pr-5 py-3 bg-gray-50 hover:bg-white border-2 border-transparent hover:border-rose-200 rounded-2xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-rose-100 focus:border-rose-300 w-full transition-all shadow-sm placeholder-gray-400"
                          value={filterText}
                          onChange={(e) => setFilterText(e.target.value)}
                          onKeyDown={handleFilterKeyDown}
                        />
                    </div>
                  </div>
                </div>
              )}

              {/* Places Grid */}
              {result.chunks && (
                <>
                   {loadingState === LoadingState.SEARCHING ? (
                      <div className="text-center py-20 bg-white/60 rounded-[2rem] border-4 border-dashed border-rose-100 animate-pulse">
                        <div className="text-6xl mb-4">🚀</div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">กำลังบินไปหาข้อมูลที่ {selectedProvince}...</h3>
                        <p className="text-gray-500">รอแป๊บนึงนะ น้อง AI กำลังทำงาน</p>
                      </div>
                   ) : (
                    <>
                      {filteredChunks.length > 0 ? (
                        <>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {paginatedChunks.map((chunk, index) => (
                              <PlaceCard 
                                key={`${chunk.maps?.sourceId}-${startIndex + index}`} 
                                chunk={chunk} 
                                index={startIndex + index} 
                              />
                            ))}
                          </div>

                          {/* Pagination Controls */}
                          {totalPages > 1 && (
                            <div className="flex flex-wrap justify-center items-center gap-2 py-12">
                              <button
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                                className={`p-3 rounded-2xl border-2 transition-all ${
                                  currentPage === 1
                                    ? 'border-gray-100 text-gray-300 bg-gray-50 cursor-not-allowed'
                                    : 'border-rose-100 bg-white text-rose-500 hover:border-rose-300 hover:bg-rose-50 hover:shadow-md hover:-translate-y-1'
                                }`}
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              </button>
                              
                              <div className="flex items-center gap-2 px-2">
                                {getPageNumbers().map((page, idx) => (
                                  typeof page === 'number' ? (
                                    <button
                                      key={idx}
                                      onClick={() => handlePageChange(page)}
                                      className={`w-12 h-12 flex items-center justify-center rounded-2xl text-base font-bold transition-all ${
                                        currentPage === page
                                          ? 'bg-rose-500 text-white shadow-lg shadow-rose-300 scale-110'
                                          : 'bg-white text-gray-600 hover:bg-rose-50 border-2 border-transparent hover:border-rose-200'
                                      }`}
                                    >
                                      {page}
                                    </button>
                                  ) : (
                                    <span key={idx} className="w-8 flex justify-center text-gray-300 font-bold text-xl">...</span>
                                  )
                                ))}
                              </div>

                              <button
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className={`p-3 rounded-2xl border-2 transition-all ${
                                  currentPage === totalPages
                                    ? 'border-gray-100 text-gray-300 bg-gray-50 cursor-not-allowed'
                                    : 'border-rose-100 bg-white text-rose-500 hover:border-rose-300 hover:bg-rose-50 hover:shadow-md hover:-translate-y-1'
                                }`}
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                </svg>
                              </button>
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="text-center py-20 bg-white/60 rounded-[2rem] border-4 border-dashed border-rose-100">
                          <div className="text-6xl mb-4 animate-bounce">🙈</div>
                          <h3 className="text-xl font-bold text-gray-800 mb-2">ไม่เจอร้านในจังหวัดที่เลือกเลย</h3>
                          <p className="text-gray-500">AI อาจจะหาไม่เจอ หรือร้านอาจจะไม่ได้ปักหมุดที่อยู่ไว้นะ</p>
                        </div>
                      )}
                    </>
                   )}
                </>
              )}
            </div>
          )}
          
          {loadingState === LoadingState.IDLE && !result && !errorMsg && (
             <div className="mt-20 text-center opacity-60">
                <p className="text-rose-400 font-medium">✨ ลองพิมพ์อะไรสักอย่างสิ เช่น "ข้าวมันไก่เจ้าดัง" ✨</p>
             </div>
          )}
        </section>
      </main>
      
      <footer className="bg-white/50 backdrop-blur-sm border-t border-rose-100 py-10 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center">
            <div className="flex justify-center items-center gap-2 mb-2">
                <span className="w-2 h-2 rounded-full bg-rose-400"></span>
                <span className="w-2 h-2 rounded-full bg-orange-400"></span>
                <span className="w-2 h-2 rounded-full bg-purple-400"></span>
            </div>
            <p className="text-gray-600 font-medium">ขับเคลื่อนความอร่อยโดย Gemini 2.5 Flash และ Google Maps</p>
            <p className="text-gray-400 text-xs mt-2">Create with 💖 by StoreFinder AI</p>
        </div>
      </footer>
    </div>
  );
};

export default App;