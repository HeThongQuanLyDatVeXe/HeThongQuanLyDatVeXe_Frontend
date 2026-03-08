import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Users, Ticket, TrendingUp, Bus, MoreVertical,
  ShieldCheck, ShieldOff, Eye, BarChart3
} from 'lucide-react'
import { adminApi } from '../../services/api'

const MOCK_USERS = [
  { id:'1', fullName:'Nguyễn Văn A', email:'nguyenvana@gmail.com', phone:'0901234567', status:'ACTIVE',  roles:['ROLE_USER'],  loyaltyPoints:250, createdAt:'01/01/2026' },
  { id:'2', fullName:'Trần Thị B',   email:'tranthib@gmail.com',   phone:'0912345678', status:'ACTIVE',  roles:['ROLE_USER'],  loyaltyPoints:820, createdAt:'15/01/2026' },
  { id:'3', fullName:'Lê Văn C',     email:'levanc@gmail.com',     phone:'0923456789', status:'SUSPENDED',roles:['ROLE_USER'], loyaltyPoints:0,   createdAt:'20/01/2026' },
  { id:'4', fullName:'Phạm Thị D',   email:'phamthid@gmail.com',   phone:'0934567890', status:'ACTIVE',  roles:['ROLE_ADMIN'], loyaltyPoints:1500,createdAt:'01/02/2026' },
]

const STATS = [
  { label:'Người dùng', val:'4,231', delta:'+12%', icon:Users,    color:'text-blue-400',      bg:'bg-blue-500/10 border-blue-500/20' },
  { label:'Vé đã bán',  val:'18,540', delta:'+8%', icon:Ticket,   color:'text-emerald-400',   bg:'bg-emerald-500/10 border-emerald-500/20' },
  { label:'Doanh thu',  val:'₫2.4B', delta:'+15%', icon:TrendingUp,color:'text-vermillion-400',bg:'bg-vermillion-500/10 border-vermillion-500/20' },
  { label:'Nhà xe',     val:'204',   delta:'+3',    icon:Bus,       color:'text-amber-400',     bg:'bg-amber-500/10 border-amber-500/20' },
]

export default function AdminPage() {
  const [users, setUsers]   = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch]   = useState('')

  useEffect(() => {
    setTimeout(() => { setUsers(MOCK_USERS); setLoading(false) }, 500)
  }, [])

  const filtered = users.filter(u =>
    u.fullName.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  )

  const toggleStatus = (id) => {
    setUsers(u => u.map(x => x.id === id
      ? { ...x, status: x.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE' }
      : x
    ))
  }

  return (
    <div className="wrap py-10">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-vermillion-500/15 border border-vermillion-500/25 flex items-center justify-center">
          <BarChart3 size={18} className="text-vermillion-400" />
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold text-ink-900">Admin Dashboard</h1>
          <p className="text-ink-500 text-sm">Quản trị hệ thống DiVeNha</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {STATS.map((s, i) => (
          <motion.div key={s.label}
            initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}
            transition={{ delay: i * 0.08 }}
            className={`card border p-5 ${s.bg}`}
          >
            <div className="flex items-start justify-between mb-3">
              <s.icon size={20} className={s.color} />
              <span className="text-xs text-emerald-400 font-mono">{s.delta}</span>
            </div>
            <div className={`font-display font-bold text-2xl ${s.color} mb-0.5`}>{s.val}</div>
            <div className="text-xs text-ink-500">{s.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Users table */}
      <div className="card overflow-hidden">
        <div className="p-5 border-b border-white/[0.06] flex items-center justify-between gap-4 flex-wrap">
          <h2 className="font-display font-semibold text-ink-900 flex items-center gap-2">
            <Users size={16} className="text-vermillion-400" /> Quản lý người dùng
          </h2>
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Tìm theo tên, email..." className="field text-sm w-60" />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.06]">
                {['Người dùng','Email','SĐT','Vai trò','Điểm','Trạng thái','Hành động'].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-[11px] font-display uppercase tracking-wider text-ink-600">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array(4).fill(0).map((_,i) => (
                  <tr key={i} className="border-b border-white/[0.04]">
                    {Array(7).fill(0).map((_,j) => (
                      <td key={j} className="px-5 py-3.5">
                        <div className="skeleton h-3 rounded w-20" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : filtered.map(u => (
                <tr key={u.id} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-vermillion-500/10 border border-vermillion-500/20
                                      flex items-center justify-center font-display font-bold text-xs text-vermillion-400">
                        {u.fullName[0]}
                      </div>
                      <span className="font-medium text-ink-200">{u.fullName}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-ink-400">{u.email}</td>
                  <td className="px-5 py-3.5 text-ink-500 font-mono text-xs">{u.phone}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex gap-1 flex-wrap">
                      {u.roles.map(r => (
                        <span key={r} className={r === 'ROLE_ADMIN' ? 'badge-amber text-[10px]' : 'badge-blue text-[10px]'}>
                          {r.replace('ROLE_','')}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-amber-400 font-mono text-xs">
                    {u.loyaltyPoints.toLocaleString()}
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={u.status === 'ACTIVE' ? 'badge-green text-[10px]' : 'badge-red text-[10px]'}>
                      {u.status === 'ACTIVE' ? 'Hoạt động' : 'Bị khoá'}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <button title="Xem chi tiết"
                        className="w-7 h-7 rounded-lg bg-white/[0.04] border border-white/[0.08]
                                   flex items-center justify-center text-ink-500 hover:text-ink-200 transition-colors">
                        <Eye size={13} />
                      </button>
                      <button onClick={() => toggleStatus(u.id)}
                        title={u.status === 'ACTIVE' ? 'Khoá tài khoản' : 'Mở khoá'}
                        className={`w-7 h-7 rounded-lg border flex items-center justify-center transition-colors ${
                          u.status === 'ACTIVE'
                            ? 'bg-red-500/5 border-red-500/20 text-red-500 hover:bg-red-500/10'
                            : 'bg-emerald-500/5 border-emerald-500/20 text-emerald-500 hover:bg-emerald-500/10'
                        }`}>
                        {u.status === 'ACTIVE' ? <ShieldOff size={13}/> : <ShieldCheck size={13}/>}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {!loading && (
          <div className="px-5 py-3 border-t border-white/[0.06] text-xs text-ink-600">
            Hiển thị {filtered.length}/{users.length} người dùng
          </div>
        )}
      </div>
    </div>
  )
}


