import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '@/api/axiosInstance';
import { BookOpen, ArrowRight, ArrowLeft } from 'lucide-react';

const FacultyResultsSubjects = () => {
    const [subjects, setSubjects] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        api.get('/faculty/my-subjects')
            .then(res => setSubjects(res.data))
            .catch(err => console.error(err));
    }, []);

    return (
        <div className="max-w-6xl mx-auto">
            <button onClick={() => navigate('/faculty/dashboard')} className="mb-6 flex items-center text-gray-600 hover:text-blue-600">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
            </button>

            <h1 className="text-2xl font-bold text-gray-900 mb-6">Select Subject for Grading</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {subjects.map((sub) => (
                    <div
                        key={sub.id}
                        onClick={() => navigate(`/faculty/grading/${sub.id}`, { state: { subjectName: sub.subjectName, className: sub.className } })}
                        className="bg-white p-6 rounded-xl border border-gray-200 hover:shadow-lg cursor-pointer transition-all group"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-purple-50 text-purple-600 rounded-lg group-hover:bg-purple-100">
                                <BookOpen className="w-6 h-6" />
                            </div>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-1">{sub.subjectName}</h3>
                        <p className="text-sm text-gray-500">{sub.subjectCode}</p>
                        <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center text-sm">
                            <span className="text-gray-600 font-medium">{sub.className} - {sub.division}</span>
                            <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-purple-600" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default FacultyResultsSubjects;