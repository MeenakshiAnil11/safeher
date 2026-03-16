import React, { useState, useEffect } from "react";
import {
  FaFilePrescription,
  FaDownload,
  FaShare,
  FaCalendarAlt,
  FaUserMd,
  FaPills,
  FaClock,
  FaInfoCircle,
} from "react-icons/fa";
import api from "../../services/api";
import "./Prescriptions.css";

export default function Prescriptions() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  const fetchPrescriptions = async () => {
    try {
      setLoading(true);
      const response = await api.get("/telehealth/prescriptions");
      setPrescriptions(response.data.prescriptions || []);
    } catch (error) {
      console.error("Error fetching prescriptions:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async (prescriptionId) => {
    try {
      const response = await api.get(`/telehealth/prescriptions/${prescriptionId}/pdf`, {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `prescription-${prescriptionId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      alert("Failed to download PDF. Generating...");
      // Fallback: Generate PDF on client side or show message
    }
  };

  const handleForwardToPharmacy = (prescription) => {
    // Show modal or navigate to pharmacy forwarding page
    const pharmacyEmail = window.prompt(
      "Enter pharmacy email address:",
      ""
    );
    if (pharmacyEmail) {
      api
        .post(`/telehealth/prescriptions/${prescription._id}/forward`, {
          pharmacyEmail,
        })
        .then(() => {
          alert("Prescription forwarded to pharmacy successfully!");
        })
        .catch(() => {
          alert("Failed to forward prescription");
        });
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="prescriptions-page">
      <div className="page-header">
        <h2>My Prescriptions</h2>
        <p>View and manage your digital prescriptions</p>
      </div>

      {loading ? (
        <div className="loading-state">Loading prescriptions...</div>
      ) : prescriptions.length === 0 ? (
        <div className="empty-state">
          <FaFilePrescription className="empty-icon" />
          <p>No prescriptions yet</p>
          <p className="empty-subtitle">
            Your prescriptions will appear here after consultations
          </p>
        </div>
      ) : (
        <div className="prescriptions-list">
          {prescriptions.map((prescription) => (
            <div key={prescription._id} className="prescription-card">
              {/* Card Header */}
              <div className="prescription-header">
                <div className="prescription-header-left">
                  <div className="prescription-icon-wrapper">
                    <FaFilePrescription className="prescription-icon" />
                  </div>
                  <div className="prescription-title-section">
                    <h3>Prescription #{prescription._id.slice(-6).toUpperCase()}</h3>
                    <div className="prescription-date">
                      <FaCalendarAlt className="date-icon" />
                      <span>{formatDateTime(prescription.createdAt)}</span>
                    </div>
                  </div>
                </div>
                <div className="doctor-info-header">
                  <FaUserMd className="doctor-icon" />
                  <div>
                    <p className="doctor-name">Doctor</p>
                    <p className="specialization">
                      {prescription.doctor?.specialization || "General Physician"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Medications Section */}
              {prescription.medications?.length > 0 && (
                <div className="medications-section">
                  <h4 className="section-title">
                    <FaPills className="section-icon" />
                    Medications
                  </h4>
                  <div className="medications-list">
                    {prescription.medications.map((med, idx) => (
                      <div key={idx} className="medication-item">
                        <div className="medication-header">
                          <div className="med-icon-wrapper">
                            <FaPills className="med-icon" />
                          </div>
                          <div className="med-name-wrapper">
                            <h5 className="med-name">{med.name}</h5>
                          </div>
                        </div>
                        <div className="medication-details">
                          <div className="med-detail-row">
                            <span className="detail-label">Dosage:</span>
                            <span className="detail-value dosage">{med.dosage}</span>
                          </div>
                          <div className="med-detail-row">
                            <span className="detail-label">Frequency:</span>
                            <span className="detail-value">{med.frequency}</span>
                          </div>
                          <div className="med-detail-row">
                            <span className="detail-label">Duration:</span>
                            <span className="detail-value duration">
                              <FaClock className="duration-icon" />
                              {med.duration}
                            </span>
                          </div>
                        </div>
                        {med.instructions && (
                          <div className="med-instructions">
                            <FaInfoCircle className="instructions-icon" />
                            <span>{med.instructions}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Additional Information */}
              {(prescription.diagnosis || prescription.instructions || prescription.followUpDate) && (
                <div className="additional-info">
                  {prescription.diagnosis && (
                    <div className="info-item">
                      <span className="info-label">Diagnosis:</span>
                      <span className="info-value">{prescription.diagnosis}</span>
                    </div>
                  )}
                  {prescription.instructions && (
                    <div className="info-item">
                      <span className="info-label">General Instructions:</span>
                      <span className="info-value">{prescription.instructions}</span>
                    </div>
                  )}
                  {prescription.followUpDate && (
                    <div className="info-item">
                      <span className="info-label">Follow-up Date:</span>
                      <span className="info-value">{formatDate(prescription.followUpDate)}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="prescription-actions">
                <button
                  className="btn-download"
                  onClick={() => handleDownloadPDF(prescription._id)}
                >
                  <FaDownload /> Download PDF
                </button>
                <button
                  className="btn-forward"
                  onClick={() => handleForwardToPharmacy(prescription)}
                >
                  <FaShare /> Forward to Pharmacy
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
