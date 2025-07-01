import React, { useState } from 'react';
import { Layout } from '../components/layout/Layout';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Table } from '../components/ui/Table';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { usePagination } from '../hooks/usePagination';
import { mockPatients } from '../data/mockData';
import { Patient } from '../types/medical';
import { Search, Plus, Eye, Edit, Trash2 } from 'lucide-react';

export function Patients() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredPatients, setFilteredPatients] = useState(mockPatients);

  const { currentPage, totalPages, paginatedData, goToPage } = usePagination(filteredPatients, {
    itemsPerPage: 10
  });

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    const filtered = mockPatients.filter(patient =>
      `${patient.firstName} ${patient.lastName}`.toLowerCase().includes(term.toLowerCase()) ||
      patient.patientId.toLowerCase().includes(term.toLowerCase()) ||
      patient.email.toLowerCase().includes(term.toLowerCase())
    );
    setFilteredPatients(filtered);
  };

  const columns = [
    {
      key: 'patientId' as keyof Patient,
      header: 'Patient ID',
      sortable: true
    },
    {
      key: 'firstName' as keyof Patient,
      header: 'Name',
      render: (patient: Patient) => `${patient.firstName} ${patient.lastName}`
    },
    {
      key: 'dateOfBirth' as keyof Patient,
      header: 'Date of Birth',
      render: (patient: Patient) => new Date(patient.dateOfBirth).toLocaleDateString()
    },
    {
      key: 'gender' as keyof Patient,
      header: 'Gender',
      render: (patient: Patient) => patient.gender.charAt(0).toUpperCase() + patient.gender.slice(1)
    },
    {
      key: 'phone' as keyof Patient,
      header: 'Phone'
    },
    {
      key: 'lastVisit' as keyof Patient,
      header: 'Last Visit',
      render: (patient: Patient) => new Date(patient.lastVisit).toLocaleDateString()
    },
    {
      key: 'status' as keyof Patient,
      header: 'Status',
      render: (patient: Patient) => (
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
          patient.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
        }`}>
          {patient.status}
        </span>
      )
    },
    {
      key: 'actions' as keyof Patient,
      header: 'Actions',
      render: (patient: Patient) => (
        <div className="flex space-x-2">
          <Button variant="ghost" size="sm">
            <Eye className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <Trash2 className="h-4 w-4 text-red-500" />
          </Button>
        </div>
      )
    }
  ];

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Patients</h1>
            <p className="text-gray-600 mt-1">Manage patient records and information</p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Patient
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Patient Records</h2>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search patients..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table
              data={paginatedData}
              columns={columns}
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={goToPage}
            />
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}