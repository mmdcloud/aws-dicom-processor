import { Patient, Study, DicomImage } from '../types/medical';

export const mockPatients: Patient[] = [
  {
    id: '1',
    firstName: 'John',
    lastName: 'Smith',
    dateOfBirth: '1985-03-15',
    patientId: 'P001',
    gender: 'male',
    phone: '+1 (555) 123-4567',
    email: 'john.smith@email.com',
    lastVisit: '2024-01-15',
    status: 'active'
  },
  {
    id: '2',
    firstName: 'Sarah',
    lastName: 'Johnson',
    dateOfBirth: '1990-07-22',
    patientId: 'P002',
    gender: 'female',
    phone: '+1 (555) 234-5678',
    email: 'sarah.johnson@email.com',
    lastVisit: '2024-01-18',
    status: 'active'
  },
  {
    id: '3',
    firstName: 'Michael',
    lastName: 'Brown',
    dateOfBirth: '1978-11-30',
    patientId: 'P003',
    gender: 'male',
    phone: '+1 (555) 345-6789',
    email: 'michael.brown@email.com',
    lastVisit: '2024-01-10',
    status: 'inactive'
  },
  {
    id: '4',
    firstName: 'Emily',
    lastName: 'Davis',
    dateOfBirth: '1995-05-08',
    patientId: 'P004',
    gender: 'female',
    phone: '+1 (555) 456-7890',
    email: 'emily.davis@email.com',
    lastVisit: '2024-01-20',
    status: 'active'
  },
  {
    id: '5',
    firstName: 'Robert',
    lastName: 'Wilson',
    dateOfBirth: '1970-12-03',
    patientID: 'P005',
    gender: 'male',
    phone: '+1 (555) 567-8901',
    email: 'robert.wilson@email.com',
    lastVisit: '2024-01-12',
    status: 'active'
  }
];

export const mockStudies: Study[] = [
  {
    id: 'S001',
    patientId: '1',
    patientName: 'John Smith',
    studyDate: '2024-01-15',
    modality: 'CT',
    description: 'Chest CT with contrast',
    seriesCount: 3,
    imagesCount: 120,
    status: 'completed'
  },
  {
    id: 'S002',
    patientId: '2',
    patientName: 'Sarah Johnson',
    studyDate: '2024-01-18',
    modality: 'MRI',
    description: 'Brain MRI without contrast',
    seriesCount: 5,
    imagesCount: 200,
    status: 'reported'
  },
  {
    id: 'S003',
    patientId: '1',
    patientName: 'John Smith',
    studyDate: '2024-01-20',
    modality: 'X-Ray',
    description: 'Chest X-Ray PA and Lateral',
    seriesCount: 2,
    imagesCount: 2,
    status: 'pending'
  },
  {
    id: 'S004',
    patientId: '4',
    patientName: 'Emily Davis',
    studyDate: '2024-01-20',
    modality: 'US',
    description: 'Abdominal Ultrasound',
    seriesCount: 1,
    imagesCount: 15,
    status: 'completed'
  }
];

export const mockDicomImages: DicomImage[] = [
  {
    id: 'IMG001',
    studyId: 'S001',
    seriesNumber: 1,
    instanceNumber: 1,
    imageUrl: 'https://images.pexels.com/photos/7089020/pexels-photo-7089020.jpeg?auto=compress&cs=tinysrgb&w=800',
    windowCenter: 40,
    windowWidth: 400,
    pixelSpacing: [0.5, 0.5],
    sliceThickness: 5.0
  },
  {
    id: 'IMG002',
    studyId: 'S001',
    seriesNumber: 1,
    instanceNumber: 2,
    imageUrl: 'https://images.pexels.com/photos/7089021/pexels-photo-7089021.jpeg?auto=compress&cs=tinysrgb&w=800',
    windowCenter: 40,
    windowWidth: 400,
    pixelSpacing: [0.5, 0.5],
    sliceThickness: 5.0
  },
  {
    id: 'IMG003',
    studyId: 'S002',
    seriesNumber: 1,
    instanceNumber: 1,
    imageUrl: 'https://images.pexels.com/photos/7089022/pexels-photo-7089022.jpeg?auto=compress&cs=tinysrgb&w=800',
    windowCenter: 300,
    windowWidth: 600,
    pixelSpacing: [1.0, 1.0],
    sliceThickness: 3.0
  }
];