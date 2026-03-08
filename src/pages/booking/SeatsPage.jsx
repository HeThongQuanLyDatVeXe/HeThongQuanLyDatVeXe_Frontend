import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Bus, ArrowRight, Info } from "lucide-react";
import { useBookingStore } from "../../store";

/* ── Generate seat layout ──────────────────────────────────── */
function makeSeats(total, bookedIds) {
  return Array.from({ length: total }, (_, i) => {
    const n = i + 1;
    return {
      id: `S${n}`,
      label: n < 10 ? `0${n}` : `${n}`,
      status: bookedIds.includes(n) ? "taken" : "free",
    };
  });
}

const BOOKED_LOWER = [3, 7, 11, 15, 18];
const BOOKED_UPPER = [2, 6, 9, 14, 20];

export default function SeatsPage() {
  const navigate = useNavigate();
  const { selectedRoute, selectedSeats, toggleSeat, totalPrice } =
    useBookingStore();
  const [floor, setFloor] = useState("lower");

  if (!selectedRoute) {
    navigate("/search");
    return null;
  }

  const lowerSeats = makeSeats(20, BOOKED_LOWER);
  const upperSeats = makeSeats(20, BOOKED_UPPER);
  const seats = floor === "lower" ? lowerSeats : upperSeats;

  // Group into rows of 4 (2+2)
  const rows = [];
  for (let i = 0; i < seats.length; i += 4) rows.push(seats.slice(i, i + 4));

  return (
    <div className="wrap py-10 max-w-3xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-ink-500 mb-2">
          <span>Tìm vé</span>
          <ArrowRight size={12} />
          <span className="text-ink-300">Chọn chỗ ngồi</span>
        </div>
        <h1 className="font-display text-2xl font-bold text-ink-900">
          Chọn ghế
        </h1>
        <p className="text-ink-400 text-sm mt-1">
          {selectedRoute.operator} · {selectedRoute.from} → {selectedRoute.to} ·{" "}
          {selectedRoute.depart}
        </p>
      </div>

      <div className="grid lg:grid-cols-[1fr,280px] gap-6">
        {/* Seat map */}
        <div>
          {/* Floor tabs */}
          <div className="flex gap-2 mb-5">
            {[
              ["lower", "🚌 Tầng dưới"],
              ["upper", "🏢 Tầng trên"],
            ].map(([v, l]) => (
              <button
                key={v}
                onClick={() => setFloor(v)}
                className={`px-4 py-2 rounded-xl text-sm font-display font-medium transition-all ${
                  floor === v
                    ? "bg-vermillion-500 text-white shadow-glow-sm"
                    : "bg-white/[0.05] border border-white/[0.08] text-ink-300 hover:bg-white/[0.08]"
                }`}
              >
                {l}
              </button>
            ))}
          </div>

          {/* Legend */}
          <div className="flex items-center gap-5 mb-5 text-xs text-ink-500">
            {[
              { cls: "seat-free w-7 h-7", label: "Trống" },
              { cls: "seat-mine w-7 h-7", label: "Đang chọn" },
              { cls: "seat-taken w-7 h-7", label: "Đã đặt" },
            ].map(({ cls, label }) => (
              <div key={label} className="flex items-center gap-2">
                <div className={cls} />
                <span>{label}</span>
              </div>
            ))}
          </div>

          {/* Seat grid */}
          <div className="card p-6">
            {/* Bus front */}
            <div className="flex items-center justify-center gap-2 mb-5 text-xs text-ink-600 font-display">
              <div className="flex-1 h-px bg-ink-800" />
              <Bus size={14} />
              <span>Đầu xe</span>
              <div className="flex-1 h-px bg-ink-800" />
            </div>

            {/* Rows */}
            <div className="space-y-2">
              {rows.map((row, ri) => (
                <div
                  key={ri}
                  className="flex items-center justify-center gap-3"
                >
                  <div className="flex gap-2">
                    {row.slice(0, 2).map((seat) => {
                      const isMine = selectedSeats.find(
                        (s) => s.id === seat.id,
                      );
                      const cls =
                        seat.status === "taken"
                          ? "seat-taken"
                          : isMine
                            ? "seat-mine"
                            : "seat-free";
                      return (
                        <motion.button
                          key={seat.id}
                          whileTap={
                            seat.status !== "taken" ? { scale: 0.88 } : {}
                          }
                          onClick={() =>
                            seat.status !== "taken" && toggleSeat(seat)
                          }
                          className={cls}
                        >
                          {seat.label}
                        </motion.button>
                      );
                    })}
                  </div>
                  {/* Aisle */}
                  <div className="w-6 flex items-center justify-center">
                    <span className="text-[9px] text-ink-800 font-mono">
                      {ri + 1}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    {row.slice(2).map((seat) => {
                      const isMine = selectedSeats.find(
                        (s) => s.id === seat.id,
                      );
                      const cls =
                        seat.status === "taken"
                          ? "seat-taken"
                          : isMine
                            ? "seat-mine"
                            : "seat-free";
                      return (
                        <motion.button
                          key={seat.id}
                          whileTap={
                            seat.status !== "taken" ? { scale: 0.88 } : {}
                          }
                          onClick={() =>
                            seat.status !== "taken" && toggleSeat(seat)
                          }
                          className={cls}
                        >
                          {seat.label}
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Bus back */}
            <div className="flex items-center justify-center gap-2 mt-5 text-xs text-ink-700 font-display">
              <div className="flex-1 h-px bg-ink-800" />
              <span>Cuối xe</span>
              <div className="flex-1 h-px bg-ink-800" />
            </div>
          </div>
        </div>

        {/* Summary sidebar */}
        <div className="space-y-4">
          <div className="card p-5">
            <h3 className="font-display font-semibold text-ink-900 mb-4">
              Thông tin chuyến
            </h3>
            {[
              ["Nhà xe", selectedRoute.operator],
              ["Tuyến", `${selectedRoute.from} → ${selectedRoute.to}`],
              ["Khởi hành", selectedRoute.depart],
              ["Loại xe", selectedRoute.type],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between text-sm py-1.5">
                <span className="text-ink-500">{k}</span>
                <span className="text-ink-200 font-medium text-right max-w-[55%]">
                  {v}
                </span>
              </div>
            ))}
          </div>

          {/* Selected */}
          <div className="card p-5">
            <h3 className="font-display font-semibold text-ink-900 mb-3">
              Ghế đã chọn
            </h3>
            <AnimatePresence>
              {selectedSeats.length === 0 ? (
                <div className="flex items-center gap-2 text-sm text-ink-600 py-2">
                  <Info size={14} /> Chưa chọn ghế nào
                </div>
              ) : (
                <div className="flex flex-wrap gap-2 mb-4">
                  {selectedSeats.map((s) => (
                    <motion.span
                      key={s.id}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="badge-brand font-mono"
                    >
                      {s.label}
                    </motion.span>
                  ))}
                </div>
              )}
            </AnimatePresence>

            {selectedSeats.length > 0 && (
              <>
                <div className="divider my-3" />
                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm text-ink-400">
                    {selectedSeats.length} ×{" "}
                    {selectedRoute.price.toLocaleString()}đ
                  </span>
                  <span className="font-display font-bold text-xl text-vermillion-400">
                    {totalPrice().toLocaleString()}đ
                  </span>
                </div>
              </>
            )}

            <button
              onClick={() => navigate("/booking/confirm")}
              disabled={selectedSeats.length === 0}
              className="btn-brand w-full"
            >
              Tiếp tục <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
