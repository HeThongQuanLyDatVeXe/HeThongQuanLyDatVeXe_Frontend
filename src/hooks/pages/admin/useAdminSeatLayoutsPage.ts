import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { vehicleService } from '../../../services/vehicle-service/vehicleService';
import { useToast } from '../../../contexts/ToastContext';
import type { SeatLayoutResponse, UpdateSeatLayoutRequest, SeatType, VehicleResponse, VehicleTypeResponse } from '../../../types/vehicle-service/Vehicle';

export const SEAT_TYPE_MAP: Record<SeatType, { label: string; color: string; icon: string }> = {
  REGULAR: { label: 'Thường', color: 'bg-blue-500', icon: '💺' },
  VIP: { label: 'VIP', color: 'bg-amber-500', icon: '⭐' },
  BED: { label: 'Giường nằm', color: 'bg-purple-500', icon: '🛏️' },
  LIMOUSINE: { label: 'Limousine', color: 'bg-emerald-500', icon: '👑' },
  DOUBLE_BED: { label: 'Giường đôi', color: 'bg-pink-500', icon: '🛋️' },
};

export const useAdminSeatLayoutsPage = () => {
  const { id: vehicleId } = useParams<{ id: string }>();
  const { success, error: showError } = useToast();
  const [layouts, setLayouts] = useState<SeatLayoutResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [vehicle, setVehicle] = useState<VehicleResponse | null>(null);
  const [vehicleType, setVehicleType] = useState<VehicleTypeResponse | null>(null);

  // Edit seat modal
  const [editSeat, setEditSeat] = useState<SeatLayoutResponse | null>(null);
  const [editSeatType, setEditSeatType] = useState<SeatType>('REGULAR');
  const [editIsActive, setEditIsActive] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const autoGenerateSeats = useCallback(async (vType: VehicleTypeResponse) => {
    const totalSeats = vType.totalSeats;
    const floors = vType.floors || 1;
    const seatsPerFloor = Math.ceil(totalSeats / floors);
    const cols = 4; // standard bus layout
    const rows = Math.ceil(seatsPerFloor / cols);

    const seats: { seatNumber: string; floor: number; rowNumber: number; columnNumber: number; seatType: string; isActive: boolean }[] = [];
    let seatCount = 0;

    for (let floor = 1; floor <= floors; floor++) {
      for (let row = 1; row <= rows; row++) {
        for (let col = 1; col <= cols; col++) {
          if (seatCount >= totalSeats) break;
          const floorLabel = floors > 1 ? `T${floor}-` : '';
          const seatNumber = `${floorLabel}${String.fromCharCode(64 + row)}${col}`;
          seats.push({ seatNumber, floor, rowNumber: row, columnNumber: col, seatType: 'REGULAR', isActive: true });
          seatCount++;
        }
        if (seatCount >= totalSeats) break;
      }
    }

    try {
      await vehicleService.createSeatLayout(vehicleId!, { seats: seats as any });
      success(`Đã tự động tạo ${seats.length} ghế cho loại xe "${vType.name}"`);
      const sRes = await vehicleService.getSeatLayout(vehicleId!);
      const sData = sRes.data.result || sRes.data.data;
      setLayouts(Array.isArray(sData) ? sData : []);
    } catch (err: any) {
      showError('Lỗi tạo sơ đồ ghế: ' + (err?.response?.data?.message || err?.message || ''));
    }
  }, [vehicleId, success, showError]);

  const fetchData = useCallback(async () => {
    if (!vehicleId) return;
    setLoading(true);
    try {
      const vRes = await vehicleService.getVehicleById(vehicleId);
      const vData = (vRes.data.result || vRes.data.data) as VehicleResponse;
      setVehicle(vData);

      let vType: VehicleTypeResponse | null = null;
      if (vData?.vehicleTypeId) {
        try {
          const vtRes = await vehicleService.getVehicleTypeById(vData.vehicleTypeId);
          vType = (vtRes.data.result || vtRes.data.data) as VehicleTypeResponse;
          setVehicleType(vType);
        } catch { /* silent */ }
      }

      const sRes = await vehicleService.getSeatLayout(vehicleId);
      const sData = sRes.data.result || sRes.data.data;
      const seatList = Array.isArray(sData) ? sData : [];
      setLayouts(seatList);

      // Auto-generate if empty and vehicleType exists
      if (seatList.length === 0 && vType && vType.totalSeats > 0) {
        setLoading(false);
        await autoGenerateSeats(vType);
        return;
      }
    } catch (err: any) {
      showError('Lỗi tải dữ liệu: ' + (err?.response?.data?.message || err?.message || ''));
    } finally { setLoading(false); }
  }, [vehicleId, autoGenerateSeats, showError]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const openEditSeat = (seat: SeatLayoutResponse) => {
    setEditSeat(seat);
    setEditSeatType(seat.seatType);
    setEditIsActive(seat.isActive);
  };

  const handleUpdateSeat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editSeat) return;
    setSubmitting(true);
    try {
      const payload: UpdateSeatLayoutRequest = { seatType: editSeatType, isActive: editIsActive };
      await vehicleService.updateSeatLayout(editSeat.id, payload);
      success(`Ghế ${editSeat.seatNumber} → ${SEAT_TYPE_MAP[editSeatType].label}`);
      setEditSeat(null);
      // Update local state without full reload
      setLayouts(prev => prev.map(s => s.id === editSeat.id ? { ...s, seatType: editSeatType, isActive: editIsActive } : s));
    } catch (err: any) {
      showError(err?.response?.data?.message || 'Lỗi cập nhật ghế');
    } finally { setSubmitting(false); }
  };

  const quickChangeType = async (seat: SeatLayoutResponse, newType: SeatType) => {
    try {
      await vehicleService.updateSeatLayout(seat.id, { seatType: newType });
      setLayouts(prev => prev.map(s => s.id === seat.id ? { ...s, seatType: newType } : s));
      success(`${seat.seatNumber} → ${SEAT_TYPE_MAP[newType].label}`);
    } catch (err: any) {
      showError(err?.response?.data?.message || 'Lỗi');
    }
  };

  const floors = [...new Set(layouts.map(s => s.floor))].sort();

  return {
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
    quickChangeType,
    floors
  };
};
