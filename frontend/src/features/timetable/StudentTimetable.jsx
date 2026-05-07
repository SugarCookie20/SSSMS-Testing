import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { BASE_URL } from '@/api/axiosInstance';
import { ArrowLeft } from 'lucide-react';
import FileViewer from '@/shared/components/FileViewer';

const StudentTimetable = () => {
    const navigate = useNavigate();
    const [fileInfo, setFileInfo] = useState(null); // { url, fileName }

    useEffect(() => {
        const fetch = async () => {
            try {
                const response = await api.get('/schedules/student/timetables');
                if (response.data && response.data.length > 0) {
                    setFileInfo({ url: `${BASE_URL}/timetable/view/${response.data[0].fileName}`, fileName: response.data[0].fileName });
                }
            } catch (e) { }
        };
        fetch();
    }, []);

    return (
        <div className="max-w-6xl mx-auto h-[calc(100vh-100px)]">
            <button onClick={() => navigate('/student/dashboard')} className="mb-4 flex items-center text-gray-600 hover:text-blue-600 transition-colors">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
            </button>
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Class Timetable</h1>

            {fileInfo ? (
                <div className="w-full h-full bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                    <FileViewer url={fileInfo.url} fileName={fileInfo.fileName} title="Timetable" className="h-full" />
                </div>
            ) : (
                <div className="p-10 text-center text-gray-500 bg-white border rounded-xl">
                    No timetable uploaded for your class yet.
                </div>
            )}
        </div>
    );
};
export default StudentTimetable;