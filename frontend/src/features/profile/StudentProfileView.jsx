import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '@/api/axiosInstance';
import { getProfilePhotoUrl } from '@/shared/utils/profilePhotoUrl';

import { User, Mail, Calendar, Book, TrendingUp, Clock, ArrowLeft, Phone, MapPin, ShieldCheck, Edit2, Save, X, CheckCircle, AlertCircle, KeyRound } from 'lucide-react';
import { useAuth } from '@/features/auth/AuthContext';
import ConfirmDialog from '@/shared/components/ConfirmDialog';

const StudentProfileView = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);

    // Edit state (Admin only)
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({});
    const [saving, setSaving] = useState(false);
    const [status, setStatus] = useState(null);
    const [resettingPassword, setResettingPassword] = useState(false);
    const [confirmDlg, setConfirmDlg] = useState(null);

    const isAdmin = user.role === 'ROLE_ADMIN';

    const fetchUrl = isAdmin
        ? `/admin/student/${id}/profile`
        : `/faculty/student/${id}/profile`;

    const fetchCoursesUrl = isAdmin
        ? `/admin/student/${id}/attendance`
        : `/faculty/student/${id}/attendance`;

    const fetchProfile = async () => {
        try {
            const response = await api.get(fetchUrl);
            setProfile(response.data);
        } catch {
            console.error("Failed to load profile");
        } finally {
            setLoading(false);
        }
    };

    const fetchCourses = async () => {
        try {
            const res = await api.get(fetchCoursesUrl);
            setCourses(res.data);
        } catch {
            console.error("Failed to load courses");
        }
    };

    useEffect(() => {
        fetchProfile();
        fetchCourses();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id, fetchUrl, fetchCoursesUrl]);

    // Edit functions (Admin only)
    const startEdit = () => {
        setEditForm({
            firstName: profile.firstName || '',
            middleName: profile.middleName || '',
            lastName: profile.lastName || '',
            phoneNumber: profile.phoneNumber || '',
            parentPhoneNumber: profile.parentPhoneNumber || '',
            address: profile.address || '',
            dob: profile.dob || '',
            coaEnrollmentNo: profile.coaEnrollmentNo || '',
            grNo: profile.grNo || '',
            aadharNo: profile.aadharNo || '',
            abcId: profile.abcId || '',
            academicYear: profile.currentYear || 'FIRST_YEAR',
            admissionCategory: profile.admissionCategory || 'CAP_ROUND_1',
            fathersName: profile.fathersName || '',
            mothersName: profile.mothersName || '',
            gender: profile.gender || '',
            religion: profile.religion || '',
            caste: profile.caste || ''
        });
        setIsEditing(true);
        setStatus(null);
    };

    const cancelEdit = () => {
        setIsEditing(false);
        setEditForm({});
        setStatus(null);
    };

    const handleEditChange = (e) => {
        const { name, value } = e.target;
        setEditForm(prev => ({ ...prev, [name]: value }));
    };

    const saveProfile = async () => {
        setSaving(true);
        setStatus(null);

        // Basic validation
        if (!editForm.firstName || !/^[A-Za-z\s]{2,50}$/.test(editForm.firstName)) {
            setStatus({ type: 'error', msg: 'First name: letters only, 2–50 chars.' });
            setSaving(false);
            return;
        }
        if (!editForm.lastName || !/^[A-Za-z\s]{2,50}$/.test(editForm.lastName)) {
            setStatus({ type: 'error', msg: 'Last name: letters only, 2–50 chars.' });
            setSaving(false);
            return;
        }
        if (editForm.phoneNumber && !/^\d{10}$/.test(editForm.phoneNumber)) {
            setStatus({ type: 'error', msg: 'Phone number must be 10 digits.' });
            setSaving(false);
            return;
        }
        if (editForm.aadharNo && !/^\d{12}$/.test(editForm.aadharNo)) {
            setStatus({ type: 'error', msg: 'Aadhar number must be 12 digits.' });
            setSaving(false);
            return;
        }

        try {
            await api.put(`/admin/student/${id}/profile`, editForm);
            setStatus({ type: 'success', msg: 'Profile updated successfully!' });
            setIsEditing(false);
            fetchProfile(); // Refresh profile data
        } catch (error) {
            setStatus({ type: 'error', msg: error.response?.data || 'Failed to update profile.' });
        } finally {
            setSaving(false);
        }
    };

    const resetPassword = async () => {
        setConfirmDlg({
            message: "Are you sure you want to reset this student's password to default (LastName@DDMMYY)?",
            confirmLabel: 'Reset Password',
            onConfirm: async () => {
                setResettingPassword(true);
                setStatus(null);
                try {
                    await api.post(`/admin/student/${id}/reset-password`);
                    setStatus({ type: 'success', msg: 'Password reset to default successfully!' });
                    setTimeout(() => setStatus(null), 3000);
                } catch (error) {
                    setStatus({ type: 'error', msg: error.response?.data || 'Failed to reset password.' });
                    setTimeout(() => setStatus(null), 5000);
                } finally {
                    setResettingPassword(false);
                }
            }
        });
    };

    // Calendar Modal State
    const [showCalendar, setShowCalendar] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [presentDates, setPresentDates] = useState([]);
    const [calendarLoading, setCalendarLoading] = useState(false);

    // Calendar display state
    const [currentMonth, setCurrentMonth] = useState(new Date());

    const openCalendar = async (course) => {
        setSelectedCourse(course);
        setShowCalendar(true);
        setCalendarLoading(true);
        setPresentDates([]);
        // Fetch dates from API
        const datesUrl = isAdmin
            ? `/admin/student/${id}/attendance-dates/${course.allocationId}`
            : `/faculty/student/${id}/attendance-dates/${course.allocationId}`;
        try {
            const res = await api.get(datesUrl);
            setPresentDates(res.data.map(d => new Date(d).toDateString()));
        } catch {
            console.error("Failed to fetch dates");
        } finally {
            setCalendarLoading(false);
        }
    };

    const handlePhotoUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        setStatus(null);
        try {
            await api.post(`/admin/student/${id}/photo`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setStatus({ type: 'success', msg: 'Profile photo updated successfully!' });
            fetchProfile();
        } catch (error) {
            setStatus({ type: 'error', msg: 'Failed to upload photo.' });
        }
    };

    if (loading) return <div className="p-8 text-gray-500">Loading Profile...</div>;
    if (!profile) return <div className="p-8 text-red-500">Profile not found.</div>;

    const stats = [
        { label: 'Current GPA', value: profile.cgpa || 'N/A', icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50' },
        { label: 'Attendance', value: `${profile.overallAttendance}%`, icon: Clock, color: 'text-blue-600', bg: 'bg-blue-50' },
    ];

    const DetailItem = ({ label, value, icon: Icon, mono }) => (
        <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
            <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">{label}</label>
            <div className={`flex items-center text-gray-900 font-medium ${mono ? 'font-mono' : ''}`}>
                {Icon && <Icon className="w-4 h-4 mr-2 text-gray-400" />}
                {value || "N/A"}
            </div>
        </div>
    );

    const EditableField = ({ label, name, value, type = 'text', options = null, placeholder = '' }) => (
        <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
            <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">{label}</label>
            {options ? (
                <select
                    name={name}
                    value={value ?? ''}
                    onChange={handleEditChange}
                    className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                    {options.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                </select>
            ) : (
                <input
                    type={type}
                    name={name}
                    value={value ?? ''}
                    onChange={handleEditChange}
                    placeholder={placeholder}
                    className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
            )}
        </div>
    );

    const academicYearOptions = [
        { value: 'FIRST_YEAR', label: 'First Year' },
        { value: 'SECOND_YEAR', label: 'Second Year' },
        { value: 'THIRD_YEAR', label: 'Third Year' },
        { value: 'FOURTH_YEAR', label: 'Fourth Year' },
        { value: 'FIFTH_YEAR', label: 'Fifth Year' }
    ];

    const admissionCategoryOptions = [
        { value: 'CAP_ROUND_1', label: 'CAP Round 1' },
        { value: 'CAP_ROUND_2', label: 'CAP Round 2' },
        { value: 'CAP_ROUND_3', label: 'CAP Round 3' },
        { value: 'VACANCY_AGAINST_CAP', label: 'Vacancy Against CAP' },
        { value: 'INSTITUTE_LEVEL', label: 'Institute Level' }
    ];

    const bloodGroupOptions = [
        { value: '', label: 'Select Blood Group' },
        { value: 'A+', label: 'A+' },
        { value: 'A-', label: 'A-' },
        { value: 'B+', label: 'B+' },
        { value: 'B-', label: 'B-' },
        { value: 'AB+', label: 'AB+' },
        { value: 'AB-', label: 'AB-' },
        { value: 'O+', label: 'O+' },
        { value: 'O-', label: 'O-' }
    ];

    const genderOptions = [
        { value: '', label: 'Select Gender' },
        { value: 'Male', label: 'Male' },
        { value: 'Female', label: 'Female' },
        { value: 'Other', label: 'Other' }
    ];

    return (
        <div className="max-w-5xl mx-auto">
            <button onClick={() => navigate(-1)} className="mb-6 flex items-center text-gray-600 hover:text-blue-600 transition-colors">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back
            </button>

            <div className="mb-8 flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Student Profile View</h1>
                    <p className="text-gray-600 mt-1">Viewing academic details for {profile.firstName}.</p>
                </div>
                {isAdmin && !isEditing && (
                    <div className="flex gap-2">
                        <button
                            onClick={resetPassword}
                            disabled={resettingPassword}
                            className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors shadow-sm disabled:opacity-50"
                        >
                            <KeyRound className="w-4 h-4" /> {resettingPassword ? 'Resetting...' : 'Reset Password'}
                        </button>
                        <button
                            onClick={startEdit}
                            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
                        >
                            <Edit2 className="w-4 h-4" /> Edit Profile
                        </button>
                    </div>
                )}
                {isAdmin && isEditing && (
                    <div className="flex gap-2">
                        <button
                            onClick={saveProfile}
                            disabled={saving}
                            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-sm disabled:opacity-50"
                        >
                            <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                        <button
                            onClick={cancelEdit}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors shadow-sm"
                        >
                            <X className="w-4 h-4" /> Cancel
                        </button>
                    </div>
                )}
            </div>

            {/* Status Message */}
            {status && (
                <div className={`mb-6 p-4 rounded-lg flex items-center gap-2 ${status.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
                    }`}>
                    {status.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                    {status.msg}
                </div>
            )}

            {/* Hero */}
            <div className="bg-white rounded-xl border border-gray-200 p-8 mb-6 flex flex-col md:flex-row items-center md:items-start gap-6 shadow-sm">
                <div className="relative group">
                    <div className="w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 shrink-0 border-4 border-white shadow-sm overflow-hidden">
                         {profile.profilePhoto ? (
                            <img src={getProfilePhotoUrl(profile.profilePhoto)} alt="Profile" className="w-full h-full object-cover" />

                        ) : (
                            <User className="w-12 h-12" />
                        )}
                    </div>
                    {isAdmin && (
                        <label className="absolute bottom-0 right-0 p-1.5 bg-indigo-600 text-white rounded-full cursor-pointer hover:bg-indigo-700 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
                            <ArrowLeft className="w-4 h-4 hidden" />
                            <Edit2 className="w-3.5 h-3.5" />
                            <input type="file" className="hidden" accept="image/*" onChange={handlePhotoUpload} />
                        </label>
                    )}
                </div>
                <div className="text-center md:text-left flex-1">
                    <h2 className="text-2xl font-bold text-gray-900">{profile.firstName} {profile.middleName} {profile.lastName}</h2>
                    <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-3 text-sm text-gray-600">
                        <span className="flex items-center"><Mail className="w-4 h-4 mr-1" /> {profile.email}</span>
                        <span className="flex items-center"><Book className="w-4 h-4 mr-1" /> {profile.department}</span>
                        <span className="flex items-center"><Calendar className="w-4 h-4 mr-1" /> Year {profile.currentYear}</span>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {stats.map((stat, index) => (
                    <div key={index} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center">
                        <div className={`p-3 rounded-lg mr-4 ${stat.bg}`}>
                            <stat.icon className={`w-6 h-6 ${stat.color}`} />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
                            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Details */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                    <h3 className="text-lg font-bold text-gray-900">Personal & Academic Details</h3>
                    {isEditing && <p className="text-sm text-indigo-600 mt-1">Edit mode enabled - make changes and save</p>}
                </div>

                {isEditing ? (
                    <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <EditableField label="First Name" name="firstName" value={editForm.firstName} placeholder="First Name" />
                        <EditableField label="Middle Name" name="middleName" value={editForm.middleName} placeholder="Middle Name (optional)" />
                        <EditableField label="Last Name" name="lastName" value={editForm.lastName} placeholder="Last Name" />

                        <EditableField label="Date of Birth" name="dob" value={editForm.dob} type="date" />
                        <EditableField label="Blood Group" name="bloodGroup" value={editForm.bloodGroup} options={bloodGroupOptions} />
                        <EditableField label="Academic Year" name="academicYear" value={editForm.academicYear} options={academicYearOptions} />

                        <div className="bg-gray-100 p-3 rounded-lg border border-gray-200">
                            <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">PRN</label>
                            <div className="p-2 text-gray-500 font-mono">{profile.prn} (Read-only)</div>
                        </div>
                        <EditableField label="GR Number" name="grNo" value={editForm.grNo} placeholder="GR Number" />
                        <EditableField label="ABC / APAAR ID" name="abcId" value={editForm.abcId} placeholder="ABC ID" />

                        <EditableField label="COA Enrollment No" name="coaEnrollmentNo" value={editForm.coaEnrollmentNo} placeholder="COA Enrollment No" />
                        <EditableField label="Aadhar Number" name="aadharNo" value={editForm.aadharNo} placeholder="12-digit Aadhar" />
                        <EditableField label="Admission Category" name="admissionCategory" value={editForm.admissionCategory} options={admissionCategoryOptions} />

                        <EditableField label="Student Mobile" name="phoneNumber" value={editForm.phoneNumber} placeholder="10-digit mobile" />
                        <EditableField label="Parent Mobile" name="parentPhoneNumber" value={editForm.parentPhoneNumber} placeholder="10-digit mobile" />
                        <div className="md:col-span-3">
                            <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                                <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Permanent Address</label>
                                <textarea
                                    name="address"
                                    value={editForm.address || ''}
                                    onChange={handleEditChange}
                                    placeholder="Full address"
                                    rows={3}
                                    className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                />
                            </div>
                        </div>

                        {/* Extended Personal Details */}
                        <div className="md:col-span-3 mt-4 border-t border-gray-100 pt-4">
                            <h4 className="text-sm font-bold text-gray-700 mb-4">Extended Personal Details</h4>
                        </div>
                        <EditableField label="Father's Name" name="fathersName" value={editForm.fathersName} placeholder="Father's Full Name" />
                        <EditableField label="Mother's Name" name="mothersName" value={editForm.mothersName} placeholder="Mother's Full Name" />
                        <EditableField label="Gender" name="gender" value={editForm.gender} options={genderOptions} />
                        <EditableField label="Religion" name="religion" value={editForm.religion} placeholder="e.g. Hindu, Muslim, Christian" />
                        <EditableField label="Reservation Category (Caste)" name="caste" value={editForm.caste} placeholder="e.g. OPEN, OBC, SC, ST" />
                    </div>
                ) : (
                    <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <DetailItem label="Full Name" value={`${profile.firstName} ${profile.middleName || ''} ${profile.lastName}`} icon={User} />
                        <DetailItem label="Date of Birth" value={profile.dob} icon={Calendar} />
                        <DetailItem label="Blood Group" value={profile.bloodGroup} icon={User} />

                        <DetailItem label="PRN" value={profile.prn} mono />
                        <DetailItem label="GR Number" value={profile.grNo} mono />
                        <DetailItem label="ABC / APAAR ID" value={profile.abcId} mono />

                        <DetailItem label="COA Enrollment No" value={profile.coaEnrollmentNo} mono />
                        <DetailItem label="Aadhar Number" value={profile.aadharNo} mono />
                        <DetailItem label="Admission Category" value={profile.admissionCategory?.replace(/_/g, ' ')} icon={ShieldCheck} />

                        <DetailItem label="Student Mobile" value={profile.phoneNumber} icon={Phone} />
                        <DetailItem label="Parent Mobile" value={profile.parentPhoneNumber} icon={Phone} />
                        <div className="md:col-span-3">
                            <DetailItem label="Permanent Address" value={profile.address} icon={MapPin} />
                        </div>

                        {/* Extended Personal Details */}
                        <div className="md:col-span-3 mt-4 border-t border-gray-100 pt-4">
                            <h4 className="text-sm font-bold text-gray-700 mb-4">Extended Personal Details</h4>
                        </div>
                        <DetailItem label="Father's Name" value={profile.fathersName} icon={User} />
                        <DetailItem label="Mother's Name" value={profile.mothersName} icon={User} />
                        <DetailItem label="Gender" value={profile.gender} icon={User} />
                        <DetailItem label="Religion" value={profile.religion} />
                        <DetailItem label="Reservation Category (Caste)" value={profile.caste} />
                    </div>
                )}
            </div>

            {/* Current Courses */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-6">
                <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                    <h3 className="text-lg font-bold text-gray-900">Current Courses & Attendance</h3>
                </div>
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {courses.map((course, idx) => (
                        <div
                            key={idx}
                            onClick={() => openCalendar(course)}
                            className="bg-white border text-left border-gray-200 rounded-lg p-5 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all cursor-pointer group"
                        >
                            <h4 className="font-bold text-gray-900 group-hover:text-indigo-700 transition-colors">{course.subjectName}</h4>
                            <p className="text-xs text-gray-500 font-mono mt-1 mb-4">{course.subjectCode}</p>
                            
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-medium text-gray-700">Attendance</span>
                                <span className={`text-sm font-bold ${course.percentage >= 75 ? 'text-green-600' : 'text-red-600'}`}>
                                    {course.percentage.toFixed(1)}%
                                </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                    className={`h-2 rounded-full ${course.percentage >= 75 ? 'bg-green-500' : 'bg-red-500'}`}
                                    style={{ width: `${Math.min(100, Math.max(0, course.percentage))}%` }}
                                ></div>
                            </div>
                            <p className="text-xs text-gray-500 mt-2 text-right">
                                {course.attendedSessions} / {course.totalSessions} sessions
                            </p>
                        </div>
                    ))}
                    {courses.length === 0 && (
                        <div className="md:col-span-3 text-center text-gray-500 py-4">No current courses available.</div>
                    )}
                </div>
            </div>

            {/* Confirm Dialog */}
            <ConfirmDialog config={confirmDlg} onClose={() => setConfirmDlg(null)} />

            {/* Calendar Modal */}
            {showCalendar && selectedCourse && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden flex flex-col">
                        <div className="flex justify-between items-center p-4 border-b border-gray-100 bg-gray-50">
                            <div>
                                <h3 className="font-bold text-gray-900">{selectedCourse.subjectName}</h3>
                                <p className="text-xs text-gray-500">Attendance Calendar</p>
                            </div>
                            <button onClick={() => setShowCalendar(false)} className="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-200 transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        
                        <div className="p-5 overflow-auto aspect-square flex flex-col">
                            {/* Calendar Header */}
                            <div className="flex justify-between items-center mb-6">
                                <button 
                                    onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}
                                    className="p-1 rounded hover:bg-gray-100 text-gray-600"
                                >
                                    <ArrowLeft className="w-5 h-5" />
                                </button>
                                <h4 className="font-bold text-gray-800">
                                    {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
                                </h4>
                                <button 
                                    onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}
                                    className="p-1 rounded hover:bg-gray-100 text-gray-600 rotate-180"
                                >
                                    <ArrowLeft className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Calendar Grid */}
                            {calendarLoading ? (
                                <div className="flex-1 flex justify-center items-center text-gray-500">Loading Dates...</div>
                            ) : (
                                <div className="grid grid-cols-7 gap-1 flex-1">
                                    {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                                        <div key={day} className="text-center text-xs font-semibold text-gray-400 py-1">{day}</div>
                                    ))}
                                    
                                    {(() => {
                                        const year = currentMonth.getFullYear();
                                        const month = currentMonth.getMonth();
                                        const firstDay = new Date(year, month, 1).getDay();
                                        const daysInMonth = new Date(year, month + 1, 0).getDate();
                                        
                                        const blanks = Array.from({ length: firstDay }, (_, i) => (
                                            <div key={`blank-${i}`} className="p-1"></div>
                                        ));
                                        
                                        const days = Array.from({ length: daysInMonth }, (_, i) => {
                                            const d = i + 1;
                                            const dateObj = new Date(year, month, d);
                                            const dateString = dateObj.toDateString();
                                            const isPresent = presentDates.includes(dateString);
                                            
                                            return (
                                                <div key={`day-${d}`} className="p-1 flex items-center justify-center">
                                                    <div className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-medium ${
                                                        isPresent 
                                                        ? 'bg-green-100 text-green-700 border border-green-200' 
                                                        : 'text-gray-700 hover:bg-gray-100'
                                                    }`}>
                                                        {d}
                                                    </div>
                                                </div>
                                            );
                                        });
                                        
                                        return [...blanks, ...days];
                                    })()}
                                </div>
                            )}

                            <div className="mt-4 flex items-center justify-center gap-4 text-xs text-gray-500 border-t pt-4">
                                <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-green-100 border border-green-200"></div> Present</div>
                                <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-gray-100"></div> Absent / No Session</div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
export default StudentProfileView;