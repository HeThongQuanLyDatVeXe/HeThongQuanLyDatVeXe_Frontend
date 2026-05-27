import React from 'react';
import { Header } from '../components/layouts/Header';
import { Footer } from '../components/layouts/Footer';
import { useProfilePage, SIDEBAR_ITEMS } from '../hooks/pages/useProfilePage';
import type { SidebarSection } from '../hooks/pages/useProfilePage';

// Components
import { ProfileSidebar } from '../components/profile/ProfileSidebar';
import { ProfileHeaderCard } from '../components/profile/ProfileHeaderCard';
import { ProfileInfoForm } from '../components/profile/ProfileInfoForm';
import { ProfilePasswordForm } from '../components/profile/ProfilePasswordForm';
import { ProfileDeleteAccount } from '../components/profile/ProfileDeleteAccount';

export const ProfilePage: React.FC = () => {
    const {
        user,
        activeSection,
        setActiveSection,
        infoData,
        setInfoData,
        infoLoading,
        avatarUploading,
        infoMsg,
        pwData,
        setPwData,
        pwLoading,
        pwMsg,
        deleteLoading,
        deleteMsg,
        showConfirmDelete,
        setShowConfirmDelete,
        handleAvatarUpload,
        handleInfoSave,
        handlePwSave,
        handleLogout,
        handleDeleteAccount,
        avatarInitial,
        isAdmin
    } = useProfilePage();

    return (
        <div className="min-h-screen" style={{ backgroundColor: 'var(--color-background)' }}>
            <Header />

            <main className="max-w-[1200px] mx-auto px-6 pt-28 pb-20">
                <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-12 items-start">
                    {/* ── Sidebar ── */}
                    <ProfileSidebar
                        items={SIDEBAR_ITEMS}
                        activeSection={activeSection}
                        setActiveSection={setActiveSection}
                        onLogout={handleLogout}
                    />

                    {/* ── Main Panel ── */}
                    <section className="space-y-6">
                        {/* Profile header card */}
                        <ProfileHeaderCard 
                            user={user} 
                            avatarInitial={avatarInitial} 
                            isAdmin={isAdmin} 
                        />

                        {/* ── Content Card ── */}
                        <div
                            className="rounded-xl overflow-hidden"
                            style={{
                                backgroundColor: 'var(--color-surface-container-lowest)',
                                border: '1px solid var(--color-outline-variant)',
                                boxShadow: '0 8px 20px rgba(92,64,51,0.08)',
                            }}
                        >
                            {/* Tab strip */}
                            <div className="flex" style={{ borderBottom: '1px solid var(--color-outline-variant)' }}>
                                {([
                                    { key: 'info', label: 'Thông tin cá nhân' },
                                    { key: 'password', label: 'Đổi mật khẩu' },
                                ] as { key: SidebarSection; label: string }[]).map(({ key, label }) => (
                                    <button
                                        key={key}
                                        onClick={() => setActiveSection(key)}
                                        className="px-8 py-4 text-sm font-medium transition-all"
                                        style={
                                            activeSection === key
                                                ? {
                                                      color: 'var(--color-primary)',
                                                      fontWeight: 700,
                                                      borderBottom: '2px solid var(--color-primary)',
                                                  }
                                                : { color: 'var(--color-on-surface-variant)' }
                                        }
                                    >
                                        {label}
                                    </button>
                                ))}
                            </div>

                            <div className="p-8">
                                {/* ── Info Tab ── */}
                                {activeSection === 'info' && (
                                    <ProfileInfoForm
                                        user={user}
                                        infoMsg={infoMsg}
                                        infoData={infoData}
                                        setInfoData={setInfoData}
                                        infoLoading={infoLoading}
                                        avatarUploading={avatarUploading}
                                        handleInfoSave={handleInfoSave}
                                        handleAvatarUpload={handleAvatarUpload}
                                    />
                                )}

                                {/* ── Password Tab ── */}
                                {activeSection === 'password' && (
                                    <ProfilePasswordForm
                                        user={user}
                                        pwMsg={pwMsg}
                                        pwData={pwData}
                                        setPwData={setPwData}
                                        pwLoading={pwLoading}
                                        handlePwSave={handlePwSave}
                                    />
                                )}

                                {/* ── Booking History placeholder ── */}
                                {activeSection === 'history' && (
                                    <div className="flex flex-col items-center justify-center py-16 text-center">
                                        <span className="material-symbols-outlined text-6xl mb-4" style={{ color: 'var(--color-outline-variant)' }}>confirmation_number</span>
                                        <h2 className="text-xl font-semibold mb-2" style={{ fontFamily: 'Playfair Display, serif', color: 'var(--color-on-surface)' }}>Lịch sử đặt vé</h2>
                                        <p style={{ color: 'var(--color-on-surface-variant)' }}>Chưa có vé nào được đặt.</p>
                                    </div>
                                )}

                                {/* ── Promos placeholder ── */}
                                {activeSection === 'promos' && (
                                    <div className="flex flex-col items-center justify-center py-16 text-center">
                                        <span className="material-symbols-outlined text-6xl mb-4" style={{ color: 'var(--color-outline-variant)' }}>loyalty</span>
                                        <h2 className="text-xl font-semibold mb-2" style={{ fontFamily: 'Playfair Display, serif', color: 'var(--color-on-surface)' }}>Ưu đãi của tôi</h2>
                                        <p style={{ color: 'var(--color-on-surface-variant)' }}>Bạn chưa có ưu đãi nào.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* ── Delete Account Section ── */}
                        {activeSection === 'delete_account' && (
                            <ProfileDeleteAccount
                                deleteMsg={deleteMsg}
                                showConfirmDelete={showConfirmDelete}
                                setShowConfirmDelete={setShowConfirmDelete}
                                deleteLoading={deleteLoading}
                                handleDeleteAccount={handleDeleteAccount}
                            />
                        )}

                        {/* ── Brand illustration ── */}
                        <div className="relative h-44 rounded-xl overflow-hidden group">
                            <img
                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAGehyfz8kfI4n9EBOrG7CjKgY4heord2xR4obMC_MRE_4gPhwMTUPpmNjhomkj2XZQgvnWjvI9N0lqIWEJwtdnXD95-MRPZcO_lZYeMolH7dOKyILQZ_jFcxY44qkj4qu-wuO_YJVXdBir2D7S6h0hCQMJFHjmDOhmbiiZAsmyOlecxOev1Bv7nw7ygaLJHCJvL0x4pjkAd_M25mTSu3OolbAisiCh0ZJ9NX5mqLpKNbVN8DHG05nV4Iu7vydho2CTRhuCaIh5yiM"
                                alt="Vietnamese countryside at golden hour"
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 flex items-end p-8" style={{ background: 'linear-gradient(to top, rgba(161,59,0,0.75) 0%, transparent 100%)' }}>
                                <p className="text-white italic text-lg font-semibold" style={{ fontFamily: 'Playfair Display, serif' }}>"Hành trình trở về là hành trình tuyệt vời nhất."</p>
                            </div>
                        </div>
                    </section>
                </div>
            </main>

            <Footer />
        </div>
    );
};