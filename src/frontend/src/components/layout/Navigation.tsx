import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Users, FileImage, Database, BarChart3 } from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Patients', href: '/patients', icon: Users },
  { name: 'Studies', href: '/studies', icon: FileImage },
  { name: 'DICOM Viewer', href: '/dicom-viewer', icon: Database },
  { name: 'Reports', href: '/reports', icon: BarChart3 },
];

export function Navigation() {
  return (
    <nav className="bg-gray-50 border-r border-gray-200 w-64 h-full">
      <div className="p-4">
        <ul className="space-y-2">
          {navigation.map((item) => (
            <li key={item.name}>
              <NavLink
                to={item.href}
                className={({ isActive }) =>
                  `flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`
                }
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.name}
              </NavLink>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}