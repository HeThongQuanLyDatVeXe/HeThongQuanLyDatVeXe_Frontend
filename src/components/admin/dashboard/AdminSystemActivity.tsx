import React from 'react';

interface ActivityItem {
    time: string;
    title: string;
    subtitle: string;
    color: string;
}

interface AdminSystemActivityProps {
    activities: ActivityItem[];
}

export const AdminSystemActivity: React.FC<AdminSystemActivityProps> = ({ activities }) => {
    return (
        <div
            className="bg-white p-8 rounded-3xl shadow-sm"
            style={{ border: '1px solid #E8D5C4' }}
        >
            <h4
                className="text-xl font-semibold mb-8"
                style={{ fontFamily: 'Playfair Display, serif', color: '#1A1410' }}
            >
                Nhật ký hoạt động
            </h4>
            <div className="relative space-y-7">
                {/* vertical line */}
                <div className="absolute left-4 top-0 bottom-0 w-px bg-stone-100" />
                {activities.map((item, i) => (
                    <div key={i} className="relative pl-12">
                        <div
                            className="absolute left-[13px] top-1.5 w-2.5 h-2.5 rounded-full ring-4"
                            style={{
                                backgroundColor: item.color,
                                boxShadow: `0 0 0 4px ${item.color}22`,
                            }}
                        />
                        <p className="text-xs text-stone-400 mb-0.5">{item.time}</p>
                        <p className="text-sm font-bold text-on-surface">{item.title}</p>
                        <p className="text-sm text-stone-500">{item.subtitle}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};
