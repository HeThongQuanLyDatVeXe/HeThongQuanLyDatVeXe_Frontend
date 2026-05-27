import { useState, useEffect } from 'react';
import { routeService } from '../../../services/route-service/routeService';
import { adminRouteService } from '../../../services/route-service/adminRouteService';
import { useToast } from '../../../contexts/ToastContext';
import type { PointResponse, CityResponse } from '../../../types/route-service/response';

export type PointType = 'PICKUP' | 'DROPOFF' | 'BOTH';
export type TabType = 'PICKUP' | 'DROPOFF';

export const TYPE_LABELS: Record<PointType, { label: string; color: string; icon: string }> = {
  PICKUP: { label: 'Điểm đón', color: 'bg-blue-100 text-blue-700', icon: 'hail' },
  DROPOFF: { label: 'Điểm trả', color: 'bg-orange-100 text-orange-700', icon: 'pin_drop' },
  BOTH: { label: 'Đón + Trả', color: 'bg-purple-100 text-purple-700', icon: 'swap_vert' },
};

export type FormState = {
  name: string; address: string; cityId: string;
  latitude: string; longitude: string;
  type: PointType; isActive: boolean; sortOrder: number;
};

export const EMPTY_FORM = (tab: TabType, cityId?: string): FormState => ({
  name: '', address: '', cityId: cityId || '', latitude: '', longitude: '',
  type: tab, isActive: true, sortOrder: 0,
});

export const useAdminPointsPage = () => {
  const { success, error: showError } = useToast();
  const [activeTab, setActiveTab] = useState<TabType>('PICKUP');
  const [points, setPoints] = useState<PointResponse[]>([]);
  const [cities, setCities] = useState<CityResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [filterCityId, setFilterCityId] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPoint, setEditingPoint] = useState<PointResponse | null>(null);
  const [formData, setFormData] = useState<FormState>(EMPTY_FORM('PICKUP'));
  const [formErrors, setFormErrors] = useState<string[]>([]);

  useEffect(() => { fetchCities(); }, []);
  useEffect(() => { setPage(0); }, [activeTab, filterCityId]);
  useEffect(() => { fetchPoints(); }, [activeTab, filterCityId, page]);

  const fetchCities = async () => {
    try {
      const res = await routeService.getCities();
      const p = res.data.result || res.data.data;
      setCities(Array.isArray(p) ? p : (p as any)?.content || []);
    } catch { /* silent */ }
  };

  const fetchPoints = async () => {
    setLoading(true);
    try {
      let res;
      if (filterCityId) {
        res = activeTab === 'PICKUP'
          ? await routeService.getPickupPointsByCity(filterCityId)
          : await routeService.getDropoffPointsByCity(filterCityId);
      } else {
        res = activeTab === 'PICKUP'
          ? await routeService.getPickupPoints({ page, size: 20 })
          : await routeService.getDropoffPoints({ page, size: 20 });
      }
      const payload = res.data.result || res.data.data;
      const arr = Array.isArray(payload) ? payload : (payload as any)?.content || [];
      setPoints(arr);
      setTotalPages(Array.isArray(payload) ? 1 : (payload as any)?.totalPages || 1);
    } catch (err: any) {
      showError('Lỗi tải dữ liệu: ' + (err?.response?.data?.message || ''));
      setPoints([]);
    } finally { setLoading(false); }
  };

  const extractErrors = (err: any): string[] => {
    const d = err?.response?.data;
    if (!d) return [err?.message || 'Lỗi không xác định'];
    const errs: string[] = [];
    if (d.errors && typeof d.errors === 'object') Object.entries(d.errors).forEach(([f, m]) => errs.push(`${f}: ${m}`));
    if (d.message) errs.push(d.message);
    return errs.length > 0 ? errs : ['Có lỗi xảy ra'];
  };

  const openModal = (point?: PointResponse) => {
    setFormErrors([]);
    if (point) {
      setEditingPoint(point);
      setFormData({
        name: point.name, address: point.address, cityId: point.cityId,
        latitude: point.latitude != null ? String(point.latitude) : '',
        longitude: point.longitude != null ? String(point.longitude) : '',
        type: point.type, isActive: point.isActive, sortOrder: point.sortOrder,
      });
    } else {
      setEditingPoint(null);
      setFormData(EMPTY_FORM(activeTab, filterCityId || cities[0]?.id || ''));
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.cityId) { showError('Vui lòng chọn thành phố'); return; }
    setFormErrors([]);
    setSubmitting(true);
    try {
      const payload: any = {
        name: formData.name, address: formData.address, cityId: formData.cityId,
        latitude: formData.latitude ? Number(formData.latitude) : undefined,
        longitude: formData.longitude ? Number(formData.longitude) : undefined,
        type: formData.type, isActive: formData.isActive, sortOrder: formData.sortOrder,
      };
      if (editingPoint) {
        if (activeTab === 'PICKUP') await adminRouteService.updatePickupPoint(editingPoint.id, payload);
        else await adminRouteService.updateDropoffPoint(editingPoint.id, payload);
        success('Cập nhật điểm dừng thành công');
      } else {
        if (activeTab === 'PICKUP') await adminRouteService.createPickupPoint(payload);
        else await adminRouteService.createDropoffPoint(payload);
        success('Thêm điểm dừng thành công');
      }
      setIsModalOpen(false); setEditingPoint(null);
      fetchPoints();
    } catch (err: any) {
      const errs = extractErrors(err);
      setFormErrors(errs);
      showError(errs[0]);
    } finally { setSubmitting(false); }
  };

  const handleDelete = async (p: PointResponse) => {
    if (!window.confirm(`Xóa "${p.name}"?`)) return;
    try {
      if (activeTab === 'PICKUP') await adminRouteService.deletePickupPoint(p.id);
      else await adminRouteService.deleteDropoffPoint(p.id);
      success('Đã xóa điểm dừng');
      fetchPoints();
    } catch (err: any) { showError(extractErrors(err)[0]); }
  };

  const getCityName = (cityId: string, cityName?: string) => cityName || cities.find(c => c.id === cityId)?.name || '—';

  return {
    activeTab,
    setActiveTab,
    points,
    cities,
    loading,
    submitting,
    filterCityId,
    setFilterCityId,
    page,
    setPage,
    totalPages,
    isModalOpen,
    setIsModalOpen,
    editingPoint,
    setEditingPoint,
    formData,
    setFormData,
    formErrors,
    openModal,
    handleSubmit,
    handleDelete,
    getCityName
  };
};
