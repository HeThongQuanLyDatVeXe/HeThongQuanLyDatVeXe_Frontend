import { useState, useEffect } from 'react';
import { adminTripService } from '../../../services/trip-service/adminTripService';
import { routeService } from '../../../services/route-service/routeService';
import { vehicleService } from '../../../services/vehicle-service/vehicleService';
import { useToast } from '../../../contexts/ToastContext';
import type { TripTemplateResponse, CreateTripTemplateRequest, GenerateTripsRequest, UpdateTripTemplateRequest } from '../../../types/trip-service/Trip';
import type { RouteResponse } from '../../../types/route-service/response';
import type { VehicleTypeResponse, VehicleResponse } from '../../../types/vehicle-service/Vehicle';

export const DAY_NAMES: Record<number, string> = { 1: 'T2', 2: 'T3', 3: 'T4', 4: 'T5', 5: 'T6', 6: 'T7', 7: 'CN' };

export const useAdminTripTemplatesPage = () => {
    const { success, error: showError } = useToast();
    const [templates, setTemplates] = useState<TripTemplateResponse[]>([]);
    const [routes, setRoutes] = useState<RouteResponse[]>([]);
    const [vehicleTypes, setVehicleTypes] = useState<VehicleTypeResponse[]>([]);
    const [vehicles, setVehicles] = useState<VehicleResponse[]>([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [formErrors, setFormErrors] = useState<string[]>([]);
    
    // Modal Template
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState<TripTemplateResponse | null>(null);
    const [formData, setFormData] = useState<CreateTripTemplateRequest>({
        routeId: '',
        vehicleTypeId: '',
        departureTime: '08:00:00',
        durationMinutes: 120,
        daysOfWeek: [1,2,3,4,5,6,7],
        isActive: true,
        notes: ''
    });

    // Generate Trips Modal
    const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
    const [selectedTemplateId, setSelectedTemplateId] = useState('');
    const [generateErrors, setGenerateErrors] = useState<string[]>([]);
    const [generateData, setGenerateData] = useState<GenerateTripsRequest>({
        startDate: '',
        endDate: '',
        vehicleId: ''
    });

    useEffect(() => {
        fetchRoutes();
        fetchVehicleTypes();
        fetchVehicles();
        fetchTemplates();
    }, []);

    const fetchRoutes = async () => {
        try {
            const apiRes = await routeService.getRoutes({ page: 0, size: 100 });
            const res = apiRes.data.result || apiRes.data.data;
            if (res) setRoutes(res.content);
        } catch (err) {
            console.error('Failed to fetch routes');
        }
    };

    const fetchVehicleTypes = async () => {
        try {
            const res = await vehicleService.getVehicleTypes();
            const payload = res.data.result || res.data.data;
            if (payload && payload.content) {
                setVehicleTypes(payload.content);
            }
        } catch (err) {
            console.error('Failed to fetch vehicle types');
        }
    };

    const fetchVehicles = async () => {
        try {
            const res = await vehicleService.getAllVehicles({ size: 200 });
            const payload = res.data.result || res.data.data;
            if (payload && (payload as any).content) {
                setVehicles((payload as any).content);
            } else if (Array.isArray(payload)) {
                setVehicles(payload as VehicleResponse[]);
            } else {
                console.warn('Unexpected vehicles response format:', payload);
            }
        } catch (err: any) {
            console.error('Failed to fetch vehicles:', err?.response?.status, err?.message);
        }
    };

    const fetchTemplates = async () => {
        setLoading(true);
        try {
            const res = await adminTripService.getAllTripTemplates({ size: 50 });
            const payload = res.data.result || res.data.data;
            if (payload && payload.content) {
                setTemplates(payload.content);
            }
        } catch (err) {
            showError('Lỗi tải mẫu lịch trình');
        } finally {
            setLoading(false);
        }
    };

    const openModal = (template?: TripTemplateResponse) => {
        if (template) {
            setEditingTemplate(template);
            setFormData({
                routeId: template.routeId,
                vehicleTypeId: template.vehicleTypeId,
                departureTime: template.departureTime,
                durationMinutes: template.durationMinutes,
                daysOfWeek: template.daysOfWeek,
                isActive: template.isActive,
                notes: template.notes || '',
                validFrom: template.validFrom ? template.validFrom.split('T')[0] : '',
                validUntil: template.validUntil ? template.validUntil.split('T')[0] : ''
            });
        } else {
            setEditingTemplate(null);
            setFormData({
                routeId: routes.length > 0 ? routes[0].id : '',
                vehicleTypeId: vehicleTypes.length > 0 ? vehicleTypes[0].id : '',
                departureTime: '08:00:00',
                durationMinutes: 120,
                daysOfWeek: [1,2,3,4,5,6,7],
                isActive: true,
                notes: ''
            });
        }
        setIsModalOpen(true);
        setFormErrors([]);
    };

    const extractErrors = (err: any): string[] => {
        const d = err?.response?.data;
        if (!d) return [err?.message || 'Lỗi không xác định'];
        const errs: string[] = [];
        if (d.errors && typeof d.errors === 'object') Object.entries(d.errors).forEach(([f, m]) => errs.push(`${f}: ${m}`));
        if (d.message) errs.push(d.message);
        return errs.length > 0 ? errs : ['Có lỗi xảy ra'];
    };

    const handleSaveTemplate = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setFormErrors([]);
        try {
            const departureTime = formData.departureTime.length === 5 ? formData.departureTime + ':00' : formData.departureTime;
            const validFrom = formData.validFrom ? new Date(formData.validFrom + 'T00:00:00').toISOString() : undefined;
            const validUntil = formData.validUntil ? new Date(formData.validUntil + 'T23:59:59').toISOString() : undefined;
            
            if (editingTemplate) {
                // Backend UpdateTripTemplateRequest does NOT have routeId
                const updatePayload: UpdateTripTemplateRequest = {
                    vehicleTypeId: formData.vehicleTypeId,
                    departureTime,
                    durationMinutes: formData.durationMinutes,
                    daysOfWeek: formData.daysOfWeek,
                    isActive: formData.isActive,
                    validFrom,
                    validUntil,
                    notes: formData.notes || undefined,
                };
                await adminTripService.updateTripTemplate(editingTemplate.id, updatePayload);
            } else {
                const createPayload: CreateTripTemplateRequest = {
                    ...formData,
                    departureTime,
                    validFrom,
                    validUntil,
                    notes: formData.notes || undefined,
                };
                await adminTripService.createTripTemplate(createPayload);
            }
            success(editingTemplate ? 'Cập nhật mẫu thành công' : 'Thêm mẫu thành công');
            setIsModalOpen(false);
            fetchTemplates();
        } catch (err: any) {
            const errs = extractErrors(err);
            setFormErrors(errs);
            showError(errs[0]);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Xóa mẫu lịch trình này?')) return;
        try {
            await adminTripService.deleteTripTemplate(id);
            success('Đã xóa mẫu lịch trình');
            fetchTemplates();
        } catch (err: any) {
            showError(extractErrors(err)[0]);
        }
    };

    const handleGenerateTrips = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setGenerateErrors([]);
        try {
            if (!generateData.vehicleId) {
                showError('Vui lòng chọn xe để chạy lịch trình này');
                setSubmitting(false);
                return;
            }
            if (generateData.endDate < generateData.startDate) {
                setGenerateErrors(['Ngày kết thúc phải sau ngày bắt đầu']);
                setSubmitting(false);
                return;
            }
            const payload: GenerateTripsRequest = {
                startDate: generateData.startDate,
                endDate: generateData.endDate,
                vehicleId: generateData.vehicleId || undefined
            };
            const res = await adminTripService.generateTripsFromTemplate(selectedTemplateId, payload);
            const generated = res.data.result || res.data.data || [];
            success(`Đã tạo ${Array.isArray(generated) ? generated.length : 0} chuyến thành công`);
            setIsGenerateModalOpen(false);
            fetchTemplates();
        } catch (err: any) {
            const errs = extractErrors(err);
            setGenerateErrors(errs);
            showError(errs[0]);
        } finally {
            setSubmitting(false);
        }
    };

    const getRouteName = (routeId: string) => {
        const route = routes.find(r => r.id === routeId);
        return route ? `${route.originCityName} - ${route.destinationCityName}` : routeId.substring(0, 8) + '...';
    };

    const getVehicleTypeName = (vehicleTypeId: string) => {
        const vt = vehicleTypes.find(v => v.id === vehicleTypeId);
        return vt ? (vt.name || vt.code) : vehicleTypeId.substring(0, 8) + '...';
    };

    return {
        templates,
        routes,
        vehicleTypes,
        vehicles,
        loading,
        submitting,
        formErrors,
        isModalOpen,
        setIsModalOpen,
        editingTemplate,
        formData,
        setFormData,
        isGenerateModalOpen,
        setIsGenerateModalOpen,
        selectedTemplateId,
        setSelectedTemplateId,
        generateErrors,
        setGenerateErrors,
        generateData,
        setGenerateData,
        openModal,
        handleSaveTemplate,
        handleDelete,
        handleGenerateTrips,
        getRouteName,
        getVehicleTypeName
    };
};
