'use client';
import { useState, useCallback, useEffect } from 'react';
import { Patient } from '@/types';
import { Sidebar } from '@/components/layout/Sidebar';

import { PatientList } from '@/components/patients/PatientList';
import { PatientDetails } from '@/components/patients/PatientDetails';
import { PatientForm } from '@/components/patients/PatientForm';
import { Dashboard } from '@/components/dashboard/Dashbord';

// Types
type NavigationTab = 'dashboard' | 'patients' | 'newDossier';

export default function HomePage() {
  // États
  const [activeTab, setActiveTab] = useState<NavigationTab>('dashboard');
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Charger les patients au montage du composant
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const response = await fetch('/api/patients');
        const data = await response.json();
        setPatients(data);
      } catch (error) {
        console.error('Erreur lors du chargement des patients:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPatients();
  }, []);

  const handleTabChange = useCallback((newTab: NavigationTab) => {
    if (selectedPatient) {
      if (window.confirm('Voulez-vous vraiment quitter la vue détaillée ?')) {
        setSelectedPatient(null);
        setActiveTab(newTab);
      }
    } else {
      setActiveTab(newTab);
    }
  }, [selectedPatient]);

  const handlePatientSubmit = useCallback(async (patientData: Omit<Patient, 'id'>) => {
    try {
      const response = await fetch('/api/patients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(patientData),
      });

      if (!response.ok) throw new Error('Erreur lors de la création du patient');

      const newPatient = await response.json();
      setPatients(prev => [...prev, newPatient]);
      setActiveTab('patients');
    } catch (error) {
      console.error('Erreur lors de la création du patient:', error);
      alert('Une erreur est survenue lors de la création du dossier');
    }
  }, []);

  const handlePatientSelect = useCallback((patient: Patient) => {
    setSelectedPatient(patient);
  }, []);

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Chargement...</div>;
  }

  // Rendu principal
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar toujours visible */}
      <Sidebar 
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />

      {/* Contenu principal */}
      <main className="flex-1 overflow-auto">
        {selectedPatient ? (
          <div className="relative">
            <PatientDetails patient={selectedPatient} />
            <button
              onClick={() => setSelectedPatient(null)}
              className="absolute top-6 right-6 px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200"
            >
              ← Retour à la liste
            </button>
          </div>
        ) : (
          <>
            {activeTab === 'dashboard' && (
              <Dashboard patients={patients} />
            )}
            
            {activeTab === 'patients' && (
              <PatientList
                patients={patients}
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                onSelectPatient={handlePatientSelect}
                onNewDossier={() => handleTabChange('newDossier')}
              />
            )}
            
            {activeTab === 'newDossier' && (
              <PatientForm
                onSubmit={handlePatientSubmit}
                onCancel={() => handleTabChange('patients')}
              />
            )}
          </>
        )}
      </main>
    </div>
  );
}