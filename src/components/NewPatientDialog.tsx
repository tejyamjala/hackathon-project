import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { UserPlus } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { generateId } from '@/lib/utils';
import type { Patient } from '@/types';

interface NewPatientDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const departments = [
    'Cardiology', 'General Medicine', 'Orthopedics', 'Neurology',
    'Obstetrics', 'Pediatrics', 'Oncology', 'Pulmonology', 'ICU',
];

export function NewPatientDialog({ open, onOpenChange }: NewPatientDialogProps) {
    const { dispatch } = useApp();
    const [name, setName] = useState('');
    const [age, setAge] = useState('');
    const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Male');
    const [department, setDepartment] = useState('');
    const [bedNumber, setBedNumber] = useState('');
    const [diagnosis, setDiagnosis] = useState('');
    const [allergies, setAllergies] = useState('');
    const [contactNumber, setContactNumber] = useState('');
    const [emergencyContact, setEmergencyContact] = useState('');
    const [insurance, setInsurance] = useState('');
    const [status, setStatus] = useState<Patient['status']>('Active');

    const handleSubmit = () => {
        if (!name.trim() || !department || !diagnosis.trim()) return;

        const mrnNum = Math.floor(100000 + Math.random() * 900000);

        const newPatient: Patient = {
            id: generateId('p'),
            name: name.trim(),
            age: parseInt(age) || 0,
            gender,
            mrn: `MRN${new Date().getFullYear()}${mrnNum}`,
            admissionDate: new Date().toISOString(),
            department,
            bedNumber: bedNumber.trim() || `Ward-${String.fromCharCode(65 + Math.floor(Math.random() * 4))}-${Math.floor(100 + Math.random() * 400)}`,
            diagnosis: diagnosis.trim(),
            allergies: allergies.split(',').map(a => a.trim()).filter(Boolean),
            contactNumber: contactNumber.trim() || '+91 XXXXX XXXXX',
            emergencyContact: emergencyContact.trim() || '+91 XXXXX XXXXX',
            insurance: insurance.trim() || 'Not specified',
            status,
        };

        dispatch({ type: 'ADD_PATIENT', payload: newPatient });

        // Reset
        setName(''); setAge(''); setGender('Male'); setDepartment('');
        setBedNumber(''); setDiagnosis(''); setAllergies('');
        setContactNumber(''); setEmergencyContact(''); setInsurance('');
        setStatus('Active');
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl">
                        <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                            <UserPlus className="h-4 w-4 text-white" />
                        </div>
                        Admit New Patient
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-2">
                    {/* Name & Age */}
                    <div className="grid grid-cols-3 gap-3">
                        <div className="col-span-2 space-y-1.5">
                            <Label className="text-sm font-semibold">Full Name *</Label>
                            <Input placeholder="Patient name" value={name} onChange={e => setName(e.target.value)} />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-sm font-semibold">Age *</Label>
                            <Input type="number" placeholder="Age" value={age} onChange={e => setAge(e.target.value)} min={0} max={150} />
                        </div>
                    </div>

                    {/* Gender & Status */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <Label className="text-sm font-semibold">Gender</Label>
                            <Select value={gender} onValueChange={(v: 'Male' | 'Female' | 'Other') => setGender(v)}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Male">Male</SelectItem>
                                    <SelectItem value="Female">Female</SelectItem>
                                    <SelectItem value="Other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-sm font-semibold">Status</Label>
                            <Select value={status} onValueChange={(v: Patient['status']) => setStatus(v)}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Active">Active</SelectItem>
                                    <SelectItem value="Stable">Stable</SelectItem>
                                    <SelectItem value="Critical">Critical</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Department & Bed */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <Label className="text-sm font-semibold">Department *</Label>
                            <Select value={department} onValueChange={setDepartment}>
                                <SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger>
                                <SelectContent>
                                    {departments.map(d => (
                                        <SelectItem key={d} value={d}>{d}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-sm font-semibold">Bed Number</Label>
                            <Input placeholder="e.g. ICU-105" value={bedNumber} onChange={e => setBedNumber(e.target.value)} />
                        </div>
                    </div>

                    {/* Diagnosis */}
                    <div className="space-y-1.5">
                        <Label className="text-sm font-semibold">Primary Diagnosis *</Label>
                        <Input placeholder="e.g. Acute Myocardial Infarction" value={diagnosis} onChange={e => setDiagnosis(e.target.value)} />
                    </div>

                    {/* Allergies */}
                    <div className="space-y-1.5">
                        <Label className="text-sm font-semibold">Allergies</Label>
                        <Input placeholder="Comma separated, e.g. Penicillin, Sulfa" value={allergies} onChange={e => setAllergies(e.target.value)} />
                    </div>

                    {/* Contact Info */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <Label className="text-sm font-semibold">Contact Number</Label>
                            <Input placeholder="+91 XXXXX XXXXX" value={contactNumber} onChange={e => setContactNumber(e.target.value)} />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-sm font-semibold">Emergency Contact</Label>
                            <Input placeholder="+91 XXXXX XXXXX" value={emergencyContact} onChange={e => setEmergencyContact(e.target.value)} />
                        </div>
                    </div>

                    {/* Insurance */}
                    <div className="space-y-1.5">
                        <Label className="text-sm font-semibold">Insurance</Label>
                        <Input placeholder="e.g. Star Health - Policy #SH123456" value={insurance} onChange={e => setInsurance(e.target.value)} />
                    </div>

                    {/* Preview */}
                    {name && department && diagnosis && (
                        <div className="p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border border-emerald-200">
                            <p className="text-xs font-semibold text-emerald-600 mb-1">ADMISSION PREVIEW</p>
                            <p className="font-semibold text-slate-800">{name}</p>
                            <div className="flex flex-wrap gap-2 mt-2">
                                <Badge className="text-xs">{gender}, {age || '?'} yrs</Badge>
                                <Badge variant="outline" className="text-xs">{department}</Badge>
                                <Badge variant="outline" className={`text-xs ${status === 'Critical' ? 'bg-red-50 border-red-200 text-red-600' :
                                        status === 'Stable' ? 'bg-emerald-50 border-emerald-200 text-emerald-600' :
                                            'bg-sky-50 border-sky-200 text-sky-600'
                                    }`}>{status}</Badge>
                            </div>
                            <p className="text-xs text-slate-500 mt-2">{diagnosis}</p>
                        </div>
                    )}
                </div>

                <DialogFooter className="gap-2">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={!name.trim() || !department || !diagnosis.trim()}
                        className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white gap-2"
                    >
                        <UserPlus className="h-4 w-4" />
                        Admit Patient
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
