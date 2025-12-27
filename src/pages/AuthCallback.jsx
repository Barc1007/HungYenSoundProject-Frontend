"use client"

import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import LoadingSpinner from '../components/LoadingSpinner';

export default function AuthCallback() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { setUser } = useUser();
    const [error, setError] = useState(null);

    useEffect(() => {
        const handleCallback = async () => {
            const token = searchParams.get('token');
            const userDataEncoded = searchParams.get('user');
            const errorParam = searchParams.get('error');

            if (errorParam) {
                setError(getErrorMessage(errorParam));
                setTimeout(() => navigate('/signup'), 3000);
                return;
            }

            if (token && userDataEncoded) {
                try {
                    // Store token
                    localStorage.setItem('authToken', token);

                    // Parse and store user data
                    const userData = JSON.parse(decodeURIComponent(userDataEncoded));
                    localStorage.setItem('user', JSON.stringify(userData));

                    // Update context
                    setUser(userData);

                    // Redirect to home
                    navigate('/');
                } catch (error) {
                    console.error('Error processing OAuth callback:', error);
                    setError('Đã có lỗi xảy ra khi xử lý đăng nhập');
                    setTimeout(() => navigate('/signup'), 3000);
                }
            } else {
                setError('Thiếu thông tin xác thực');
                setTimeout(() => navigate('/signup'), 3000);
            }
        };

        handleCallback();
    }, [searchParams, navigate, setUser]);

    const getErrorMessage = (errorCode) => {
        switch (errorCode) {
            case 'google_auth_failed':
                return 'Đăng nhập Google thất bại. Vui lòng thử lại.';
            case 'token_generation_failed':
                return 'Không thể tạo phiên đăng nhập. Vui lòng thử lại.';
            default:
                return 'Đã có lỗi xảy ra. Vui lòng thử lại.';
        }
    };

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-900">
                <div className="text-center p-8">
                    <div className="text-red-500 text-xl mb-4">⚠️</div>
                    <p className="text-white mb-4">{error}</p>
                    <p className="text-slate-400">Đang chuyển hướng...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-900">
            <div className="text-center p-8">
                <LoadingSpinner />
                <p className="text-white mt-4">Đang xử lý đăng nhập...</p>
                <p className="text-slate-400 text-sm mt-2">Vui lòng chờ trong giây lát</p>
            </div>
        </div>
    );
}
