import React, { useState } from 'react';
import { Layout } from '../components/layout/Layout';
import { DicomViewer } from '../components/DicomViewer';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { mockStudies } from '../data/mockData';
import { FileImage, Calendar, User } from 'lucide-react';

export function DicomViewerPage() {
  const [selectedStudyId, setSelectedStudyId] = useState('S001');

  const selectedStudy = mockStudies.find(study => study.id === selectedStudyId);

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">DICOM Viewer</h1>
          <p className="text-gray-600 mt-1">View and analyze medical images</p>
        </div>

        <div className="grid grid-cols-12 gap-6">
          {/* Study Selection Sidebar */}
          <div className="col-span-3">
            <Card>
              <CardHeader>
                <h2 className="text-lg font-semibold text-gray-900">Available Studies</h2>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {mockStudies.map((study) => (
                    <button
                      key={study.id}
                      onClick={() => setSelectedStudyId(study.id)}
                      className={`w-full text-left p-3 rounded-lg border transition-colors ${
                        selectedStudyId === study.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="p-1 bg-blue-100 rounded">
                          <FileImage className="h-4 w-4 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {study.patientName}
                          </p>
                          <p className="text-xs text-gray-500 flex items-center mt-1">
                            <Calendar className="h-3 w-3 mr-1" />
                            {new Date(study.studyDate).toLocaleDateString()}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {study.modality} • {study.description}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {study.seriesCount} series • {study.imagesCount} images
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Study Information */}
            {selectedStudy && (
              <Card className="mt-4">
                <CardHeader>
                  <h3 className="text-lg font-semibold text-gray-900">Study Information</h3>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{selectedStudy.patientName}</p>
                        <p className="text-xs text-gray-500">Patient ID: {selectedStudy.patientId}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-900">
                          {new Date(selectedStudy.studyDate).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-gray-500">Study Date</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <FileImage className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{selectedStudy.modality}</p>
                        <p className="text-xs text-gray-500">Modality</p>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-gray-200">
                      <p className="text-sm text-gray-900">{selectedStudy.description}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {selectedStudy.seriesCount} series containing {selectedStudy.imagesCount} images
                      </p>
                    </div>

                    <div className="pt-2">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        selectedStudy.status === 'completed' ? 'bg-green-100 text-green-800' :
                        selectedStudy.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {selectedStudy.status}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Main Viewer */}
          <div className="col-span-9">
            <DicomViewer studyId={selectedStudyId} />
          </div>
        </div>
      </div>
    </Layout>
  );
}