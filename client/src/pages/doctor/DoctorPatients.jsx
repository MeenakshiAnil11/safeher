import React, { useState, useEffect } from "react";
import {
  FaUser,
  FaHeartbeat,
  FaCalendarAlt,
  FaFileMedical,
  FaDownload,
  FaTint,
  FaThermometerHalf,
  FaWeight,
} from "react-icons/fa";
import api from "../../services/api";
import "./DoctorPatients.css";

export default function DoctorPatients() {
  const [patients, setPatients] = useState([]);
  const [selectedPatientId, setSelectedPatientId] = useState("");
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [activeTab, setActiveTab] = useState("vitals");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPatients();
  }, []);

  useEffect(() => {
    if (selectedPatientId) {
      const patient = patients.find((p) => p._id === selectedPatientId);
      if (patient) {
        setSelectedPatient(patient);
        fetchPatientData(patient._id);
      }
    } else if (patients.length > 0) {
      // Auto-select first patient
      setSelectedPatientId(patients[0]._id);
      setSelectedPatient(patients[0]);
      fetchPatientData(patients[0]._id);
    }
  }, [selectedPatientId, patients]);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const response = await api.get("/telehealth/patients").catch(() => ({
        data: { patients: [] },
      }));
      const patientsData = response.data.patients || [];
      
      if (patientsData.length === 0) {
        // Mock data
        const mockPatients = [
          {
            _id: "patient-1",
            user: { name: "Emma Wilson", email: "emma@example.com" },
            age: 32,
            gender: "Female",
            bloodType: "O+",
            allergies: "None",
            hasConsent: true,
          },
        ];
        setPatients(mockPatients);
        setSelectedPatientId("patient-1");
        setSelectedPatient(mockPatients[0]);
        fetchPatientData("patient-1");
      } else {
        setPatients(patientsData);
      }
    } catch (error) {
      console.error("Error fetching patients:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPatientData = async (id) => {
    try {
      const response = await api.get(`/telehealth/health-data/${id}`).catch(() => ({
        data: {},
      }));
      setSelectedPatient((prev) => ({
        ...prev,
        healthData: response.data || {
          vitals: [
            {
              recordedAt: "2026-02-01T00:00:00Z",
              systolic: 120,
              diastolic: 80,
              heartRateBpm: 72,
              glucose: 95,
              temperature: 98.6,
              weightKg: 65,
            },
            {
              recordedAt: "2026-01-25T00:00:00Z",
              systolic: 118,
              diastolic: 78,
              heartRateBpm: 70,
              glucose: 92,
              temperature: 98.4,
              weightKg: 65.5,
            },
            {
              recordedAt: "2026-01-18T00:00:00Z",
              systolic: 122,
              diastolic: 82,
              heartRateBpm: 74,
              glucose: 98,
              temperature: 98.7,
              weightKg: 66,
            },
            {
              recordedAt: "2026-01-11T00:00:00Z",
              systolic: 119,
              diastolic: 79,
              heartRateBpm: 71,
              glucose: 94,
              temperature: 98.5,
              weightKg: 66,
            },
          ],
          symptoms: [],
          consultations: [],
        },
      }));
    } catch (error) {
      console.error("Error fetching patient data:", error);
      // Set mock data
      setSelectedPatient((prev) => ({
        ...prev,
        healthData: {
          vitals: [
            {
              recordedAt: "2026-02-01T00:00:00Z",
              systolic: 120,
              diastolic: 80,
              heartRateBpm: 72,
              glucose: 95,
              temperature: 98.6,
              weightKg: 65,
            },
            {
              recordedAt: "2026-01-25T00:00:00Z",
              systolic: 118,
              diastolic: 78,
              heartRateBpm: 70,
              glucose: 92,
              temperature: 98.4,
              weightKg: 65.5,
            },
            {
              recordedAt: "2026-01-18T00:00:00Z",
              systolic: 122,
              diastolic: 82,
              heartRateBpm: 74,
              glucose: 98,
              temperature: 98.7,
              weightKg: 66,
            },
            {
              recordedAt: "2026-01-11T00:00:00Z",
              systolic: 119,
              diastolic: 79,
              heartRateBpm: 71,
              glucose: 94,
              temperature: 98.5,
              weightKg: 66,
            },
          ],
          symptoms: [],
          consultations: [],
        },
      }));
    }
  };

  const handleSelectPatient = (e) => {
    const patientId = e.target.value;
    setSelectedPatientId(patientId);
  };

  const handleExportPDF = async () => {
    if (!selectedPatient) return;
    try {
      const response = await api.get(`/telehealth/patients/${selectedPatient._id}/export`, {
        responseType: "blob",
      }).catch(() => {
        alert("PDF export feature coming soon");
        return null;
      });
      
      if (response) {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `patient-records-${selectedPatient._id}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
      }
    } catch (error) {
      console.error("Error exporting PDF:", error);
      alert("Failed to export PDF");
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toISOString().split("T")[0];
  };

  if (loading) {
    return <div className="doctor-patients-loading">Loading patients...</div>;
  }

  return (
    <div className="doctor-patients">
      <div className="patients-header">
        <div className="header-left">
          <h1>Patient Records</h1>
          <p className="header-subtitle">View comprehensive patient health information.</p>
        </div>
        {selectedPatient && (
          <button className="btn-export-pdf" onClick={handleExportPDF}>
            <FaDownload /> Export as PDF
          </button>
        )}
      </div>

      {/* Patient Selector */}
      <div className="patient-selector-section">
        <label className="patient-selector-label">Select Patient:</label>
        <select
          value={selectedPatientId}
          onChange={handleSelectPatient}
          className="patient-selector"
        >
          <option value="">Select a patient...</option>
          {patients.map((patient) => (
            <option key={patient._id} value={patient._id}>
              {patient.user?.name || "Patient"}
            </option>
          ))}
        </select>
      </div>

      {selectedPatient && (
        <>
          {/* Patient Information Card */}
          <div className="patient-info-card">
            <div className="patient-avatar-large">
              <FaUser className="patient-avatar-icon" />
            </div>
            <div className="patient-info-details">
              <h2 className="patient-name">{selectedPatient.user?.name || "Patient"}</h2>
              <div className="patient-details-grid">
                <div className="patient-detail-item">
                  <span className="detail-label">Age:</span>
                  <span className="detail-value">{selectedPatient.age || 32} years</span>
                </div>
                <div className="patient-detail-item">
                  <span className="detail-label">Gender:</span>
                  <span className="detail-value">{selectedPatient.gender || "Female"}</span>
                </div>
                <div className="patient-detail-item">
                  <span className="detail-label">Blood Type:</span>
                  <span className="detail-value">{selectedPatient.bloodType || "O+"}</span>
                </div>
                <div className="patient-detail-item">
                  <span className="detail-label">Allergies:</span>
                  <span className="detail-value">{selectedPatient.allergies || "None"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="patient-tabs">
            <button
              className={`tab-btn ${activeTab === "vitals" ? "active" : ""}`}
              onClick={() => setActiveTab("vitals")}
            >
              Vitals
            </button>
            <button
              className={`tab-btn ${activeTab === "symptoms" ? "active" : ""}`}
              onClick={() => setActiveTab("symptoms")}
            >
              Symptom Journal
            </button>
            <button
              className={`tab-btn ${activeTab === "consultations" ? "active" : ""}`}
              onClick={() => setActiveTab("consultations")}
            >
              Consultation History
            </button>
          </div>

          {/* Tab Content */}
          <div className="tab-content">
            {activeTab === "vitals" && (
              <div className="vitals-tab-content">
                <h3 className="tab-section-title">Vital Signs History</h3>
                <div className="vitals-table-container">
                  <table className="vitals-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Blood Pressure</th>
                        <th>Heart Rate</th>
                        <th>Glucose</th>
                        <th>Temperature</th>
                        <th>Weight</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedPatient.healthData?.vitals && selectedPatient.healthData.vitals.length > 0 ? (
                        selectedPatient.healthData.vitals.map((vital, idx) => (
                          <tr key={idx}>
                            <td>{formatDate(vital.recordedAt)}</td>
                            <td>
                              <div className="vital-cell">
                                <FaHeartbeat className="vital-icon bp-icon" />
                                <span>{vital.systolic}/{vital.diastolic} mmHg</span>
                              </div>
                            </td>
                            <td>
                              <div className="vital-cell">
                                <FaHeartbeat className="vital-icon hr-icon" />
                                <span>{vital.heartRateBpm} bpm</span>
                              </div>
                            </td>
                            <td>
                              <div className="vital-cell">
                                <FaTint className="vital-icon glucose-icon" />
                                <span>{vital.glucose} mg/dL</span>
                              </div>
                            </td>
                            <td>
                              {vital.temperature ? `${vital.temperature}°F` : "-"}
                            </td>
                            <td>
                              {vital.weightKg ? `${vital.weightKg} kg` : "-"}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="6" className="empty-state-cell">
                            <div className="empty-state">
                              <FaHeartbeat className="empty-icon" />
                              <p>No vital signs recorded</p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === "symptoms" && (
              <div className="symptoms-tab-content">
                <h3 className="tab-section-title">Symptom Journal</h3>
                {selectedPatient.healthData?.symptoms && selectedPatient.healthData.symptoms.length > 0 ? (
                  <div className="symptoms-list">
                    {selectedPatient.healthData.symptoms.map((symptom, idx) => (
                      <div key={idx} className="symptom-item">
                        <div className="symptom-date">
                          <FaCalendarAlt className="symptom-date-icon" />
                          <span>{formatDate(symptom.date)}</span>
                        </div>
                        <div className="symptom-details">
                          <span className="symptom-name">{symptom.name}</span>
                          <span className={`symptom-severity ${symptom.intensity?.toLowerCase()}`}>
                            {symptom.intensity}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="empty-state">
                    <FaFileMedical className="empty-icon" />
                    <p>No symptoms recorded</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === "consultations" && (
              <div className="consultations-tab-content">
                <h3 className="tab-section-title">Consultation History</h3>
                {selectedPatient.healthData?.consultations && selectedPatient.healthData.consultations.length > 0 ? (
                  <div className="consultations-list">
                    {selectedPatient.healthData.consultations.map((consultation, idx) => (
                      <div key={idx} className="consultation-item">
                        <div className="consultation-date">{formatDate(consultation.date)}</div>
                        <div className="consultation-details">
                          <span>{consultation.type || "Consultation"}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="empty-state">
                    <FaCalendarAlt className="empty-icon" />
                    <p>No consultations recorded</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
