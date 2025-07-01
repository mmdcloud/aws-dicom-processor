import React from 'react';
import { Layout } from '../components/layout/Layout';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { BarChart3, TrendingUp, FileText, Download } from 'lucide-react';

export function Reports() {
  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
            <p className="text-gray-600 mt-1">Analytics and reporting dashboard</p>
          </div>
          <Button>
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Studies Overview */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5 text-blue-600" />
                <h2 className="text-xl font-semibold text-gray-900">Studies Overview</h2>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Studies</span>
                  <span className="text-2xl font-bold text-gray-900">156</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">This Month</span>
                  <span className="text-lg font-semibold text-green-600">+24</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Pending Review</span>
                  <span className="text-lg font-semibold text-orange-600">12</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Performance Metrics */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                <h2 className="text-xl font-semibold text-gray-900">Performance Metrics</h2>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Average Report Time</span>
                  <span className="text-lg font-semibold text-gray-900">2.3 hours</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Studies per Day</span>
                  <span className="text-lg font-semibold text-blue-600">12.4</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Quality Score</span>
                  <span className="text-lg font-semibold text-green-600">98.2%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Reports */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-purple-600" />
              <h2 className="text-xl font-semibold text-gray-900">Recent Reports</h2>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                {
                  id: 'R001',
                  patient: 'John Smith',
                  study: 'Chest CT with contrast',
                  date: '2024-01-20',
                  status: 'completed',
                  radiologist: 'Dr. Sarah Johnson'
                },
                {
                  id: 'R002',
                  patient: 'Emily Davis',
                  study: 'Abdominal Ultrasound',
                  date: '2024-01-20',
                  status: 'pending',
                  radiologist: 'Dr. Michael Brown'
                },
                {
                  id: 'R003',
                  patient: 'Sarah Johnson',
                  study: 'Brain MRI without contrast',
                  date: '2024-01-18',
                  status: 'completed',
                  radiologist: 'Dr. Sarah Johnson'
                }
              ].map((report) => (
                <div key={report.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{report.patient}</p>
                        <p className="text-sm text-gray-500">{report.study}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">{new Date(report.date).toLocaleDateString()}</p>
                        <p className="text-xs text-gray-500">{report.radiologist}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      report.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {report.status}
                    </span>
                    <Button variant="ghost" size="sm">
                      <FileText className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}