import { useState, useEffect } from 'react';
import { adminPriceService } from '../../../services/price-service/adminPriceService';
import { routeService } from '../../../services/route-service/routeService';
import { vehicleService } from '../../../services/vehicle-service/vehicleService';
import { useToast } from '../../../contexts/ToastContext';

import type { CreateBasePriceRequest, CreatePricingRuleRequest, CreateSurchargeRequest, CreateSeasonalPriceRequest } from '../../../types/price-service/AdminPrice';
import type { RouteResponse } from '../../../types/route-service/response';
import type { VehicleTypeResponse } from '../../../types/vehicle-service/Vehicle';

// In-memory cache for pricing lists
const pricingCache = {
  basePrices: null as any[] | null,
  rules: null as any[] | null,
  surcharges: null as any[] | null,
  seasonal: null as any[] | null,
  routes: null as RouteResponse[] | null,
  vehicleTypes: null as VehicleTypeResponse[] | null,
};

export const useAdminPricesPage = () => {
  const { success, error: showError } = useToast();
  const [activeTab, setActiveTab] = useState<'base' | 'rules' | 'surcharges' | 'seasonal'>('base');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<string[]>([]);

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editId, setEditId] = useState('');
  const [baseFormData, setBaseFormData] = useState<CreateBasePriceRequest>({
    routeId: '',
    vehicleTypeId: '',
    seatType: 'REGULAR',
    price: 0,
    currency: 'VND',
    effectiveFrom: ''
  });
  const [ruleFormData, setRuleFormData] = useState<CreatePricingRuleRequest>({
    name: '',
    eventType: 'EARLY_BIRD',
    ruleType: 'PERCENTAGE',
    value: 0,
    effectiveFrom: '',
    priority: 0
  });
  const [surchargeFormData, setSurchargeFormData] = useState<CreateSurchargeRequest>({
    name: '',
    code: '',
    type: 'FIXED_AMOUNT',
    value: 0,
    description: ''
  });
  const [seasonalFormData, setSeasonalFormData] = useState<CreateSeasonalPriceRequest>({
    name: '',
    routeId: '',
    vehicleTypeId: '',
    type: 'PERCENTAGE',
    value: 0,
    startDate: '',
    endDate: ''
  });

  // Data lists
  const [basePrices, setBasePrices] = useState<any[]>(pricingCache.basePrices || []);
  const [rules, setRules] = useState<any[]>(pricingCache.rules || []);
  const [surcharges, setSurcharges] = useState<any[]>(pricingCache.surcharges || []);
  const [seasonal, setSeasonal] = useState<any[]>(pricingCache.seasonal || []);

  // Aggregation lists
  const [routes, setRoutes] = useState<RouteResponse[]>(pricingCache.routes || []);
  const [vehicleTypes, setVehicleTypes] = useState<VehicleTypeResponse[]>(pricingCache.vehicleTypes || []);

  useEffect(() => {
    fetchMetadata();
  }, []);

  useEffect(() => {
    if (activeTab === 'base') fetchBasePrices();
    if (activeTab === 'rules') fetchRules();
    if (activeTab === 'surcharges') fetchSurcharges();
    if (activeTab === 'seasonal') fetchSeasonal();
  }, [activeTab]);

  useEffect(() => {
    const handleDataChanged = () => {
      if (activeTab === 'base') fetchBasePrices(true);
      if (activeTab === 'rules') fetchRules(true);
      if (activeTab === 'surcharges') fetchSurcharges(true);
      if (activeTab === 'seasonal') fetchSeasonal(true);
    };
    window.addEventListener('admin-data-changed', handleDataChanged);
    return () => window.removeEventListener('admin-data-changed', handleDataChanged);
  }, [activeTab]);

  const fetchMetadata = async () => {
    if (pricingCache.routes && pricingCache.vehicleTypes) return;
    try {
      const [routeRes, vehicleTypeRes] = await Promise.all([
        routeService.getRoutes({ size: 200 }),
        vehicleService.getVehicleTypes()
      ]);

      const fetchedRoutes = routeRes.data.result?.content || routeRes.data.data?.content || [];
      setRoutes(fetchedRoutes);
      pricingCache.routes = fetchedRoutes;

      const fetchedVtypes = vehicleTypeRes.data.result?.content || vehicleTypeRes.data.data?.content || [];
      setVehicleTypes(fetchedVtypes);
      pricingCache.vehicleTypes = fetchedVtypes;
    } catch (error) {
      console.error("Failed to load metadata", error);
    }
  };

  const extractErrors = (err: any): string[] => {
    const d = err?.response?.data;
    if (!d) return [err?.message || 'Lỗi không xác định'];
    const errs: string[] = [];
    if (d.errors && typeof d.errors === 'object') Object.entries(d.errors).forEach(([f, m]) => errs.push(`${f}: ${m}`));
    if (d.message) errs.push(d.message);
    return errs.length > 0 ? errs : ['Có lỗi xảy ra'];
  };

  const fetchBasePrices = async (force = false) => {
    if (!force && pricingCache.basePrices) {
      setBasePrices(pricingCache.basePrices);
      return;
    }
    setLoading(true);
    try {
      const res = await adminPriceService.getAllBasePrices();
      const data = res.data.result || res.data.data || [];
      setBasePrices(data);
      pricingCache.basePrices = data;
    } catch (err) {
      console.error('Failed to fetch base prices');
    } finally { setLoading(false); }
  };

  const fetchRules = async (force = false) => {
    if (!force && pricingCache.rules) {
      setRules(pricingCache.rules);
      return;
    }
    setLoading(true);
    try {
      const res = await adminPriceService.getAllPricingRules();
      const data = res.data.result || res.data.data || [];
      setRules(data);
      pricingCache.rules = data;
    } catch (err) {
      console.error('Failed to fetch rules');
    } finally { setLoading(false); }
  };

  const fetchSurcharges = async (force = false) => {
    if (!force && pricingCache.surcharges) {
      setSurcharges(pricingCache.surcharges);
      return;
    }
    setLoading(true);
    try {
      const res = await adminPriceService.getAllSurcharges();
      const data = res.data.result || res.data.data || [];
      setSurcharges(data);
      pricingCache.surcharges = data;
    } catch (err) {
      console.error('Failed to fetch surcharges');
    } finally { setLoading(false); }
  };

  const fetchSeasonal = async (force = false) => {
    if (!force && pricingCache.seasonal) {
      setSeasonal(pricingCache.seasonal);
      return;
    }
    setLoading(true);
    try {
      const res = await adminPriceService.getAllSeasonalPrices();
      const data = res.data.result || res.data.data || [];
      setSeasonal(data);
      pricingCache.seasonal = data;
    } catch (err) {
      console.error('Failed to fetch seasonal prices');
    } finally { setLoading(false); }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFormErrors([]);
    try {
      if (activeTab === 'base') {
        await adminPriceService.createBasePrice({
          ...baseFormData,
          price: Number(baseFormData.price)
        });
        success('Thêm giá cơ bản thành công');
        fetchBasePrices(true);
        setIsAddModalOpen(false);
        setBaseFormData({
          routeId: '', vehicleTypeId: '', seatType: 'REGULAR', price: 0, currency: 'VND', effectiveFrom: ''
        });
      } else if (activeTab === 'rules') {
        await adminPriceService.createPricingRule({
          ...ruleFormData,
          value: Number(ruleFormData.value),
          minDaysBefore: ruleFormData.minDaysBefore ? Number(ruleFormData.minDaysBefore) : undefined,
          maxDaysBefore: ruleFormData.maxDaysBefore ? Number(ruleFormData.maxDaysBefore) : undefined,
          minOccupancyPct: ruleFormData.minOccupancyPct ? Number(ruleFormData.minOccupancyPct) : undefined,
          maxOccupancyPct: ruleFormData.maxOccupancyPct ? Number(ruleFormData.maxOccupancyPct) : undefined,
          priority: ruleFormData.priority ? Number(ruleFormData.priority) : 0
        });
        success('Thêm quy tắc giá thành công');
        fetchRules(true);
        setIsAddModalOpen(false);
        setRuleFormData({
          name: '', eventType: 'EARLY_BIRD', ruleType: 'PERCENTAGE', value: 0, priority: 0, effectiveFrom: ''
        });
      } else if (activeTab === 'surcharges') {
        await adminPriceService.createSurcharge({
          ...surchargeFormData,
          value: Number(surchargeFormData.value)
        });
        success('Thêm phụ phí thành công');
        fetchSurcharges(true);
        setIsAddModalOpen(false);
        setSurchargeFormData({ name: '', code: '', type: 'FIXED_AMOUNT', value: 0, description: '' });
      } else if (activeTab === 'seasonal') {
        await adminPriceService.createSeasonalPrice({
          ...seasonalFormData,
          value: Number(seasonalFormData.value),
          routeId: seasonalFormData.routeId || undefined,
          vehicleTypeId: seasonalFormData.vehicleTypeId || undefined
        });
        success('Thêm giá theo mùa thành công');
        fetchSeasonal(true);
        setIsAddModalOpen(false);
        setSeasonalFormData({ name: '', routeId: '', vehicleTypeId: '', type: 'PERCENTAGE', value: 0, startDate: '', endDate: '' });
      } else {
        alert('Chức năng thêm cho tab này đang phát triển');
        return;
      }
    } catch (err: any) {
      const errs = extractErrors(err);
      setFormErrors(errs);
      showError(errs[0]);
    } finally {
      setSubmitting(false);
    }
  };

  const openEditBaseModal = (item: any) => {
    setFormErrors([]);
    setEditId(item.id);
    setBaseFormData({
      routeId: item.routeId,
      vehicleTypeId: item.vehicleTypeId,
      seatType: item.seatType,
      price: item.price,
      currency: item.currency,
      effectiveFrom: item.effectiveFrom.split('T')[0]
    });
    setIsEditModalOpen(true);
  };

  const openEditRuleModal = (item: any) => {
    setFormErrors([]);
    setEditId(item.id);
    setRuleFormData({
      name: item.name,
      eventType: item.eventType,
      ruleType: item.ruleType,
      value: item.value,
      minDaysBefore: item.minDaysBefore,
      maxDaysBefore: item.maxDaysBefore,
      minOccupancyPct: item.minOccupancyPct,
      maxOccupancyPct: item.maxOccupancyPct,
      effectiveFrom: item.effectiveFrom ? item.effectiveFrom.split('T')[0] : '',
      priority: item.priority || 0
    });
    setIsEditModalOpen(true);
  };

  const openEditSurchargeModal = (item: any) => {
    setFormErrors([]);
    setEditId(item.id);
    setSurchargeFormData({
      name: item.name,
      code: item.code,
      type: item.type,
      value: item.value,
      description: item.description || ''
    });
    setIsEditModalOpen(true);
  };

  const openEditSeasonalModal = (item: any) => {
    setFormErrors([]);
    setEditId(item.id);
    setSeasonalFormData({
      name: item.name,
      routeId: item.routeId || '',
      vehicleTypeId: item.vehicleTypeId || '',
      type: item.type,
      value: item.value,
      startDate: item.startDate,
      endDate: item.endDate
    });
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFormErrors([]);
    try {
      if (activeTab === 'base') {
        await adminPriceService.updateBasePrice(editId, {
          price: Number(baseFormData.price),
          effectiveFrom: baseFormData.effectiveFrom,
          effectiveTo: (baseFormData as any).effectiveTo || undefined,
          currency: baseFormData.currency
        });
        success('Cập nhật giá cơ bản thành công');
        fetchBasePrices(true);
        setIsEditModalOpen(false);
      } else if (activeTab === 'rules') {
        await adminPriceService.updatePricingRule(editId, {
          name: ruleFormData.name,
          eventType: ruleFormData.eventType,
          ruleType: ruleFormData.ruleType,
          value: Number(ruleFormData.value),
          minDaysBefore: ruleFormData.minDaysBefore ? Number(ruleFormData.minDaysBefore) : undefined,
          maxDaysBefore: ruleFormData.maxDaysBefore ? Number(ruleFormData.maxDaysBefore) : undefined,
          minOccupancyPct: ruleFormData.minOccupancyPct ? Number(ruleFormData.minOccupancyPct) : undefined,
          maxOccupancyPct: ruleFormData.maxOccupancyPct ? Number(ruleFormData.maxOccupancyPct) : undefined,
          effectiveFrom: ruleFormData.effectiveFrom,
          priority: ruleFormData.priority ? Number(ruleFormData.priority) : 0
        });
        success('Cập nhật quy tắc giá thành công');
        fetchRules(true);
        setIsEditModalOpen(false);
      } else if (activeTab === 'surcharges') {
        await adminPriceService.updateSurcharge(editId, {
          name: surchargeFormData.name,
          type: surchargeFormData.type,
          value: Number(surchargeFormData.value),
          description: surchargeFormData.description || undefined
        });
        success('Cập nhật phụ phí thành công');
        fetchSurcharges(true);
        setIsEditModalOpen(false);
      } else if (activeTab === 'seasonal') {
        await adminPriceService.updateSeasonalPrice(editId, {
          ...seasonalFormData,
          value: Number(seasonalFormData.value),
          routeId: seasonalFormData.routeId || undefined,
          vehicleTypeId: seasonalFormData.vehicleTypeId || undefined
        });
        success('Cập nhật giá theo mùa thành công');
        fetchSeasonal(true);
        setIsEditModalOpen(false);
      }
    } catch (err: any) {
      const errs = extractErrors(err);
      setFormErrors(errs);
      showError(errs[0]);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteBasePrice = async (id: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa giá cơ bản này?')) return;
    try {
      await adminPriceService.deleteBasePrice(id);
      success('Xóa giá cơ bản thành công');
      fetchBasePrices(true);
    } catch (err: any) {
      showError('Không thể xóa: ' + (extractErrors(err)[0]));
    }
  };

  const handleDeleteRule = async (id: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa quy tắc giá này?')) return;
    try {
      await adminPriceService.deletePricingRule(id);
      success('Xóa quy tắc giá thành công');
      fetchRules(true);
    } catch (err: any) {
      showError('Không thể xóa: ' + (extractErrors(err)[0]));
    }
  };

  const handleDeleteSurcharge = async (id: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa phụ phí này?')) return;
    try {
      await adminPriceService.deleteSurcharge(id);
      success('Xóa phụ phí thành công');
      fetchSurcharges(true);
    } catch (err: any) {
      showError('Không thể xóa: ' + (extractErrors(err)[0]));
    }
  };

  const handleDeleteSeasonal = async (id: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa giá theo mùa này?')) return;
    try {
      await adminPriceService.deleteSeasonalPrice(id);
      success('Xóa giá theo mùa thành công');
      fetchSeasonal(true);
    } catch (err: any) {
      showError('Không thể xóa: ' + (extractErrors(err)[0]));
    }
  };

  const getRouteName = (id: string) => {
    if (!id) return 'N/A';
    const route = routes.find(r => r.id === id);
    return route ? (route.name || `${route.originCityName} - ${route.destinationCityName}`) : `${id.substring(0,8)}...`;
  };

  const getVehicleTypeName = (id: string) => {
    if (!id) return 'N/A';
    const vtype = vehicleTypes.find(v => v.id === id);
    return vtype ? (vtype.name || vtype.code) : `${id.substring(0,8)}...`;
  };

  const formatDate = (d: string | null | undefined) => {
    if (!d) return 'N/A';
    try { return new Date(d).toLocaleDateString('vi-VN'); } catch { return d; }
  };

  return {
    activeTab,
    setActiveTab,
    loading,
    submitting,
    formErrors,
    setFormErrors,
    isAddModalOpen,
    setIsAddModalOpen,
    isEditModalOpen,
    setIsEditModalOpen,
    baseFormData,
    setBaseFormData,
    ruleFormData,
    setRuleFormData,
    surchargeFormData,
    setSurchargeFormData,
    seasonalFormData,
    setSeasonalFormData,
    basePrices,
    rules,
    surcharges,
    seasonal,
    routes,
    vehicleTypes,
    handleAdd,
    handleEditSubmit,
    openEditBaseModal,
    openEditRuleModal,
    openEditSurchargeModal,
    openEditSeasonalModal,
    handleDeleteBasePrice,
    handleDeleteRule,
    handleDeleteSurcharge,
    handleDeleteSeasonal,
    getRouteName,
    getVehicleTypeName,
    formatDate
  };
};
