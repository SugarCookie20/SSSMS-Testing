import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { BASE_URL } from '@/api/axiosInstance';
import { Download, ArrowLeft } from 'lucide-react';
import FileViewer from '@/shared/components/FileViewer';

const StudentExamSchedule = () => {
    const navigate = useNavigate();
    const [fileInfo, setFileInfo] = useState(null); // { url, fileName }

    useEffect(() => {
        const fetch = async () => {
            try {
                const res = await api.get('/exams/student/me');
                if (res.data.exists) {
                    setFileInfo({ url: `${BASE_URL}/exams/view/${res.data.fileName}`, fileName: res.data.fileName });
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
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Exam Schedule</h1>
                {fileInfo && (
                    <a href={fileInfo.url} download className="bg-blue-50 text-blue-600 px-4 py-2 rounded-lg flex items-center hover:bg-blue-100">
                        <Download className="w-4 h-4 mr-2" /> Download
                    </a>
                )}
            </div>

            {fileInfo ? (
                <div className="w-full h-full bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                    <FileViewer url={fileInfo.url} fileName={fileInfo.fileName} title="Exam Schedule" className="h-full" />
                </div>
            ) : (
                <div className="p-10 text-center text-gray-500 bg-white border rounded-xl">
                    No exam schedule announced yet.
                </div>
            )}
        </div>
    );
};
export default StudentExamSchedule;