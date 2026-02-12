import { User, Bed, Calendar, AlertCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import type { Patient } from '@/types';
import { cn, formatDate, getPatientStatusColor } from '@/lib/utils';

interface PatientCardProps {
  patient: Patient;
  isSelected?: boolean;
  onClick?: () => void;
  compact?: boolean;
}

export function PatientCard({ patient, isSelected, onClick, compact = false }: PatientCardProps) {
  const statusColor = getPatientStatusColor(patient.status);

  if (compact) {
    return (
      <Card
        onClick={onClick}
        className={cn(
          "p-3 cursor-pointer transition-all hover:shadow-md border-l-4",
          isSelected 
            ? "ring-2 ring-sky-500 border-sky-500 bg-sky-50/50" 
            : "border-slate-200 hover:border-sky-300",
          patient.status === 'Critical' ? "border-l-red-500" : 
          patient.status === 'Stable' ? "border-l-emerald-500" : "border-l-sky-500"
        )}
      >
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarFallback className={cn(
              "text-sm font-medium",
              patient.status === 'Critical' ? "bg-red-100 text-red-700" :
              patient.status === 'Stable' ? "bg-emerald-100 text-emerald-700" :
              "bg-sky-100 text-sky-700"
            )}>
              {patient.name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="font-medium text-sm truncate">{patient.name}</p>
              <Badge variant="outline" className={cn("text-[10px] px-1 py-0 h-4", statusColor)}>
                {patient.status}
              </Badge>
            </div>
            <p className="text-xs text-slate-500">{patient.mrn} • {patient.department}</p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card
      onClick={onClick}
      className={cn(
        "p-4 cursor-pointer transition-all hover:shadow-lg",
        isSelected 
          ? "ring-2 ring-sky-500 border-sky-500 bg-sky-50/50" 
          : "border-slate-200 hover:border-sky-300",
        patient.status === 'Critical' ? "border-l-4 border-l-red-500" : 
        patient.status === 'Stable' ? "border-l-4 border-l-emerald-500" : 
        "border-l-4 border-l-sky-500"
      )}
    >
      <div className="flex items-start gap-4">
        <Avatar className="h-12 w-12">
          <AvatarFallback className={cn(
            "text-base font-medium",
            patient.status === 'Critical' ? "bg-red-100 text-red-700" :
            patient.status === 'Stable' ? "bg-emerald-100 text-emerald-700" :
            "bg-sky-100 text-sky-700"
          )}>
            {patient.name.split(' ').map(n => n[0]).join('')}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-semibold text-slate-900">{patient.name}</h3>
              <p className="text-sm text-slate-500">{patient.mrn}</p>
            </div>
            <Badge variant="outline" className={statusColor}>
              {patient.status}
            </Badge>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
            <div className="flex items-center gap-1.5 text-slate-600">
              <User className="h-3.5 w-3.5 text-slate-400" />
              <span>{patient.age} yrs • {patient.gender}</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-600">
              <Bed className="h-3.5 w-3.5 text-slate-400" />
              <span>{patient.bedNumber}</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-600">
              <Calendar className="h-3.5 w-3.5 text-slate-400" />
              <span>{formatDate(patient.admissionDate)}</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-600">
              <span className="text-slate-400">Dept:</span>
              <span>{patient.department}</span>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-100">
            <p className="text-sm text-slate-700">
              <span className="text-slate-500">Diagnosis:</span>{' '}
              <span className="font-medium">{patient.diagnosis}</span>
            </p>
          </div>

          {patient.allergies.length > 0 && (
            <div className="mt-2 flex items-center gap-1.5">
              <AlertCircle className="h-3.5 w-3.5 text-red-500" />
              <span className="text-xs text-red-600 font-medium">
                Allergies: {patient.allergies.join(', ')}
              </span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
