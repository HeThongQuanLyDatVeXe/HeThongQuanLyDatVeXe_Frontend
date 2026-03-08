import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Ticket, Bus, Calendar, Clock, Users, XCircle } from 'lucide-react'

const MOCK_TICKETS = [
  { id:'BK240315', route:'TP. Hồ Chí Minh → Đà Lạt', operator:'Phương Trang', date:'15/03/2026', depart:'06:00', seats:['03','04'], total:560000, status:'CONFIRMED' },
  { id:'BK240320', route:'TP. Hồ Chí Minh → Nha Trang', operator:'Thành Bưởi', date:'20/03/2026', depart:'20:00', seats:['B5'], total:180000, status:'PENDING' },
  { id:'BK240228', route:'Hà Nội → Đà Nẵng', operator:'Kumho Samco', date:'28/02/2026', depart:'18:00', seats:['A12'], total:280000, status:'CANCELLED' },
  { id:'BK240210', route:'TP. Hồ Chí Minh → Vũng Tàu', operator:'Phương Trang', date:'10/02/2026', depart:'07:30', seats:['06'], total:85000, status:'COMPLETED' },
]

const STATUS = {
  CONFIRMED:  { label:'Đã xác nhận', badge:'badge-green' },
  PENDING:    { label:'Chờ thanh toán', badge:'badge-amber' },
  CANCELLED:  { label:'Đã huỷ', badge:'badge-red' },
  COMPLETED:  { label:'Hoàn thành', cls:'badge bg-ink-700/50 text-ink-400 border-ink-600/30' },
}

export default function MyTickets() {
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab]         = useState('all')

  useEffect(() => { setTimeout(() => { setTickets(MOCK_TICKETS); setLoading(false) }, 600) }, [])

  const filtered = tab === 'all' ? tickets : tickets.filter(t => t.status === tab.toUpperCase())

  return (
    <div className="wrap py-10 max-w-3xl">

      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 rounded-2xl bg-vermillion-500/15 border border-vermillion-500/25
                        flex items-center justify-center">
          <Ticket size={22} className="text-vermillion-400" />
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold text-ink-900">Vé của tôi</h1>
          <p className="text-ink-500 text-sm">{tickets.length} vé</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-surface-100 p-1 rounded-xl w-fit">
        {[['all','Tất cả'],['confirmed','Đã xác nhận'],['pending','Chờ TT'],['completed','Hoàn thành']].map(([v,l]) => (
          <button key={v} onClick={() => setTab(v)}
            className={`px-4 py-2 rounded-lg text-sm font-display font-medium transition-all ${
              tab === v
                ? 'bg-surface-400 text-ink-900 shadow-sm'
                : 'text-ink-500 hover:text-ink-200'
            }`}>{l}</button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1,2].map(i => <div key={i} className="card h-28 skeleton" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <Bus size={40} className="text-ink-800 mx-auto mb-3" />
          <p className="text-ink-500">Không có vé nào</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((t, i) => {
            const s = STATUS[t.status] || STATUS.COMPLETED
            return (
              <motion.div key={t.id}
                initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }}
                transition={{ delay: i * 0.07 }}
                className="card overflow-hidden"
              >
                {/* Top strip */}
                <div className={`h-0.5 ${t.status === 'CONFIRMED' ? 'bg-emerald-500' : t.status === 'PENDING' ? 'bg-amber-500' : t.status === 'CANCELLED' ? 'bg-vermillion-500' : 'bg-ink-600'}`} />

                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-display font-semibold text-ink-900">{t.route}</p>
                      <p className="text-xs text-ink-500 font-mono mt-0.5">{t.id}</p>
                    </div>
                    <span className={s.badge || s.cls}>{s.label}</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                    {[
                      { icon: Bus,      text: t.operator },
                      { icon: Calendar, text: t.date },
                      { icon: Clock,    text: t.depart },
                      { icon: Ticket,   text: `Ghế ${t.seats.join(', ')}` },
                    ].map(({ icon: Icon, text }) => (
                      <div key={text} className="flex items-center gap-1.5 text-xs text-ink-500">
                        <Icon size={11} className="text-ink-600" />
                        <span>{text}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="font-display font-bold text-lg text-vermillion-400">
                      {t.total.toLocaleString()}đ
                    </span>
                    {t.status === 'CONFIRMED' && (
                      <button className="text-xs text-ink-500 hover:text-vermillion-400 transition-colors
                                         flex items-center gap-1">
                        <XCircle size={12} /> Huỷ vé
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}


