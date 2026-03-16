import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import api from "../../services/api";
import { getStoredReminders, setStoredReminders } from "../../services/perimenopauseService";

export default function HealthReminders() {
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingReminder, setEditingReminder] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: new Date(),
    time: "09:00",
    category: "health"
  });

  // Categories with colors
  const categories = [
    { value: "symptom", label: "Symptom Log", color: "bg-indigo-100 text-indigo-700", icon: "📝" },
    { value: "health", label: "Health", color: "bg-blue-100 text-blue-700", icon: "🏥" },
    { value: "lifestyle", label: "Lifestyle", color: "bg-purple-100 text-purple-700", icon: "🧘" },
    { value: "medication", label: "Medication", color: "bg-green-100 text-green-700", icon: "💊" },
    { value: "appointment", label: "Appointment", color: "bg-pink-100 text-pink-700", icon: "📅" }
  ];

  // Generate mock reminders data
  const generateMockReminders = () => {
    return [
      {
        id: 1,
        title: "Log today's symptoms",
        description: "Record mood, hot flashes and sleep quality",
        date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
        time: "20:00",
        category: "symptom",
        status: "pending"
      },
      {
        id: 2,
        title: "Medication reminder",
        description: "Take prescribed medication on time",
        date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        time: "08:00",
        category: "medication",
        status: "pending"
      },
      {
        id: 3,
        title: "Exercise reminder",
        description: "20-minute low-impact movement session",
        date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        time: "18:30",
        category: "lifestyle",
        status: "pending"
      },
      {
        id: 4,
        title: "Doctor visit reminder",
        description: "Discuss symptom trends in your next checkup",
        date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        time: "14:30",
        category: "appointment",
        status: "pending"
      }
    ];
  };

  // Fetch reminders from API
  const fetchReminders = async () => {
    try {
      setLoading(true);
      const response = await api.get('/perimenopause/reminders');
      const apiReminders = response.data.reminders || [];
      setReminders(apiReminders.length ? apiReminders : (getStoredReminders().length ? getStoredReminders() : generateMockReminders()));
    } catch (error) {
      console.error('Error fetching reminders:', error);
      const stored = getStoredReminders();
      setReminders(stored.length ? stored : generateMockReminders());
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchReminders();
  }, []);

  useEffect(() => {
    if (!loading) setStoredReminders(reminders);
  }, [reminders, loading]);

  // Show toast message
  const showToastMessage = (message) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  // Handle add reminder
  const handleAddReminder = async () => {
    try {
      const newReminder = {
        title: formData.title,
        description: formData.description,
        date: formData.date,
        time: formData.time,
        category: formData.category,
        status: "pending"
      };

      await api.post('/perimenopause/reminders', newReminder);
      
      setReminders([...reminders, { ...newReminder, id: reminders.length + 1 }]);
      setShowModal(false);
      showToastMessage("Reminder added successfully!");
      resetForm();
    } catch (error) {
      console.error('Error adding reminder:', error);
      showToastMessage("Failed to add reminder");
    }
  };

  // Handle update reminder
  const handleUpdateReminder = async (id) => {
    try {
      const updatedReminder = {
        ...reminders.find(r => r.id === id),
        title: formData.title,
        description: formData.description,
        date: formData.date,
        time: formData.time,
        category: formData.category
      };

      await api.put(`/perimenopause/reminders/${id}`, updatedReminder);
      
      setReminders(reminders.map(r => r.id === id ? updatedReminder : r));
      setShowModal(false);
      setEditingReminder(null);
      showToastMessage("Reminder updated successfully!");
      resetForm();
    } catch (error) {
      console.error('Error updating reminder:', error);
      showToastMessage("Failed to update reminder");
    }
  };

  // Handle delete reminder
  const handleDeleteReminder = async (id) => {
    try {
      await api.delete(`/perimenopause/reminders/${id}`);
      setReminders(reminders.filter(r => r.id !== id));
      showToastMessage("Reminder deleted successfully!");
    } catch (error) {
      console.error('Error deleting reminder:', error);
      showToastMessage("Failed to delete reminder");
    }
  };

  // Toggle reminder status
  const toggleReminderStatus = async (id) => {
    try {
      const reminder = reminders.find(r => r.id === id);
      const newStatus = reminder.status === "done" ? "pending" : "done";
      
      await api.patch(`/perimenopause/reminders/${id}`, { status: newStatus });
      setReminders(reminders.map(r => r.id === id ? { ...r, status: newStatus } : r));
      showToastMessage(`Reminder marked as ${newStatus}!`);
    } catch (error) {
      console.error('Error toggling reminder status:', error);
      showToastMessage("Failed to update reminder status");
    }
  };

  // Open add modal
  const openAddModal = () => {
    setEditingReminder(null);
    setFormData({
      title: "",
      description: "",
      date: new Date(),
      time: "09:00",
      category: "health"
    });
    setShowModal(true);
  };

  // Open edit modal
  const openEditModal = (reminder) => {
    setEditingReminder(reminder);
    setFormData({
      title: reminder.title,
      description: reminder.description,
      date: new Date(reminder.date),
      time: reminder.time,
      category: reminder.category
    });
    setShowModal(true);
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      date: new Date(),
      time: "09:00",
      category: "health"
    });
  };

  // Get category info
  const getCategoryInfo = (categoryValue) => {
    return categories.find(cat => cat.value === categoryValue) || categories[0];
  };

  // Sort reminders by date
  const sortedReminders = [...reminders].sort((a, b) => new Date(a.date) - new Date(b.date));

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-lavender-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold text-gray-800 mb-2 font-serif">
                Health Reminders
              </h1>
              <p className="text-lg text-gray-600">
                Track upcoming medical appointments and self-care tasks
              </p>
            </div>
            <button
              onClick={openAddModal}
              className="bg-gradient-to-r from-lavender-400 to-pink-400 hover:from-lavender-500 hover:to-pink-500 text-white py-3 px-6 rounded-xl font-semibold transition-all duration-300 shadow-md hover:shadow-lg flex items-center gap-2"
            >
              <span>➕</span>
              Add Reminder
            </button>
          </div>
        </div>

        {/* Reminders List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lavender-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading reminders...</p>
          </div>
        ) : sortedReminders.length > 0 ? (
          <div className="space-y-4">
            {sortedReminders.map((reminder) => {
              const catInfo = getCategoryInfo(reminder.category);
              const isPast = new Date(reminder.date) < new Date();
              const isToday = new Date(reminder.date).toDateString() === new Date().toDateString();

              return (
                <div
                  key={reminder.id}
                  className="bg-white rounded-xl p-6 shadow-md border border-gray-200 hover:shadow-lg transition-all duration-300"
                >
                  <div className="flex items-start justify-between">
                    {/* Left Section */}
                    <div className="flex items-start gap-4 flex-1">
                      {/* Icon */}
                      <div className="text-3xl">{catInfo.icon}</div>

                      {/* Content */}
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-bold text-gray-800">
                            {reminder.title}
                          </h3>
                          <span className={`px-3 py-1 ${catInfo.color} text-xs font-semibold rounded-full`}>
                            {catInfo.label}
                          </span>
                        </div>

                        <p className="text-gray-600 text-sm mb-3">
                          {reminder.description}
                        </p>

                        {/* Date & Time */}
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            {new Date(reminder.date).toLocaleDateString('en-US', {
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                            {isToday && <span className="text-blue-600 font-semibold ml-1">(Today)</span>}
                            {isPast && !isToday && <span className="text-red-600 font-semibold ml-1">(Past)</span>}
                          </span>
                          <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {reminder.time}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right Section - Actions */}
                    <div className="flex items-center gap-3">
                      {/* Status Toggle */}
                      <button
                        onClick={() => toggleReminderStatus(reminder.id)}
                        className={`px-4 py-2 rounded-lg font-semibold transition-all duration-300 ${
                          reminder.status === "done"
                            ? "bg-green-100 text-green-700 hover:bg-green-200"
                            : "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                        }`}
                      >
                        {reminder.status === "done" ? "✓ Done" : "○ Pending"}
                      </button>

                      {/* Edit Button */}
                      <button
                        onClick={() => openEditModal(reminder)}
                        className="bg-blue-100 hover:bg-blue-200 text-blue-700 p-2 rounded-lg transition-all duration-300"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>

                      {/* Delete Button */}
                      <button
                        onClick={() => handleDeleteReminder(reminder.id)}
                        className="bg-red-100 hover:bg-red-200 text-red-700 p-2 rounded-lg transition-all duration-300"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-xl p-12 text-center border border-gray-200">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No Reminders</h3>
            <p className="text-gray-600 mb-4">Start by adding your first reminder</p>
            <button
              onClick={openAddModal}
              className="bg-gradient-to-r from-lavender-400 to-pink-400 hover:from-lavender-500 hover:to-pink-500 text-white py-2 px-6 rounded-lg font-semibold transition-all duration-300"
            >
              Add Reminder
            </button>
          </div>
        )}

        {/* Toast Notification */}
        {showToast && (
          <div className="fixed bottom-4 right-4 z-50 animate-slide-up">
            <div className="bg-green-100 border border-green-300 text-green-800 p-4 rounded-lg shadow-lg">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">✅</span>
                <span className="font-semibold">{toastMessage}</span>
              </div>
            </div>
          </div>
        )}

        {/* Add/Edit Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  {editingReminder ? "Edit Reminder" : "Add New Reminder"}
                </h2>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setEditingReminder(null);
                    resetForm();
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g., Vitamin D Test"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lavender-500 focus:border-transparent"
                    required
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Add any additional details..."
                    rows="3"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lavender-500 focus:border-transparent resize-none"
                  />
                </div>

                {/* Date & Time */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date *
                    </label>
                    <DatePicker
                      selected={formData.date}
                      onChange={(date) => setFormData({ ...formData, date })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lavender-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Time *
                    </label>
                    <input
                      type="time"
                      value={formData.time}
                      onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lavender-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lavender-500 focus:border-transparent"
                  >
                    {categories.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.icon} {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Buttons */}
                <div className="flex gap-4 mt-6">
                  <button
                    onClick={() => {
                      setShowModal(false);
                      setEditingReminder(null);
                      resetForm();
                    }}
                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 px-4 rounded-lg font-semibold transition-all duration-300"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => editingReminder ? handleUpdateReminder(editingReminder.id) : handleAddReminder()}
                    disabled={!formData.title}
                    className="flex-1 bg-gradient-to-r from-lavender-400 to-pink-400 hover:from-lavender-500 hover:to-pink-500 text-white py-3 px-4 rounded-lg font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {editingReminder ? "Update Reminder" : "Add Reminder"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add toast animation styles */}
        <style>{`
          @keyframes slide-up {
            from {
              transform: translateY(100%);
              opacity: 0;
            }
            to {
              transform: translateY(0);
              opacity: 1;
            }
          }
          .animate-slide-up {
            animation: slide-up 0.3s ease-out;
          }
        `}</style>
      </div>
    </div>
  );
}
