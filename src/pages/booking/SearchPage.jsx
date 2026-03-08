import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  SlidersHorizontal, ArrowRight, Bus, Clock, Users, Star,
  Wifi, Wind, Usb, Coffee, ChevronRight, Search, MapPin, Calendar
} from 'lucide-react'
import { useBookingStore, useAuthStore } from '../../store'
import toast from 'react-hot-toast'

/* ── Mock data ─────────────────────────────────────────────── */
const MOCK = [
  {
    id:'r1', operator:'Phương Trang', type:'Limousine 9 chỗ',
    from:'TP. Hồ Chí Minh', to:'Đà Lạt', depart:'06:00', arrive:'12:30',
    duration:'6h30', price:280000, seats:4, totalSeats:9, rating:4.9, reviews:3241,
    amenities:['wifi','ac','usb','snack'], logo:'PT',
  },
  {
    id:'r2', operator:'Thành Bưởi', type:'Giường nằm 40 chỗ',
    from:'TP. Hồ Chí Minh', to:'Đà Lạt', depart:'08:30', arrive:'15:00',
    duration:'6h30', price:180000, seats:12, totalSeats:40, rating:4.6, reviews:1892,
    amenities:['ac','usb'], logo:'TB',
  },
  {
    id:'r3', operator:'Kumho Samco', type:'Ghế ngồi 45 chỗ',
    from:'TP. Hồ Chí Minh', to:'Đà Lạt', depart:'13:00', arrive:'19:30',
    duration:'6h30', price:140000, seats:22, totalSeats:45, rating:4.3, reviews:987,
    amenities:['ac'], logo:'KH',
  },
  {
    id:'r4', operator:'Hải Vân Express', type:'Limousine VIP 16 chỗ',
    from:'TP. Hồ Chí Minh', to:'Đà Lạt', depart:'19:30', arrive:'02:00',
    duration:'6h30', price:350000, seats:2, totalSeats:16, rating:5.0, reviews:543,
    amenities:['wifi','ac','usb','snack'], logo:'HV',
  },
]

const AMENITY_ICONS = { wifi: Wifi, ac: Wind, usb: Usb, snack: Coffee }
const AMENITY_LABEL = { wifi: 'WiFi', ac: 'Điều hòa', usb: 'USB', snack: 'Bữa nhẹ' }

