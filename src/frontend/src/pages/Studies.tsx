import React, { useState } from 'react';
import { Layout } from '../components/layout/Layout';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Table } from '../components/ui/Table';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { usePagination } from '../hooks/usePagination';
import { mockStudies } from '../data/mockData';
import { Study } from '../types/medical';
import { Search, Plus, Eye, FileImage } from 'lucide-react';

export function Studies() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredStudies, setFilteredStudies] = useState(mockStudies);

  const { currentPage, totalPages, paginatedData, goToPage } = usePagination(filteredStudies, {
    itemsPerPage: 10
  });

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    const filtered = mockStudies.filter(study =>
      study.patientName.toLowerCase().includes(term.toLowerCase()) ||
      study.modality.toLowerCase().includes(term.toLowerCase()) ||
      study.description.toLowerCase().includes(term.toLowerCase())
    );
    setFilteredStudies(filtered);
  };

  const columns = [
    {
      key: 'id' as keyof Study,
      header: 'Study ID',
      sortable: true
    },
    {
      key: 'patientName' as keyof Study,
      header: 'Patient Name'
    },
    {
      key: 'studyDate' as keyof Study,
      header: 'Study Date',
      render: (study: Study) => new Date(study.studyDate).toLocaleDateString()
    },
    {
      key: 'modality' as keyof Study,
      header: 'Modality',
      render: (study: Study) => (
        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
          {study.modality}
        </span>
      )
    },
    {
      key: 'description' as keyof Study,
      header: 'Description'
    },
    {
      key: 'seriesCount' as keyof Study,
      header: 'Series',
      render: (study: Study) => `${study.seriesCount} series`
    },
    {
      key: 'imagesCount' as keyof Study,
      header: 'Images',
      render: (study: Study) => `${study.imagesCount} images`
    },
    {
      key: 'status' as keyof Study,
      header: 'Status',
      render: (study: Study) => (
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
          study.status === 'completed' ? 'bg-green-100 text-green-800' :
          study.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
          'bg-blue-100 text-blue-800'
        }`}>
          {study.status}
        </span>
      )
    },
    {
      key: 'actions' as keyof Study,
      header: 'Actions',
      render: (study: Study) => (
        <div className="flex space-x-2">
          <Button variant="ghost" size="sm" title="View Study">
            <Eye className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" title="Open in DICOM Viewer">
            <FileImage className="h-4 w-4" />
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
            <h1 className="text-3xl font-bold text-gray-900">Studies</h1>
            <p className="text-gray-600 mt-1">Browse and manage medical imaging studies</p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Upload Study
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Imaging Studies</h2>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search studies..."
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