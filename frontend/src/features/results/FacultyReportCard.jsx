import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '@/api/axiosInstance';
import { Search, Award, BookOpen, TrendingUp, ArrowLeft } from 'lucide-react';

const FacultyReportCard = () => {
    const navigate = useNavigate();
    const [studentId, setStudentId] = useState('');
    const [report, setReport] = useState(null);
    const [studentInfo, setStudentInfo] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSearch = async () => {
        if (!studentId) return;

        setLoading(true);
        setError(null);
        setReport(null);

        try {
            // Fetch student profile to get basic info
            const profileRes = await api.get(`/faculty/student/${studentId}/profile`);
            setStudentInfo(profileRes.data);

            // Fetch report card
            const reportRes = await api.get(`/faculty/report-card/${studentId}`);
            setReport(reportRes.data);
        } catch (err) {
            setError(err.response?.data || 'Failed to fetch report card. You may not have permission to view this student.');
            setReport(null);
            setStudentInfo(null);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto pb-10">
            <button
                onClick={() => navigate('/faculty/dashboard')}
                className="mb-6 flex items-center text-gray-600 hover:text-blue-600"
            >
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
            </button>

            <div className="flex items-center gap-3 mb-8">
                <Award className="w-8 h-8 text-blue-600" />
                <h1 className="text-3xl font-bold text-gray-900">Student Report Card</h1>
            </div>

            {/* Search Section */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm mb-8">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Enter Student ID
                </label>
                <div className="flex gap-3">
                    <input
                        type="number"
                        value={studentId}
                        onChange={(e) => setStudentId(e.target.value)}
                        placeholder="e.g., 1"
                        className="flex-1 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    />
                    <button
                        onClick={handleSearch}
                        disabled={loading || !studentId}
                        className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                    >
                        <Search className="w-5 h-5" />
                        {loading ? 'Loading...' : 'Search'}
                    </button>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-6">
                    {error}
                </div>
            )}

            {/* Student Info */}
            {studentInfo && (
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-xl border border-gray-200 mb-6">
                    <h2 className="text-xl font-bold text-gray-900">
                        {studentInfo.firstName} {studentInfo.lastName}
                    </h2>
                    <p className="text-gray-600">PRN: {studentInfo.prn} | Year: {studentInfo.academicYear}</p>
                </div>
            )}

            {/* Report Card */}
            {report && report.length > 0 && (
                <div className="space-y-6">
                    {report.map((subject, idx) => (
                        <div key={idx} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                            {/* Subject Header */}
                            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 border-b border-gray-200">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h2 className="text-2xl font-bold text-gray-900">{subject.subjectName}</h2>
                                        <p className="text-sm text-gray-600 mt-1">Code: {subject.subjectCode}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm text-gray-600 uppercase font-semibold">Total Score</p>
                                        <p className="text-4xl font-bold text-blue-600">{subject.total || 0}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Marks Breakdown */}
                            <div className="p-6">
                                <div className="grid md:grid-cols-2 gap-6">
                                    {/* Internal Assessment */}
                                    <div className="bg-blue-50 rounded-lg p-5 border border-blue-100">
                                        <div className="flex items-center gap-2 mb-4">
                                            <BookOpen className="w-5 h-5 text-blue-600" />
                                            <h3 className="text-lg font-bold text-blue-900">Internal Assessment (ISE/ICA)</h3>
                                        </div>
                                        <div className="space-y-3">
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm text-blue-700">Best of 2 Unit Tests</span>
                                                <span className="font-bold text-blue-900">{subject.utBestOf2 || 0}</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm text-blue-700">ICA (Assignments + Jury)</span>
                                                <span className="font-bold text-blue-900">{subject.ica || 0}</span>
                                            </div>
                                            <div className="pt-3 border-t-2 border-blue-200 flex justify-between items-center">
                                                <span className="font-semibold text-blue-800">Total Internal</span>
                                                <span className="text-xl font-bold text-blue-900">{subject.internalMarks || 0}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* External Assessment */}
                                    <div className="bg-purple-50 rounded-lg p-5 border border-purple-100">
                                        <div className="flex items-center gap-2 mb-4">
                                            <TrendingUp className="w-5 h-5 text-purple-600" />
                                            <h3 className="text-lg font-bold text-purple-900">External Assessment (ESE)</h3>
                                        </div>
                                        <div className="space-y-3">
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm text-purple-700">Theory</span>
                                                <span className="font-bold text-purple-900">{subject.theoryMarks || 0}</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm text-purple-700">Practical</span>
                                                <span className="font-bold text-purple-900">{subject.practicalMarks || 0}</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm text-purple-700">Sessional/Studio</span>
                                                <span className="font-bold text-purple-900">{subject.sessionalMarks || 0}</span>
                                            </div>
                                            <div className="pt-3 border-t-2 border-purple-200 flex justify-between items-center">
                                                <span className="font-semibold text-purple-800">Total External</span>
                                                <span className="text-xl font-bold text-purple-900">{subject.externalMarks || 0}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {report && report.length === 0 && (
                <div className="bg-white p-8 rounded-xl border border-gray-200 text-center text-gray-500">
                    No assessment data available for this student.
                </div>
            )}
        </div>
    );
};

export default FacultyReportCard;