export default function SearchPage() {
  const [sp]  = useSearchParams()
  const nav   = useNavigate()
  const { setRoute } = useBookingStore()
  const { isAuthenticated } = useAuthStore()

  const from  = sp.get('from') || ''
  const to    = sp.get('to')   || ''
  const date  = sp.get('date') || ''
  const pax   = sp.get('passengers') || 1

  const [routes, setRoutes] = useState([])
  const [loading, setLoading] = useState(true)
  const [sort, setSort]     = useState('price')
  const [filters, setFilters] = useState({ maxPrice: 500000, type: 'all' })
  const [showFilter, setShowFilter] = useState(false)

  useEffect(() => {
    setLoading(true)
    setTimeout(() => { setRoutes(MOCK); setLoading(false) }, 700)
  }, [from, to, date])

  const sorted = [...routes]
    .filter(r => r.price <= filters.maxPrice && (filters.type === 'all' || r.type.toLowerCase().includes(filters.type)))
    .sort((a, b) => sort === 'price' ? a.price - b.price : sort === 'rating' ? b.rating - a.rating : a.depart.localeCompare(b.depart))

  const handleBook = (route) => {
    if (!isAuthenticated) { toast.error('Vui lòng đăng nhập để đặt vé'); nav('/login'); return }
    setRoute(route)
    nav(`/booking/${route.id}/seats`)
  }

  return (
    <div className="wrap py-8">

      {/* ── Route info bar ───────────────────────── */}
      <div className="card mb-6 p-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2 font-display font-bold text-lg text-ink-900">
              <MapPin size={16} className="text-vermillion-400" />
              {from || '—'}
              <ArrowRight size={16} className="text-vermillion-500" />
              {to || '—'}
            </div>
            <div className="flex items-center gap-3 text-sm text-ink-400">
              {date && <span className="flex items-center gap-1"><Calendar size={13}/>{date}</span>}
              <span className="flex items-center gap-1"><Users size={13}/>{pax} khách</span>
              <span className="badge-brand">{sorted.length} chuyến</span>
            </div>
          </div>
          <button onClick={() => nav('/')}
            className="btn-ghost text-sm flex items-center gap-1">
            <Search size={14}/> Tìm lại
          </button>
        </div>
      </div>

      <div className="flex gap-6">

        {/* ── Filter sidebar ───────────────────── */}
        <aside className="hidden lg:block w-60 flex-shrink-0">
          <div className="card p-5 sticky top-24">
            <h3 className="font-display font-semibold text-sm text-ink-900 mb-4 flex items-center gap-2">
              <SlidersHorizontal size={14} className="text-vermillion-400" /> Bộ lọc
            </h3>

            <div className="space-y-5">
              <div>
                <label className="label">Sắp xếp theo</label>
                <select value={sort} onChange={e => setSort(e.target.value)} className="field text-sm">
                  <option value="price">Giá thấp nhất</option>
                  <option value="rating">Đánh giá cao nhất</option>
                  <option value="depart">Giờ khởi hành sớm nhất</option>
                </select>
              </div>

              <div>
                <label className="label">Giá tối đa: {filters.maxPrice.toLocaleString()}đ</label>
                <input type="range" min={100000} max={500000} step={50000}
                  value={filters.maxPrice}
                  onChange={e => setFilters(f => ({ ...f, maxPrice: +e.target.value }))}
                  className="w-full accent-vermillion-500" />
                <div className="flex justify-between text-[10px] text-ink-600 mt-1">
                  <span>100k</span><span>500k</span>
                </div>
              </div>

              <div>
                <label className="label">Loại xe</label>
                {[['all','Tất cả'],['limousine','Limousine'],['giường nằm','Giường nằm'],['ghế ngồi','Ghế ngồi']].map(([v,l]) => (
                  <label key={v} className="flex items-center gap-2 py-1.5 cursor-pointer group">
                    <div className={`w-4 h-4 rounded-full border-2 transition-colors ${
                      filters.type === v ? 'border-vermillion-500 bg-vermillion-500' : 'border-ink-600 group-hover:border-ink-400'
                    }`} onClick={() => setFilters(f => ({ ...f, type: v }))}>
                      {filters.type === v && <div className="w-full h-full rounded-full scale-50 bg-white" />}
                    </div>
                    <span className="text-sm text-ink-300">{l}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* ── Results ──────────────────────────── */}
        <div className="flex-1 space-y-4 min-w-0">
          {loading ? (
            Array(3).fill(0).map((_,i) => (
              <div key={i} className="card p-5">
                <div className="flex gap-4">
                  <div className="skeleton w-12 h-12 rounded-xl" />
                  <div className="flex-1 space-y-2">
                    <div className="skeleton h-4 w-1/3" />
                    <div className="skeleton h-3 w-1/2" />
                    <div className="skeleton h-3 w-1/4" />
                  </div>
                </div>
              </div>
            ))
          ) : sorted.length === 0 ? (
            <div className="text-center py-20">
              <Bus size={44} className="text-ink-700 mx-auto mb-3" />
              <p className="font-display text-ink-400">Không tìm thấy chuyến xe phù hợp</p>
              <p className="text-sm text-ink-600 mt-1">Thử thay đổi bộ lọc hoặc ngày khác</p>
            </div>
          ) : sorted.map((r, i) => (
            <motion.div key={r.id}
              initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}
              transition={{ delay: i * 0.07, ease:[0.16,1,0.3,1] }}
              className="card-interactive overflow-hidden"
            >
              <div className="p-5">
                <div className="flex items-start gap-4">

                  {/* Logo */}
                  <div className="w-12 h-12 rounded-xl bg-vermillion-500/15 border border-vermillion-500/25
                                  flex items-center justify-center font-display font-bold text-vermillion-400 flex-shrink-0">
                    {r.logo}
                  </div>

                  {/* Main info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="font-display font-semibold text-ink-900">{r.operator}</span>
                      <span className="badge-blue text-[11px]">{r.type}</span>
                      {r.seats <= 3 && <span className="badge-brand text-[11px]">🔥 Còn {r.seats} chỗ</span>}
                    </div>

                    {/* Time row */}
                    <div className="flex items-center gap-4 my-3">
                      <div>
                        <div className="font-mono font-bold text-xl text-ink-900">{r.depart}</div>
                        <div className="text-xs text-ink-500 truncate max-w-28">{r.from}</div>
                      </div>
                      <div className="flex-1 flex flex-col items-center gap-1">
                        <span className="text-xs text-ink-600 font-mono">{r.duration}</span>
                        <div className="w-full flex items-center gap-1">
                          <div className="flex-1 h-px bg-ink-700" />
                          <Bus size={12} className="text-vermillion-500" />
                          <div className="flex-1 h-px bg-ink-700" />
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono font-bold text-xl text-ink-900">{r.arrive}</div>
                        <div className="text-xs text-ink-500 truncate max-w-28">{r.to}</div>
                      </div>
                    </div>

                    {/* Meta row */}
                    <div className="flex items-center gap-3 flex-wrap text-xs text-ink-500">
                      <span className="flex items-center gap-1">
                        <Star size={11} className="text-amber-400 fill-amber-400" />
                        <span className="text-ink-300 font-semibold">{r.rating}</span>
                        <span>({r.reviews.toLocaleString()})</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <Users size={11} />
                        Còn {r.seats}/{r.totalSeats} chỗ
                      </span>
                      <div className="flex items-center gap-1.5">
                        {r.amenities.map(a => {
                          const Icon = AMENITY_ICONS[a]
                          return Icon ? (
                            <span key={a} title={AMENITY_LABEL[a]}
                              className="flex items-center gap-1 bg-white/[0.04] border border-white/[0.07]
                                         px-1.5 py-0.5 rounded text-ink-400">
                              <Icon size={10} />
                            </span>
                          ) : null
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Price + CTA */}
                  <div className="flex-shrink-0 text-right flex flex-col items-end gap-3">
                    <div>
                      <div className="font-display font-bold text-2xl text-vermillion-400">
                        {r.price.toLocaleString()}đ
                      </div>
                      <div className="text-xs text-ink-500">/người</div>
                    </div>
                    <button onClick={() => handleBook(r)}
                      className="btn-brand text-sm py-2.5 px-4">
                      Chọn chỗ <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}


