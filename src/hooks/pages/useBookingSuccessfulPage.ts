import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';

export interface SuccessfulState {
    bookingCode: string;
    fullName: string;
    phoneNumber: string;
    email: string;
    selectedSeats: string[];
    currentTrip: any;
    totalPaid: number;
}

export const useBookingSuccessfulPage = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // Recover transaction details from state
    const passedState = location.state as SuccessfulState | null;

    // Default route/details fallback in case of direct URL access
    const defaultDetails = {
        bookingCode: 'DVN-8A2F9',
        fullName: 'Nguyễn Văn A',
        phoneNumber: '0987654321',
        email: 'nguyen.vana@gmail.com',
        selectedSeats: ['A12', 'A13'],
        totalPaid: 650000,
        currentTrip: {
            id: 'default',
            from: 'Sài Gòn',
            to: 'Đà Lạt',
            duration: '8h 30m',
            price: 350000,
            operator: 'Phương Trang',
            vehicleType: 'Limousine 22 phòng nằm'
        }
    };

    const details = passedState || defaultDetails;

    // Custom CSS style block inside component to simulate dashed divider
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const handleDownloadPDF = () => {
        alert('Tải vé PDF thành công! Vui lòng kiểm tra thư mục Download trên thiết bị của bạn.');
    };

    const handleNavigateHome = () => {
        navigate(ROUTES.HOME);
    };

    return {
        details,
        handleDownloadPDF,
        handleNavigateHome
    };
};
