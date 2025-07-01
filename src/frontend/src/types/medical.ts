export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  patientId: string;
  gender: 'male' | 'female' | 'other';
  phone: string;
  email: string;
  lastVisit: string;
  status: 'active' | 'inactive';
}

export interface Study {
  id: string;
  patientId: string;
  patientName: string;
  studyDate: string;
  modality: string;
  description: string;
  seriesCount: number;
  imagesCount: number;
  status: 'pending' | 'completed' | 'reported';
}

export interface DicomImage {
  id: string;
  studyId: string;
  seriesNumber: number;
  instanceNumber: number;
  imageUrl: string;
  windowCenter: number;
  windowWidth: number;
  pixelSpacing: [number, number];
  sliceThickness: number;
}