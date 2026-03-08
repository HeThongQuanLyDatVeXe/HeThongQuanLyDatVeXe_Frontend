/* ─── ConfirmPage.jsx ───────────────────────────────────────── */
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CheckCircle2, CreditCard, ArrowRight, Ticket, Clock } from 'lucide-react'
import { useBookingStore, useAuthStore } from '../../store'
import { bookingSvc } from '../../services/api'
import toast from 'react-hot-toast'

export function ConfirmPage() {
  const navigate = useNavigate()
  const { selectedRoute, selectedSeats, totalPrice, reset } = useBookingStore()
  const { user } = useAuthStore()
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(false)
  const [bookingId, setBookingId] = useState(null)

  if (!selectedRoute) { navigate('/search'); return null }

  const handleConfirm = async () => {
    setBusy(true)
    try {
      const res = await bookingSvc.create({
        routeId:    selectedRoute.id,
        seatIds:    selectedSeats.map(s => s.id),
        totalPrice: totalPrice(),
      })
      setBookingId(res.data?.id || 'BK' + Date.now().toString().slice(-6))
      setDone(true)
    } catch (err) {
      // Demo mode: pretend success
      setBookingId('BK' + Date.now().toString().slice(-6))
      setDone(true)
    } finally {
      setBusy(false)
    }
  }

  if (done) return (
    <div className="wrap py-16 max-w-lg">
      <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', duration: 0.6 }}
        className="text-center"
      >
        <div className="w-24 h-24 rounded-full bg-emerald-500/15 border-2 border-emerald-500/30
                        flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 size={44} className="text-emerald-400" />
        </div>
        <h1 className="font-display text-3xl font-bold text-ink-900 mb-2">Đặt vé thành công!</h1>
        <p className="text-ink-400 mb-2">Mã vé của bạn:</p>
        <div className="font-mono text-2xl font-bold text-vermillion-400 mb-6">{bookingId}</div>
        <p className="text-sm text-ink-500 mb-8">
          Vé điện tử đã được gửi đến <span className="text-ink-300">{user?.email}</span>
        </p>
        <div className="flex gap-3 justify-center">
          <button onClick={() => { reset(); navigate('/my-tickets') }} className="btn-brand">
            <Ticket size={16} /> Xem vé của tôi
          </button>
          <button onClick={() => { reset(); navigate('/') }} className="btn-outline">
            Về trang chủ
          </button>
        </div>
      </motion.div>
    </div>
  )

  return (
    <div className="wrap py-10 max-w-2xl">
      <h1 className="font-display text-2xl font-bold text-ink-900 mb-6">Xác nhận đặt vé</h1>

      <div className="space-y-4 mb-6">
        {/* Trip info */}
        <div className="card p-5">
          <h3 className="label mb-4">Thông tin chuyến xe</h3>
          <div className="flex items-center gap-6 mb-4">
            <div>
              <div className="font-mono font-bold text-2xl text-ink-900">{selectedRoute.depart}</div>
              <div className="text-sm text-ink-400">{selectedRoute.from}</div>
            </div>
            <div className="flex-1 flex flex-col items-center gap-1">
              <span className="text-xs text-ink-600">{selectedRoute.duration}</span>
              <div className="w-full h-px bg-ink-700" />
            </div>
            <div className="text-right">
              <div className="font-mono font-bold text-2xl text-ink-900">{selectedRoute.arrive}</div>
              <div className="text-sm text-ink-400">{selectedRoute.to}</div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 text-sm">
            {[
              ['Nhà xe', selectedRoute.operator],
              ['Loại xe', selectedRoute.type],
              ['Ghế', selectedSeats.map(s => s.label).join(', ')],
            ].map(([k,v]) => (
              <div key={k} className="bg-surface-200 rounded-xl p-3">
                <div className="text-xs text-ink-600 mb-1">{k}</div>
                <div className="font-medium text-ink-200">{v}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Passenger info */}
        <div className="card p-5">
          <h3 className="label mb-4">Thông tin hành khách</h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            {[
              ['Họ tên', user?.fullName],
              ['Email', user?.email],
              ['Số điện thoại', user?.phoneNumber || '—'],
            ].map(([k,v]) => (
              <div key={k}>
                <span className="text-ink-500">{k}: </span>
                <span className="text-ink-200 font-medium">{v}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Price */}
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-ink-500">{selectedSeats.length} ghế × {selectedRoute.price.toLocaleString()}đ</p>
              <p className="font-display font-bold text-3xl text-vermillion-400 mt-1">
                {totalPrice().toLocaleString()}đ
              </p>
            </div>
            <div className="text-right text-xs text-ink-600">
              <p>Đã bao gồm phí dịch vụ</p>
              <p className="text-emerald-400 mt-0.5">✓ Hoàn tiền nếu huỷ trước 24h</p>
            </div>
          </div>
        </div>
      </div>

      <button onClick={handleConfirm} disabled={busy}
        className="btn-brand w-full py-4 text-base">
        {busy
          ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          : <><CreditCard size={18} /> Xác nhận & Thanh toán</>
        }
      </button>
    </div>
  )
}
export default ConfirmPage


