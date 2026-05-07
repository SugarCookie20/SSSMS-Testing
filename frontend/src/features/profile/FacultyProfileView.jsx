import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '@/api/axiosInstance';
import { getProfilePhotoUrl } from '@/shared/utils/profilePhotoUrl';

import { User, Mail, BookOpen, Calendar, Phone, ArrowLeft, GraduationCap, ShieldCheck, FileText, Award, Edit2, Save, X, CheckCircle, AlertCircle, KeyRound } from 'lucide-react';
import { useAuth } from '@/features/auth/AuthContext';
import ConfirmDialog from '@/shared/components/ConfirmDialog';

const FacultyProfileView = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({});
    const [saving, setSaving] = useState(false);
    const [status, setStatus] = useState(null);
    const [resettingPassword, setResettingPassword] = useState(false);
    const [confirmDlg, setConfirmDlg] = useState(null);

    const isAdmin = user?.role === 'ROLE_ADMIN';

    const fetchProfile = async () => {
        try {
            const response = await api.get(`/admin/faculty/${id}/profile`);
            setProfile(response.data);
        } catch {
            console.error("Failed to load profile");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const handlePhotoUpload = async (e) => {
        const file = e.target.files[0];
        if (!file || !isAdmin) return;

        const formData = new FormData();
        formData.append('file', file);

        try {
            await api.post(`/admin/faculty/${id}/photo`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setStatus({ type: 'success', msg: 'Profile photo updated successfully!' });
            fetchProfile();
        } catch (error) {
            console.error("Failed to upload photo", error);
            setStatus({ type: 'error', msg: 'Failed to upload profile photo.' });
        }
    };

    const startEdit = () => {
        setEditForm({
            firstName: profile.firstName || '',
            middleName: profile.middleName || '',
            lastName: profile.lastName || '',
            phoneNumber: profile.phoneNumber || '',
            dob: profile.dob || '',
            designation: profile.designation || '',
            department: profile.department || '',
            qualification: profile.qualification || '',
            joiningDate: profile.joiningDate || '',
            coaRegistrationNo: profile.coaRegistrationNo || '',
            coaValidFrom: profile.coaValidFrom || '',
            coaValidTill: profile.coaValidTill || '',
            aadharNo: profile.aadharNo || '',
            panCardNo: profile.panCardNo || ''
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

        if (!editForm.firstName || !/^[A-Za-z\s]{2,50}$/.test(editForm.firstName)) {
            setStatus({ type: 'error', msg: 'First name: letters only, 2-50 chars.' });
            setSaving(false);
            return;
        }
        if (!editForm.lastName || !/^[A-Za-z\s]{2,50}$/.test(editForm.lastName)) {
            setStatus({ type: 'error', msg: 'Last name: letters only, 2-50 chars.' });
            setSaving(false);
            return;
        }

        try {
            await api.put(`/admin/faculty/${id}/profile`, editForm);
            setStatus({ type: 'success', msg: 'Profile updated successfully!' });
            setIsEditing(false);
            fetchProfile();
        } catch (error) {
            setStatus({ type: 'error', msg: error.response?.data || 'Failed to update profile.' });
        } finally {
            setSaving(false);
        }
    };

    const resetPassword = async () => {
        setConfirmDlg({
            message: "Are you sure you want to reset this faculty member's password to default (LastName@DDMMYY)?",
            confirmLabel: 'Reset Password',
            onConfirm: async () => {
                setResettingPassword(true);
                setStatus(null);
                try {
                    await api.post(`/admin/faculty/${id}/reset-password`);
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

    if (loading) return <div className="p-8 text-gray-500">Loading Profile...</div>;
    if (!profile) return <div className="p-8 text-red-500">Profile not found.</div>;

    const inputClass = "w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500";
    const labelClass = "block text-xs font-semibold text-gray-400 uppercase mb-1";

    return (
        <div className="max-w-5xl mx-auto">
            <button onClick={() => navigate(-1)} className="mb-6 flex items-center text-gray-600 hover:text-blue-600">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back
            </button>

            <div className="mb-6 flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Faculty Profile</h1>
                    <p className="text-gray-600 mt-1">Viewing details for {profile.firstName} {profile.lastName}</p>
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
                        <button onClick={startEdit} className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors shadow-sm">
                            <Edit2 className="w-4 h-4" /> Edit Profile
                        </button>
                    </div>
                )}
                {isAdmin && isEditing && (
                    <div className="flex gap-2">
                        <button onClick={saveProfile} disabled={saving} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-sm disabled:opacity-50">
                            <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                        <button onClick={cancelEdit} className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors shadow-sm">
                            <X className="w-4 h-4" /> Cancel
                        </button>
                    </div>
                )}
            </div>

            {status && (
                <div className={`mb-6 p-4 rounded-lg flex items-center gap-2 ${status.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                    {status.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                    {status.msg}
                </div>
            )}

            <div className="bg-white rounded-xl border border-gray-200 p-8 mb-6 flex flex-col md:flex-row items-center md:items-start gap-6 shadow-sm">
                <div className="relative group">
                    <div className="w-24 h-24 bg-purple-100 rounded-full flex items-center justify-center shrink-0 border-4 border-white shadow-sm overflow-hidden text-purple-600">
                        {profile.profilePhoto ? (
                            <img src={getProfilePhotoUrl(profile.profilePhoto)} alt="Profile" className="w-full h-full object-cover" />

                        ) : (
                            <User className="w-12 h-12" />
                        )}
                    </div>
                    {/* Admin can upload photo */}
                    {isAdmin && (
                        <label className="absolute bottom-0 right-0 p-1.5 bg-purple-600 text-white rounded-full cursor-pointer hover:bg-purple-700 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
                            <ArrowLeft className="w-4 h-4 hidden" />
                            <Edit2 className="w-3.5 h-3.5" />
                            <input type="file" className="hidden" accept="image/*" onChange={handlePhotoUpload} />
                        </label>
                    )}
                </div>
                <div className="text-center md:text-left flex-1">
                    <h2 className="text-2xl font-bold text-gray-900">{profile.firstName} {profile.lastName}</h2>
                    <p className="text-gray-500 mb-4">{profile.designation} - {profile.department}</p>
                    <div className="flex justify-center md:justify-start gap-4 mt-2 text-sm text-gray-600">
                        <span className="flex items-center"><Mail className="w-4 h-4 mr-1" /> {profile.email}</span>
                        <span className="flex items-center"><Phone className="w-4 h-4 mr-1" /> {profile.phoneNumber || 'N/A'}</span>
                    </div>
                </div>
            </div>

            {isEditing ? (
                <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
                    <h3 className="text-lg font-bold mb-2 text-gray-900">Edit Faculty Details</h3>
                    <p className="text-sm text-purple-600 mb-6">Edit mode enabled - make changes and save</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                            <label className={labelClass}>First Name</label>
                            <input type="text" name="firstName" value={editForm.firstName} onChange={handleEditChange} className={inputClass} />
                        </div>
                        <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                            <label className={labelClass}>Middle Name</label>
                            <input type="text" name="middleName" value={editForm.middleName} onChange={handleEditChange} placeholder="(optional)" className={inputClass} />
                        </div>
                        <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                            <label className={labelClass}>Last Name</label>
                            <input type="text" name="lastName" value={editForm.lastName} onChange={handleEditChange} className={inputClass} />
                        </div>
                        <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                            <label className={labelClass}>Phone Number</label>
                            <input type="text" name="phoneNumber" value={editForm.phoneNumber} onChange={handleEditChange} placeholder="10-digit mobile" className={inputClass} />
                        </div>
                        <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                            <label className={labelClass}>Date of Birth</label>
                            <input type="date" name="dob" value={editForm.dob} onChange={handleEditChange} className={inputClass} />
                        </div>
                        <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                            <label className={labelClass}>Date of Joining</label>
                            <input type="date" name="joiningDate" value={editForm.joiningDate} onChange={handleEditChange} className={inputClass} />
                        </div>
                        <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                            <label className={labelClass}>Designation</label>
                            <input type="text" name="designation" value={editForm.designation} onChange={handleEditChange} className={inputClass} />
                        </div>
                        <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                            <label className={labelClass}>Department</label>
                            <input type="text" name="department" value={editForm.department} onChange={handleEditChange} className={inputClass} />
                        </div>
                        <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                            <label className={labelClass}>Qualification</label>
                            <input type="text" name="qualification" value={editForm.qualification} onChange={handleEditChange} className={inputClass} />
                        </div>
                        <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                            <label className={labelClass}>COA Registration No</label>
                            <input type="text" name="coaRegistrationNo" value={editForm.coaRegistrationNo} onChange={handleEditChange} className={inputClass} />
                        </div>
                        <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                            <label className={labelClass}>COA Valid From</label>
                            <input type="date" name="coaValidFrom" value={editForm.coaValidFrom} onChange={handleEditChange} className={inputClass} />
                        </div>
                        <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                            <label className={labelClass}>COA Valid Till</label>
                            <input type="date" name="coaValidTill" value={editForm.coaValidTill} onChange={handleEditChange} className={inputClass} />
                        </div>
                        <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                            <label className={labelClass}>Aadhar Number</label>
                            <input type="text" name="aadharNo" value={editForm.aadharNo} onChange={handleEditChange} placeholder="12-digit Aadhar" className={inputClass} />
                        </div>
                        <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                            <label className={labelClass}>PAN Card Number</label>
                            <input type="text" name="panCardNo" value={editForm.panCardNo} onChange={handleEditChange} placeholder="10-char PAN" className={inputClass} />
                        </div>
                    </div>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                            <h3 className="text-lg font-bold mb-4 flex items-center"><GraduationCap className="w-5 h-5 mr-2 text-purple-600" /> Qualification</h3>
                            <p className="text-gray-700">{profile.qualification || "Not Provided"}</p>
                            <h3 className="text-lg font-bold mt-6 mb-4 flex items-center"><Calendar className="w-5 h-5 mr-2 text-purple-600" /> Date of Birth</h3>
                            <p className="text-gray-700">{profile.dob ? new Date(profile.dob).toLocaleDateString() : "Not Provided"}</p>
                            <h3 className="text-lg font-bold mt-6 mb-4 flex items-center"><Calendar className="w-5 h-5 mr-2 text-purple-600" /> Date of Joining</h3>
                            <p className="text-gray-700">{profile.joiningDate ? new Date(profile.joiningDate).toLocaleDateString() : "Not Provided"}</p>
                        </div>
                        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                            <h3 className="text-lg font-bold mb-4 flex items-center"><BookOpen className="w-5 h-5 mr-2 text-blue-600" /> Current Teaching Load</h3>
                            {profile.subjects?.length === 0 ? (
                                <p className="text-gray-500">No subjects assigned.</p>
                            ) : (
                                <ul className="space-y-2">
                                    {profile.subjects?.map((sub, i) => (
                                        <li key={i} className="p-3 bg-gray-50 rounded-lg text-sm font-medium text-gray-700 border border-gray-100">{sub}</li>
                                    ))}
                                </ul>
                            )}
                        </div>
                        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                            <h3 className="text-lg font-bold mb-4 flex items-center"><ShieldCheck className="w-5 h-5 mr-2 text-purple-600" /> COA Registration</h3>
                            <div className="space-y-3">
                                <div>
                                    <p className="text-xs text-gray-400 uppercase tracking-wide">Registration No.</p>
                                    <p className="text-gray-700 font-medium">{profile.coaRegistrationNo || "Not Provided"}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-xs text-gray-400 uppercase tracking-wide">Valid From</p>
                                        <p className="text-gray-700">{profile.coaValidFrom ? new Date(profile.coaValidFrom).toLocaleDateString() : "—"}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-400 uppercase tracking-wide">Valid Till</p>
                                        <p className="text-gray-700">{profile.coaValidTill ? new Date(profile.coaValidTill).toLocaleDateString() : "—"}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                            <h3 className="text-lg font-bold mb-4 flex items-center"><FileText className="w-5 h-5 mr-2 text-purple-600" /> ID Documents</h3>
                            <div className="space-y-3">
                                <div>
                                    <p className="text-xs text-gray-400 uppercase tracking-wide">Aadhar No.</p>
                                    <p className="text-gray-700 font-mono">{profile.aadharNo || "Not Provided"}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400 uppercase tracking-wide">PAN Card No.</p>
                                    <p className="text-gray-700 font-mono">{profile.panCardNo || "Not Provided"}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    {profile.professionalDevelopment && profile.professionalDevelopment.length > 0 && (
                        <div className="mt-6 bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                            <h3 className="text-lg font-bold mb-4 flex items-center">
                                <Award className="w-5 h-5 mr-2 text-purple-600" /> Professional Development
                                <span className="ml-2 text-sm font-normal text-gray-400">({profile.professionalDevelopment.length})</span>
                            </h3>
                            <div className="space-y-2">
                                {profile.professionalDevelopment.slice(0, 5).map((pd, i) => (
                                    <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                                        <div className="flex items-center min-w-0">
                                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full mr-3 shrink-0 ${pd.type === 'WORKSHOP' ? 'bg-blue-100 text-blue-700' : pd.type === 'QIP' ? 'bg-purple-100 text-purple-700' : pd.type === 'FDP' ? 'bg-indigo-100 text-indigo-700' : pd.type === 'CONFERENCE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>{pd.type}</span>
                                            <span className="text-sm font-medium text-gray-800 truncate">{pd.title}</span>
                                            {pd.organization && <span className="text-xs text-gray-400 ml-2 shrink-0">• {pd.organization}</span>}
                                        </div>
                                        {pd.startDate && <span className="text-xs text-gray-400 shrink-0 ml-3">{new Date(pd.startDate).toLocaleDateString()}</span>}
                                    </div>
                                ))}
                                {profile.professionalDevelopment.length > 5 && (
                                    <p className="text-xs text-gray-400 text-center pt-1">+ {profile.professionalDevelopment.length - 5} more entries</p>
                                )}
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* Confirm Dialog */}
            <ConfirmDialog config={confirmDlg} onClose={() => setConfirmDlg(null)} />
        </div>
    );
};

export default FacultyProfileView;


