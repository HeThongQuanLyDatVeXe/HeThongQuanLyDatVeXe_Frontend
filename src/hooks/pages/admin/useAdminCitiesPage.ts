import { useState, useEffect } from 'react';
import { routeService } from '../../../services/route-service/routeService';
import { adminRouteService } from '../../../services/route-service/adminRouteService';
import { useToast } from '../../../contexts/ToastContext';
import type { CityResponse } from '../../../types/route-service/response';

export type CityForm = { name: string; code: string; province: string; isActive: boolean; sortOrder: number };
export const EMPTY_FORM: CityForm = { name: '', code: '', province: '', isActive: true, sortOrder: 0 };

export const useAdminCitiesPage = () => {
  const { success, error: showError } = useToast();
  const [cities, setCities] = useState<CityResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCity, setEditingCity] = useState<CityResponse | null>(null);
  const [formData, setFormData] = useState<CityForm>(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState<string[]>([]);

  useEffect(() => { fetchCities(); }, []);

  const fetchCities = async () => {
    setLoading(true);
    try {
      const res = await routeService.getCities();
      const p = res.data.result || res.data.data;
      setCities(Array.isArray(p) ? p : (p as any)?.content || []);
    } catch (err: any) {
      showError('Lỗi tải danh sách: ' + (err?.response?.data?.message || err?.message || ''));
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

  const openModal = (city?: CityResponse) => {
    setFormErrors([]);
    if (city) {
      setEditingCity(city);
      setFormData({ name: city.name, code: city.code, province: city.province || '', isActive: city.isActive, sortOrder: city.sortOrder ?? 0 });
    } else {
      setEditingCity(null);
      setFormData(EMPTY_FORM);
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors([]);
    setSubmitting(true);
    try {
      const payload = { ...formData, province: formData.province || undefined };
      if (editingCity) {
        await adminRouteService.updateCity(editingCity.id, payload);
        success('Cập nhật thành phố thành công');
      } else {
        await adminRouteService.createCity(payload);
        success('Thêm thành phố thành công');
      }
      setIsModalOpen(false); setEditingCity(null);
      fetchCities();
    } catch (err: any) {
      const errs = extractErrors(err);
      setFormErrors(errs);
      showError(errs[0]);
    } finally { setSubmitting(false); }
  };

  const handleDelete = async (c: CityResponse) => {
    if (!window.confirm(`Xóa thành phố "${c.name}"?`)) return;
    try { await adminRouteService.deleteCity(c.id); success('Đã xóa thành phố'); fetchCities(); }
    catch (err: any) { showError(extractErrors(err)[0]); }
  };

  const activeCount = cities.filter(c => c.isActive).length;

  return {
    cities,
    loading,
    submitting,
    isModalOpen,
    setIsModalOpen,
    editingCity,
    setEditingCity,
    formData,
    setFormData,
    formErrors,
    openModal,
    handleSubmit,
    handleDelete,
    activeCount
  };
};
