import React from 'react';
import { Link } from 'react-router-dom';
import { AdminLayout } from '../../components/layouts/AdminLayout';
import type { SeatType } from '../../types/vehicle-service/Vehicle';
import { ROUTES } from '../../constants/routes';
import { useAdminSeatLayoutsPage, SEAT_TYPE_MAP } from '../../hooks/pages/admin/useAdminSeatLayoutsPage';

export const AdminSeatLayoutsPage: React.FC = () => {
  const {
    layouts,
    loading,
    vehicle,
    vehicleType,
    editSeat,
    setEditSeat,
    editSeatType,
    setEditSeatType,
    editIsActive,
    setEditIsActive,
    submitting,
    openEditSeat,
    handleUpdateSeat,
    floors
  } = useAdminSeatLayoutsPage();

  const renderSeatMap = (floorNum: number) => {
    const floorSeats = layouts.filter(s => s.floor === floorNum);
    if (floorSeats.length === 0) return null;
    const maxRow = Math.max(...floorSeats.map(s => s.rowNumber));
    const maxCol = Math.max(...floorSeats.map(s => s.columnNumber));

    return (
      <div className="space-y-1.5">
        {Array.from({ length: maxRow }, (_, r) => r + 1).map(row => (
          <div key={row} className="flex gap-1.5 items-center">
            <span className="text-xs text-slate-400 w-6 text-right mr-1 font-mono">{String.fromCharCode(64 + row)}</span>
            {Array.from({ length: maxCol }, (_, c) => c + 1).map(col => {
              const seat = floorSeats.find(s => s.rowNumber === row && s.columnNumber === col);
              if (!seat) return <div key={col} className="w-14 h-11" />;
              const info = SEAT_TYPE_MAP[seat.seatType] || SEAT_TYPE_MAP.REGULAR;
              return (
                <button key={col} onClick={() => openEditSeat(seat)}
                  title={`${seat.seatNumber} — ${info.label} — Click để sửa`}
                  className={`w-14 h-11 rounded-lg text-white text-xs font-bold flex flex-col items-center justify-center transition-all hover:scale-110 hover:shadow-lg cursor-pointer border-2 border-transparent hover:border-white/50 ${seat.isActive ? info.color : 'bg-slate-300'}`}>
                  <span className="leading-none">{seat.seatNumber}</span>
                  <span className="text-[9px] opacity-80 leading-none">{info.icon}</span>
                </button>
              );
            })}
          </div>
        ))}
      </div>
    );
  };

  return (
    <AdminLayout>
      <div className="space-y-6 text-slate-800">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to={ROUTES.ADMIN_VEHICLES} className="p-2 bg-slate-200 hover:bg-slate-300 rounded-lg transition-colors">
              <span className="material-symbols-outlined">arrow_back</span>
            </Link>
            <div>
              <h1 className="text-3xl font-bold font-serif text-[#F4600C]">Sơ đồ ghế</h1>
              <p className="text-sm text-slate-500">
                Xe: <strong>{vehicle?.licensePlate || '...'}</strong>
                {vehicleType && <> — Loại: <strong>{vehicleType.name}</strong> ({vehicleType.totalSeats} ghế, {vehicleType.floors} tầng)</>}
              </p>
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800 flex items-start gap-2">
          <span className="material-symbols-outlined text-base mt-0.5">info</span>
          <div>
            <strong>Hướng dẫn:</strong> Sơ đồ ghế được tạo tự động theo số ghế của Loại xe.
            <strong> Click vào ghế</strong> để thay đổi loại ghế (Thường, VIP, Giường nằm...).
            Tất cả xe cùng loại dùng chung sơ đồ này.
          </div>
        </div>

        {/* Stats */}
        {layouts.length > 0 && (
          <div className="flex gap-3 flex-wrap">
            <div className="bg-white rounded-lg border px-4 py-2 text-sm">
              Tổng: <strong>{layouts.length}</strong> ghế
            </div>
            {Object.entries(SEAT_TYPE_MAP).map(([type, info]) => {
              const count = layouts.filter(s => s.seatType === type).length;
              if (count === 0) return null;
              return (
                <div key={type} className={`rounded-lg border px-4 py-2 text-sm text-white ${info.color}`}>
                  {info.icon} {info.label}: <strong>{count}</strong>
                </div>
              );
            })}
          </div>
        )}

        {/* Seat Map */}
        {loading ? (
          <div className="bg-white rounded-xl border p-8 text-center text-slate-500">
            <span className="material-symbols-outlined animate-spin align-middle mr-1">progress_activity</span>Đang tải...
          </div>
        ) : layouts.length === 0 ? (
          <div className="bg-white rounded-xl border p-12 text-center">
            <span className="material-symbols-outlined text-5xl text-slate-300">airline_seat_recline_normal</span>
            <p className="text-slate-500 mt-4">Không có dữ liệu sơ đồ ghế.</p>
          </div>
        ) : (
          <div className={`grid gap-6 ${floors.length > 1 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 max-w-lg'}`}>
            {floors.map(floor => (
              <div key={floor} className="bg-white rounded-xl border shadow-sm p-6">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-slate-400">layers</span>
                  {floors.length > 1 ? `Tầng ${floor}` : 'Sơ đồ ghế'}
                  <span className="text-sm font-normal text-slate-400">({layouts.filter(s => s.floor === floor).length} ghế)</span>
                </h3>
                <div className="flex justify-center">
                  <div className="bg-gradient-to-b from-slate-100 to-slate-50 rounded-2xl p-5 border-2 border-dashed border-slate-200 inline-block">
                    <div className="text-center text-xs text-slate-400 mb-3 flex items-center justify-center gap-1">
                      <span className="material-symbols-outlined text-sm">directions_bus</span> Đầu xe
                    </div>
                    {renderSeatMap(floor)}
                    <div className="text-center text-xs text-slate-400 mt-3">Đuôi xe</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Legend */}
        {layouts.length > 0 && (
          <div className="flex gap-4 flex-wrap text-xs text-slate-600 bg-white rounded-lg border p-3">
            <span className="font-medium text-slate-500">Chú thích:</span>
            {Object.entries(SEAT_TYPE_MAP).map(([, info]) => (
              <div key={info.label} className="flex items-center gap-1">
                <div className={`w-4 h-4 rounded ${info.color}`}></div>
                {info.icon} {info.label}
              </div>
            ))}
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 rounded bg-slate-300"></div>
              🚫 Đã khóa
            </div>
          </div>
        )}

        {/* Edit Seat Modal */}
        {editSeat && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-full max-w-xs p-6 shadow-2xl">
              <h2 className="text-xl font-bold mb-1">Ghế {editSeat.seatNumber}</h2>
              <p className="text-sm text-slate-500 mb-5">Tầng {editSeat.floor} • Hàng {editSeat.rowNumber} • Cột {editSeat.columnNumber}</p>

              <form onSubmit={handleUpdateSeat} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Chọn loại ghế</label>
                  <div className="grid grid-cols-1 gap-2">
                    {Object.entries(SEAT_TYPE_MAP).map(([key, info]) => (
                      <label key={key}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border-2 cursor-pointer transition-all ${editSeatType === key ? `${info.color} text-white border-transparent shadow-md` : 'border-slate-200 hover:border-slate-300 bg-white'}`}>
                        <input type="radio" name="seatType" value={key} checked={editSeatType === key}
                          onChange={() => setEditSeatType(key as SeatType)} className="sr-only" />
                        <span className="text-lg">{info.icon}</span>
                        <span className="font-medium text-sm">{info.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={editIsActive} onChange={e => setEditIsActive(e.target.checked)} className="sr-only peer" />
                    <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                  </label>
                  <span className="text-sm">{editIsActive ? 'Hoạt động' : 'Đã khóa'}</span>
                </div>

                <div className="flex gap-3 justify-end border-t pt-4">
                  <button type="button" onClick={() => setEditSeat(null)} disabled={submitting} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium disabled:opacity-50">Hủy</button>
                  <button type="submit" disabled={submitting} className="px-4 py-2 bg-[#F4600C] text-white rounded-lg font-medium hover:bg-[#D5530A] disabled:opacity-50 flex items-center gap-2">
                    {submitting && <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>}
                    Lưu
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};
