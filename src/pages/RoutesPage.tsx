import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ROUTES } from '../constants/routes';
import { Header } from '../components/layouts/Header';
import { Footer } from '../components/layouts/Footer';
import { 
  Clock, 
  Bus
} from '@phosphor-icons/react';
import { routeService } from '../services/route-service/routeService';
import { publicTripService } from '../services/trip-service/publicTripService';
import type { CityResponse } from '../types/route-service/response';
import type { TripResponse } from '../types/trip-service/Trip';



const popularCities = [
  { name: 'Sapa', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA6B2vIJO0FJgmNpQHkgM8qdJT6n-9nT3vdWSxWRHktSi1ch0LBnUEiT-obl3q5A5512Jr-6mdNx5z_5abiZtiU7djK_dyXpXn_n8NDfgjzONAiO8nByImWMFiCBzEDzVWERaq_xtdRIuWcBashhjCkKQEMZeVLM8bKtLY_joZzGIF9cvv7t6emQY0-juOE6NW0Ogz-zOgtEZO9LcO6nGw0r5Mx0GDDeQ2q6Ukhxk0nq7O3DJonfITF7d2ncnbrrzh_-mSfS-3uu14' },
  { name: 'Đà Nẵng', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAwZ-xLLrTeeY3if2IG-wdZ3YrWqkYbatD-mddE_4yWpr78wJfpcLHZa5KCjKaclLJl4lG_oTQNAHKGeTw9iNmqQ3EiYpQTOGcHL2P8VmjPicY1PLGT74l7xON51GHe1aaXMtcU-Wrmg8AGsCvxoH9a4nR08rpWaJXo_ahs8Lm8tAKJrpMRXnp-_8sRO1ZlkgOJkD7sqNTKiqQY8ynMjnOSpnv0wiGc3HquRER8MMdDlbw1vLASMxShuNcExSYLg1-bgHCti74fRFQ' },
  { name: 'Đà Lạt', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBGLQm4daeQnrmdk4XldK8q3uwjeu_DE94aZlBGKix76X9uiBqRXks6tEtO76ggzsNYcmx6EqlNqYW7CnQlqPjo8cRYL6sx--IC6EPQO9Jsg43Y2pPkQLN8qpRkoAGhojVwyhwCsM9-QBDtprx5BOsgGQj4MCpdOhx3ZWah8f5Ok-BhazTAJ_nAN4J0t4lGRqvmHVVgjlm2N1aL4u4Aw5u3J8BBiAOkIjCbwjt_a1FZlilNZFDqPM73eDDJjJeskQ7gxz85tbe-M6w' },
  { name: 'Nha Trang', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAih2uXNxVx_sphzMoIqTCdq9qeCGR5eOf9pDYcV9wnxQyqcUdqzKXUUp6_QEfQPY5OgN3k7zT0vg1HA4XWF1ehJpROeBXalqoXs5Xch67Y9PCgT0OZcBz3zloBgc4lY8ZfT7Wz8ExDJaYZV9jdwNnTuVfNl_YgBLITbVEbW1gD-Gk3d5-Nq04jr76JOqqLZVrmAZ8JQ1t5noOf7jSGwSblZC9ehmrdlzCHNn-OPOBLWd9_Mhzke13TAO738iRRbdjbW6bmJnpYLis' },
  { name: 'Vũng Tàu', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDUz2JVvBa80C-A_MM2FhnwB-ZRRyq6KQ1tj5NQEGTrjrpXiaOvpKlpMRuryWQ1Xs6XT-Asa32gSzbOJBwA47aKgk0_urOoZJKEpAAELFJROXpNtIh0xKJtKBFnYluQ5-kS1H0I50qo38ZIuXXXxZsHIgaInEf6FXtUPcpYMeCPFfooc2IPR_f22R8l8cdtTUB4-g3fNrRXY9j6496FuLPManlJ2wrzoggjZ4E3dNj9Oh7Jyiqf1JYJT3p5uZhhbECDsqnA6eLFV7E' }
];

export const RoutesPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Input search parameters
  const [startQuery, setStartQuery] = useState(searchParams.get('from') || '');
  const [destQuery, setDestQuery] = useState(searchParams.get('to') || '');
  const [dateQuery, setDateQuery] = useState(searchParams.get('date') || '');
  const [passengersQuery] = useState(parseInt(searchParams.get('passengers') || '1'));
  const [isRoundTrip, setIsRoundTrip] = useState(false);
  
  // Filtering selections
  const [sortBy, setSortBy] = useState('Giờ đi sớm nhất');
  const [maxPrice, setMaxPrice] = useState(2000000);
  const [departureTimeFilter, setDepartureTimeFilter] = useState(''); // Sáng, Chiều, Tối
  const [vehicleTypeFilter, setVehicleTypeFilter] = useState(''); // Giường nằm, Limousine, Ghế ngồi
  const [hasAvailableSeatsFilter, setHasAvailableSeatsFilter] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  const [tripsData, setTripsData] = useState<TripResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [cities, setCities] = useState<CityResponse[]>([]);

  // Load cities for city-based search
  useEffect(() => {
    routeService.getCities()
      .then(res => {
        const payload = res.data.result || res.data.data;
        setCities((payload as any)?.content || (Array.isArray(payload) ? payload : []));
      })
      .catch(() => {});
  }, []);

  // Load all available trips (for initial page load without search params)
  const loadAllTrips = useCallback(async () => {
    setLoading(true);
    try {
      // Try to get trips from the routes service - fetch popular routes first
      const res = await routeService.getPopularRoutes(0, 20);
      const payload = res.data.result || res.data.data;
      const routes = (payload as any)?.content || (Array.isArray(payload) ? payload : []);
      
      if (routes.length > 0) {
        // For each route, try to find trips
        const today = new Date().toISOString().split('T')[0];
        const allTrips: TripResponse[] = [];
        
        // Try to load trips for each route (in parallel, limited)
        const tripPromises = routes.slice(0, 10).map(async (route: any) => {
          try {
            const tripRes = await publicTripService.getTripsByRoute(route.id, 0, 5);
            const tripPayload = tripRes.data.result || tripRes.data.data;
            const trips = (tripPayload as any)?.content || (Array.isArray(tripPayload) ? tripPayload : []);
            return trips;
          } catch {
            return [];
          }
        });
        
        const results = await Promise.all(tripPromises);
        results.forEach((trips: TripResponse[]) => allTrips.push(...trips));
        
        if (allTrips.length > 0) {
          setTripsData(allTrips);
        } else {
          // If no trips from routes, try a broad search for today
          try {
            const cityList = cities.length > 0 ? cities : [];
            if (cityList.length >= 2) {
              const searchRes = await publicTripService.searchTrips({
                originCityId: cityList[0].id,
                destinationCityId: cityList[1].id,
                departureDate: today,
              });
              const searchPayload = searchRes.data.result || searchRes.data.data;
              setTripsData((searchPayload as any)?.content || (Array.isArray(searchPayload) ? searchPayload as unknown as TripResponse[] : []));
            }
          } catch {
            setTripsData([]);
          }
        }
      }
    } catch (err) {
      console.error('Failed to load initial trips:', err);
      setTripsData([]);
    } finally {
      setLoading(false);
    }
  }, [cities]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (cities.length > 0 && startQuery && destQuery && dateQuery) {
      handleServerSearch();
    } else if (cities.length > 0 && !startQuery && !destQuery && !dateQuery) {
      // Load all trips when visiting the page without search params
      loadAllTrips();
    }
  }, [cities]); // trigger when cities load

  // Server-side search via backend API when user clicks search button
  const handleServerSearch = useCallback(async () => {
    if (!startQuery.trim() || !destQuery.trim()) {
        alert('Vui lòng nhập Điểm đi và Điểm đến');
        return;
    }
    
    setLoading(true);
    try {
      const originCity = cities.find(c => c.name.toLowerCase().includes(startQuery.toLowerCase()));
      const destCity = cities.find(c => c.name.toLowerCase().includes(destQuery.toLowerCase()));
      
      if (originCity && destCity) {
        const today = new Date().toISOString().split('T')[0];
        const res = await publicTripService.searchTrips({
            originCityId: originCity.id,
            destinationCityId: destCity.id,
            departureDate: dateQuery || today,
            passengerCount: passengersQuery
        });
        const payload = res.data.result || res.data.data;
        if (payload) {
          setTripsData((payload as any).content || (Array.isArray(payload) ? payload as unknown as TripResponse[] : []));
        } else {
          setTripsData([]);
        }
      } else {
        // If cities not found by name match, try loading trips for all routes
        await loadAllTrips();
      }
    } catch (err) {
      console.error('Search failed');
      setTripsData([]);
    } finally {
      setLoading(false);
    }
  }, [startQuery, destQuery, dateQuery, passengersQuery, cities, loadAllTrips]);

  const handleShortcutClick = (cityName: string) => {
    setDestQuery(cityName);
    // Smooth scroll down to main route selection catalog
    const element = document.getElementById('catalog-content');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Removed toggleVehicleCheckbox

  // Filter & Sort dynamic logic
  const filteredTrips = tripsData
    .filter(trip => {
      // Search matches
      const fromName = trip.route?.originCityName || '';
      const toName = trip.route?.destinationCityName || '';
      const matchesStart = fromName.toLowerCase().includes(startQuery.toLowerCase());
      const matchesDest = toName.toLowerCase().includes(destQuery.toLowerCase());
      
      // Price matches
      const basePrice = trip.prices?.[0]?.basePrice || 350000;
      const matchesPrice = basePrice <= maxPrice;

      // Available seats
      const matchesAvailableSeats = hasAvailableSeatsFilter ? (trip.availableSeats > 0) : true;

      // Vehicle Type
      const vehicleTypeName = trip.vehicle?.vehicleTypeName || trip.vehicle?.name || '';
      const matchesVehicle = vehicleTypeFilter ? vehicleTypeName.toLowerCase().includes(vehicleTypeFilter.toLowerCase()) : true;

      // Departure Time (Sáng: 00-12, Chiều: 12-18, Tối: 18-24)
      let matchesTime = true;
      if (departureTimeFilter) {
        const hour = trip.departureDatetime ? new Date(trip.departureDatetime).getHours() : 0;
        if (departureTimeFilter === 'Sáng') matchesTime = hour >= 0 && hour < 12;
        else if (departureTimeFilter === 'Chiều') matchesTime = hour >= 12 && hour < 18;
        else if (departureTimeFilter === 'Tối') matchesTime = hour >= 18 && hour <= 24;
      }
      
      return matchesStart && matchesDest && matchesPrice && matchesAvailableSeats && matchesVehicle && matchesTime;
    })
    .sort((a, b) => {
      const aPrice = a.prices?.[0]?.basePrice || 350000;
      const bPrice = b.prices?.[0]?.basePrice || 350000;
      const aDur = a.route?.durationMinutes || 0;
      const bDur = b.route?.durationMinutes || 0;
      const aTime = a.departureDatetime ? new Date(a.departureDatetime).getTime() : 0;
      const bTime = b.departureDatetime ? new Date(b.departureDatetime).getTime() : 0;
      const aSeats = a.availableSeats || 0;
      const bSeats = b.availableSeats || 0;

      if (sortBy === 'Giá thấp nhất') return aPrice - bPrice;
      if (sortBy === 'Giờ đi sớm nhất') return aTime - bTime;
      if (sortBy === 'Còn nhiều ghế nhất') return bSeats - aSeats; // descending
      if (sortBy === 'Thời gian ngắn nhất') return aDur - bDur;
      
      return aPrice - bPrice; // default sort
    });

  return (
    <div className="min-h-screen bg-background text-on-background font-body select-none">
      <Header />

      <main className="pt-20">
        {/* Grain Overlay matching design */}
        <div className="grain-overlay" />

        {/* Hero Header Section */}
        <section className="h-[280px] bg-[#1A1410] relative flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#F4600C22_0%,_transparent_70%)] opacity-60 pointer-events-none" />
          <div className="relative z-10 w-full max-w-container-max px-gutter text-center">
            <h1 className="typo-headline-lg text-on-primary mb-6">Hành trình hoài niệm</h1>
            
            {/* Quick Search Bar (Capsule Row, non-stacking across viewports) */}
            <div className="bg-surface-container-lowest p-2 rounded-full shadow-lg max-w-5xl w-full mx-auto flex flex-wrap md:flex-nowrap items-center gap-2 border border-outline/20">
              <div className="flex-1 flex items-center px-4 gap-3 min-w-[150px]">
                <span className="material-symbols-outlined text-outline">location_on</span>
                <select 
                  value={startQuery}
                  onChange={(e) => setStartQuery(e.target.value)}
                  className="bg-transparent border-none focus:ring-0 focus:outline-none w-full typo-body-md text-on-surface appearance-none" 
                >
                  <option value="">Điểm khởi hành</option>
                  {cities.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                </select>
              </div>
              <div className="h-8 w-px bg-outline-variant shrink-0 hidden md:block" />
              <div className="flex-1 flex items-center px-4 gap-3 min-w-[150px]">
                <span className="material-symbols-outlined text-outline">distance</span>
                <select 
                  value={destQuery}
                  onChange={(e) => setDestQuery(e.target.value)}
                  className="bg-transparent border-none focus:ring-0 focus:outline-none w-full typo-body-md text-on-surface appearance-none" 
                >
                  <option value="">Điểm đến</option>
                  {cities.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                </select>
              </div>
              <div className="h-8 w-px bg-outline-variant shrink-0 hidden md:block" />
              <div className="flex-[0.8] flex items-center px-4 gap-3 min-w-[150px]">
                <span className="material-symbols-outlined text-outline">calendar_month</span>
                <input 
                  value={dateQuery}
                  onChange={(e) => setDateQuery(e.target.value)}
                  className="bg-transparent border-none focus:ring-0 focus:outline-none w-full typo-body-md text-on-surface" 
                  type="date"
                />
              </div>
              <div className="h-8 w-px bg-outline-variant shrink-0 hidden md:block" />
              <div className="flex-[0.6] flex items-center justify-center px-4 gap-2 min-w-[120px]">
                <input 
                  type="checkbox" 
                  id="roundTrip" 
                  checked={isRoundTrip}
                  onChange={(e) => setIsRoundTrip(e.target.checked)}
                  className="w-4 h-4 accent-primary rounded cursor-pointer" 
                />
                <label htmlFor="roundTrip" className="typo-body-md text-on-surface cursor-pointer whitespace-nowrap">Khứ hồi?</label>
              </div>
              <button onClick={handleServerSearch} className="bg-primary text-on-primary px-6 h-12 rounded-full flex items-center justify-center gap-2 hover:bg-primary-hover transition-colors shadow-md active:scale-95 cursor-pointer shrink-0">
                <span className="material-symbols-outlined">search</span>
                <span className="font-semibold hidden sm:inline">Tìm</span>
              </button>
            </div>
          </div>
        </section>

        {/* Removed Region Filter Tab Bar */}

        {/* Popular Destinations Shortcuts strip */}
        <section className="py-sm bg-surface-container-low/30 border-b border-outline/5 select-none">
          <div className="max-w-container-max mx-auto px-gutter">
            <div className="flex overflow-x-auto gap-md py-4 hide-scrollbar items-center">
              <span className="typo-label-caps text-[10px] uppercase tracking-wider text-outline whitespace-nowrap mr-2">Phổ biến:</span>
              <div className="flex gap-md items-center">
                {popularCities.map((city) => (
                  <button
                    key={city.name}
                    onClick={() => handleShortcutClick(city.name)}
                    className="flex flex-col items-center gap-2 group cursor-pointer bg-transparent border-none outline-none focus:outline-none shrink-0"
                  >
                    <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-transparent hover:border-primary p-1 transition-all group-hover:scale-105">
                      <img className="w-full h-full object-cover rounded-full" src={city.img} alt={city.name} />
                    </div>
                    <span className="typo-label-caps text-[10px] uppercase tracking-tighter text-on-background">{city.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Main Content Grid Catalog */}
        <div id="catalog-content" className="max-w-container-max mx-auto px-gutter py-lg grid grid-cols-1 lg:grid-cols-12 gap-lg scroll-mt-36">
          
          {/* Sidebar Filters */}
          <aside className="lg:col-span-3">
            <div className="sticky top-40 space-y-lg">
              <div>
                <h3 className="typo-headline-md mb-md text-on-surface">Lọc kết quả</h3>
                <div className="space-y-4">
                  <label className="block">
                    <span className="typo-label-caps mb-2 block text-outline">Sắp xếp theo</span>
                    <select 
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="w-full rounded-xl border border-outline/20 p-2.5 bg-surface-container-lowest focus:ring-primary focus:border-primary typo-body-md text-on-surface"
                    >
                      <option value="Giờ đi sớm nhất">Giờ đi sớm nhất</option>
                      <option value="Giá thấp nhất">Giá thấp nhất</option>
                      <option value="Còn nhiều ghế nhất">Còn nhiều ghế nhất</option>
                      <option value="Thời gian ngắn nhất">Thời gian ngắn nhất</option>
                      <option value="Phổ biến nhất">Phổ biến nhất</option>
                    </select>
                  </label>

                  <div className="pt-4">
                    <span className="typo-label-caps mb-2 block text-outline">Khoảng giá (VNĐ)</span>
                    <input 
                      className="w-full accent-primary cursor-pointer"
                      max="2000000" 
                      min="100000" 
                      step="50000" 
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(Number(e.target.value))}
                      type="range"
                    />
                    <div className="flex justify-between typo-label-sm text-outline mt-2">
                      <span>100k</span>
                      <span className="text-primary font-bold">{maxPrice.toLocaleString()}₫</span>
                      <span>2.000k</span>
                    </div>
                  </div>

                  <div className="pt-4">
                    <span className="typo-label-caps mb-2 block text-outline">Giờ khởi hành</span>
                    <div className="flex flex-col gap-2">
                      {['Sáng', 'Chiều', 'Tối'].map(time => (
                        <label key={time} className="flex items-center gap-2 cursor-pointer group">
                          <input 
                            type="radio" 
                            name="departureTime" 
                            checked={departureTimeFilter === time}
                            onChange={() => setDepartureTimeFilter(time)}
                            onClick={(e: any) => { if(departureTimeFilter === time) { setDepartureTimeFilter(''); e.target.checked = false; } }}
                            className="w-4 h-4 accent-primary cursor-pointer" 
                          />
                          <span className="typo-body-md group-hover:text-primary transition-colors">
                            {time} <span className="text-outline-variant typo-label-sm">({time === 'Sáng' ? '00:00 - 12:00' : time === 'Chiều' ? '12:00 - 18:00' : '18:00 - 24:00'})</span>
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4">
                    <span className="typo-label-caps mb-2 block text-outline">Loại xe</span>
                    <div className="flex flex-col gap-2">
                      {['Giường nằm', 'Limousine', 'Ghế ngồi'].map(type => (
                        <label key={type} className="flex items-center gap-2 cursor-pointer group">
                          <input 
                            type="radio" 
                            name="vehicleType"
                            checked={vehicleTypeFilter === type}
                            onChange={() => setVehicleTypeFilter(type)}
                            onClick={(e: any) => { if(vehicleTypeFilter === type) { setVehicleTypeFilter(''); e.target.checked = false; } }}
                            className="w-4 h-4 accent-primary cursor-pointer" 
                          />
                          <span className="typo-body-md group-hover:text-primary transition-colors">{type}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4">
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <input 
                        type="checkbox" 
                        checked={hasAvailableSeatsFilter}
                        onChange={(e) => setHasAvailableSeatsFilter(e.target.checked)}
                        className="w-4 h-4 accent-primary cursor-pointer rounded" 
                      />
                      <span className="typo-body-md font-semibold group-hover:text-primary transition-colors">Chỉ hiện chuyến còn ghế</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Route Grid Content Section */}
          <div className="lg:col-span-9 flex flex-col gap-md">
            <div className="flex justify-between items-center mb-md">
              <p className="typo-body-md text-on-surface-variant italic">
                Tìm thấy <span className="font-bold text-primary">{filteredTrips.length}</span> tuyến đường cho hành trình của bạn
              </p>
              
              {/* Layout view controls */}
              <div className="flex gap-2 bg-surface-container p-1 rounded-xl">
                <button 
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-all cursor-pointer ${
                    viewMode === 'grid' 
                      ? 'bg-surface-container-lowest shadow-sm text-primary' 
                      : 'text-outline hover:text-primary'
                  }`}
                  title="Xem dạng lưới"
                >
                  <span className="material-symbols-outlined">grid_view</span>
                </button>
                <button 
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-all cursor-pointer ${
                    viewMode === 'list' 
                      ? 'bg-surface-container-lowest shadow-sm text-primary' 
                      : 'text-outline hover:text-primary'
                  }`}
                  title="Xem dạng danh sách"
                >
                  <span className="material-symbols-outlined">reorder</span>
                </button>
              </div>
            </div>

            {/* Routes container */}
            {loading ? (
              <div className="flex justify-center items-center py-20">
                <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : filteredTrips.length > 0 ? (
              <div 
                className={`transition-all duration-500 gap-md ${
                  viewMode === 'grid' 
                    ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3' 
                    : 'flex flex-col'
                }`}
              >
                {filteredTrips.map((trip) => {
                  const from = trip.route?.originCityName || 'Chưa rõ';
                  const to = trip.route?.destinationCityName || 'Chưa rõ';
                  const pickupPoint = 'Bến xe ' + from;
                  const dropoffPoint = 'Bến xe ' + to;
                  const price = trip.prices?.[0]?.basePrice || 350000;
                  const durationMinutes = trip.route?.durationMinutes || 0;
                  const vehicleName = trip.vehicle?.vehicleTypeName || trip.vehicle?.name || 'Ghế ngồi tiêu chuẩn';
                  const totalSeats = trip.vehicle?.totalSeats || 40;
                  
                  const departureDateObj = trip.departureDatetime ? new Date(trip.departureDatetime) : new Date();
                  const arrivalDateObj = new Date(departureDateObj.getTime() + durationMinutes * 60000);
                  
                  const departureTime = departureDateObj.toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'});
                  let arrivalTimeStr = arrivalDateObj.toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'});
                  
                  if (arrivalDateObj.getDate() !== departureDateObj.getDate()) {
                    arrivalTimeStr += ' (+1)';
                  }
                  
                  const isCancelled = trip.status === 'CANCELLED';
                  const isSoldOut = trip.availableSeats <= 0;
                  const isAlmostSoldOut = trip.availableSeats > 0 && trip.availableSeats <= 5;
                  
                  return (
                    <article 
                      key={trip.id}
                      className={`bg-surface-container-lowest rounded-xl border border-outline-variant hover:border-primary/50 hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col p-5 relative ${
                        isCancelled ? 'opacity-50 grayscale' : isSoldOut ? 'opacity-70 grayscale-[0.5]' : ''
                      }`}
                    >
                      <div className="flex flex-col gap-4 w-full">
                        {/* Status Badges */}
                        <div className="absolute top-4 right-4 flex gap-2">
                          {isCancelled && <span className="bg-error/10 text-error px-3 py-1 rounded-full text-[11px] uppercase tracking-wider font-bold">Đã hủy</span>}
                          {!isCancelled && isSoldOut && <span className="bg-error/10 text-error px-3 py-1 rounded-full text-[11px] uppercase tracking-wider font-bold">Hết ghế</span>}
                          {!isCancelled && isAlmostSoldOut && <span className="bg-warning/10 text-warning px-3 py-1 rounded-full text-[11px] uppercase tracking-wider font-bold">Sắp hết ({trip.availableSeats} ghế)</span>}
                        </div>

                        {/* Top: Time and location info */}
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex flex-col items-start min-w-[120px]">
                            <span className="typo-headline-lg text-primary">{departureTime}</span>
                            <span className="typo-label-sm text-outline-variant mt-1 font-medium">{pickupPoint}</span>
                          </div>
                          
                          <div className="flex flex-col items-center flex-1 px-4 md:px-8">
                            <span className="typo-label-sm text-outline mb-2 bg-surface-container-low px-3 py-1 rounded-full">
                              ~{Math.floor(durationMinutes/60)} tiếng {durationMinutes % 60 > 0 ? `${durationMinutes % 60} phút` : ''}
                            </span>
                            <div className="flex items-center w-full">
                              <div className="w-2.5 h-2.5 rounded-full border-2 border-primary bg-white z-10"></div>
                              <div className="flex-1 h-px border-t-2 border-dashed border-outline-variant/60 -mx-1"></div>
                              <div className="w-2.5 h-2.5 rounded-full border-2 border-primary bg-primary z-10"></div>
                            </div>
                          </div>

                          <div className="flex flex-col items-end min-w-[120px]">
                            <span className="typo-headline-lg text-on-surface">{arrivalTimeStr}</span>
                            <span className="typo-label-sm text-outline-variant mt-1 font-medium">{dropoffPoint}</span>
                          </div>
                        </div>

                        {/* Dashed line */}
                        <div className="w-full border-t border-dashed border-outline/20 my-1" />

                        {/* Bottom: Details & actions */}
                        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                          <div className="flex flex-wrap gap-3 items-center typo-label-sm text-on-surface-variant font-medium bg-surface-container-lowest p-2 rounded-lg">
                            <div className="flex items-center gap-1.5">
                              <Bus size={18} className="text-primary" />
                              <span>{vehicleName} {totalSeats} chỗ</span>
                            </div>
                            <span className="text-outline/30">•</span>
                            <div className="flex items-center gap-1.5 text-yellow-500">
                              <span className="material-symbols-outlined text-[16px] fill-current">star</span>
                              <span>4.3</span>
                            </div>
                            <span className="text-outline/30">•</span>
                            <div className="flex items-center gap-1.5 text-secondary">
                              <span className="material-symbols-outlined text-[16px]">airline_seat_recline_extra</span>
                              <span>Còn {trip.availableSeats || 0} ghế</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                            <span className="typo-headline-md text-primary font-bold">
                              {price.toLocaleString()}đ
                            </span>
                            <button 
                              onClick={() => navigate(`${ROUTES.ROUTES}/${trip.id}`)}
                              disabled={isCancelled || isSoldOut}
                              className="bg-primary hover:bg-primary-hover disabled:bg-surface-container-highest disabled:text-outline disabled:cursor-not-allowed text-on-primary px-8 py-2.5 rounded-xl typo-label-caps transition-colors cursor-pointer whitespace-nowrap shadow-sm active:scale-95"
                            >
                              Chọn ghế
                            </button>
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : (
              // Empty search template view
              <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-16 text-center shadow-sm flex flex-col items-center gap-4 py-24 select-none">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-2">
                  <span className="material-symbols-outlined text-[32px]">filter_alt_off</span>
                </div>
                <h4 className="typo-headline-md text-primary">Không tìm thấy kết quả phù hợp</h4>
                <p className="typo-body-md text-on-surface-variant max-w-sm leading-relaxed">
                  Hãy thử mở rộng bộ lọc giá vé, thay đổi từ khóa tìm kiếm hoặc chọn vùng miền khác.
                </p>
                <button
                  onClick={() => {
                    setStartQuery('');
                    setDestQuery('');
                    setMaxPrice(2000000);
                  }}
                  className="mt-4 px-6 py-2.5 border border-outline/20 text-primary rounded-xl typo-label-caps uppercase hover:bg-primary-hover hover:text-white transition-all duration-300 cursor-pointer"
                >
                  Xóa tất cả bộ lọc
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Editorial CTA Banner */}
        <section className="bg-[#1A1410] py-xl overflow-hidden relative select-none">
          <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/handmade-paper.png')] pointer-events-none" />
          <div className="max-w-container-max mx-auto px-gutter grid grid-cols-1 md:grid-cols-2 items-center gap-lg relative z-10">
            <div className="flex flex-col gap-6 text-left">
              <h2 className="typo-headline-lg text-on-primary mb-4 italic leading-tight">
                Chưa biết đi đâu?
              </h2>
              <p className="text-on-primary/70 typo-body-lg mb-lg max-w-md">
                Để chúng tôi gợi ý cho bạn một hành trình mang đậm dấu ấn riêng.
              </p>
              <button 
                onClick={() => alert('Chức năng gợi ý hành trình đang được phát triển!')}
                className="bg-primary text-on-primary px-8 py-3 rounded-xl typo-label-caps hover:bg-primary-container transition-all w-fit cursor-pointer"
              >
                Khám phá cảm hứng
              </button>
            </div>

            <div className="relative h-[400px] flex items-center justify-center w-full">
              {/* Stacked question card effect */}
              <div className="absolute w-64 h-80 bg-surface-container-highest rounded-xl shadow-2xl rotate-6 translate-x-12 translate-y-4 opacity-40" />
              <div className="absolute w-64 h-80 bg-surface-container-high rounded-xl shadow-2xl -rotate-3 translate-x-4 translate-y-2 opacity-60" />
              <div className="absolute w-64 h-80 bg-white rounded-xl shadow-2xl z-10 p-gutter flex flex-col items-center text-center justify-center border border-outline/10">
                <span className="material-symbols-outlined text-[48px] text-primary mb-4 animate-pulse">favorite</span>
                <h4 className="typo-headline-md text-primary mb-2">Sở thích của bạn?</h4>
                <p className="text-on-surface-variant typo-body-md mb-6 leading-relaxed">Bạn thích biển xanh vẫy gọi hay núi rừng tĩnh lặng?</p>
                <div className="flex flex-col w-full gap-2">
                  <button 
                    onClick={() => handleShortcutClick('Nha Trang')}
                    className="w-full py-2 border border-outline/20 rounded-lg hover:bg-primary-container hover:text-white transition-colors typo-label-caps cursor-pointer"
                  >
                    Biển xanh
                  </button>
                  <button 
                    onClick={() => handleShortcutClick('Sapa')}
                    className="w-full py-2 border border-outline/20 rounded-lg hover:bg-primary-container hover:text-white transition-colors typo-label-caps cursor-pointer"
                  >
                    Núi rừng
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};
