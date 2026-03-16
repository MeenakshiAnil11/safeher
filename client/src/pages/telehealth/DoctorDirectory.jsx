import React, { useState, useEffect, useRef } from "react";
import {
  FaTimes,
  FaCalendarAlt,
  FaHome,
  FaDownload,
  FaVideo,
  FaComments,
} from "react-icons/fa";
import api from "../../services/api";
import toast from "react-hot-toast";
import { getImageUrl } from "../../utils/imageUtils";
import DoctorCard from "../../components/telehealth/DoctorCard";
import AppointmentModal from "../../components/telehealth/AppointmentModal";
import FilterBar from "../../components/telehealth/FilterBar";
import DirectoryGrid from "../../components/telehealth/DirectoryGrid";
import "./DoctorDirectory.css";

export default function DoctorDirectory() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filters, setFilters] = useState({
    specialization: "all",
    language: "",
    search: "",
    minRating: "",
    availability: "",
  });
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);

  useEffect(() => {
    fetchDoctors();
  }, [filters]);

  const normalizeDisplayList = (items) => {
    if (!Array.isArray(items)) return [];
    return items
      .map((item) => {
        if (typeof item === "string") return item;
        if (!item || typeof item !== "object") return "";
        if (item.label) return String(item.label);
        if (item.name) return String(item.name);
        if (item.degree) {
          const institution = item.institution ? ` - ${item.institution}` : "";
          const year = item.year ? ` (${item.year})` : "";
          return `${item.degree}${institution}${year}`;
        }
        return "";
      })
      .filter(Boolean);
  };

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      
      // Build query params
      const params = new URLSearchParams();
      
      // Add filters to params
      if (filters.specialization && filters.specialization !== "all") {
        params.append("specialization", filters.specialization);
      }
      if (filters.language) {
        params.append("language", filters.language);
      }
      if (filters.search) {
        params.append("search", filters.search);
      }
      if (filters.minRating) {
        params.append("minRating", filters.minRating);
      }
      
      // Keep user directory synced with doctor portal profiles.
      params.append("status", "all");
      
      const response = await api.get(`/telehealth/doctors?${params.toString()}`).catch((err) => {
        console.error("Error fetching doctors:", err);
        return { data: { doctors: [] } };
      });
      
      let doctorsData = response.data?.doctors || [];
      console.log("Doctors fetched from API:", doctorsData.length);
      
      if (doctorsData.length > 0) {
        console.log("Doctor names:", doctorsData.map(d => d.user?.name || "Unknown"));
      }
      
      // Ensure all doctors have required fields for display
      const normalizedDoctors = doctorsData.map(doctor => ({
        ...doctor,
        rating: doctor.rating || { average: 0, count: 0 },
        experience: doctor.experience || 0,
        languages: normalizeDisplayList(doctor.languages),
        consultationFee: doctor.consultationFee || 0,
        location: doctor.location || { city: "", state: "", country: "India" },
      }));
      
      const mockDoctors = [
          // Gynecology
          { _id: "gyn-1", user: { name: "Dr. Patricia Brown", profilePicture: "https://randomuser.me/api/portraits/women/44.jpg" }, specialization: "Gynecology", rating: { average: 4.9, count: 223 }, experience: 16, location: { city: "New York", state: "NY" }, languages: ["English"], consultationFee: 55, videoConsultationFee: 55, chatConsultationFee: 45, availableToday: true },
          { _id: "gyn-2", user: { name: "Dr. Amanda Taylor", profilePicture: "https://randomuser.me/api/portraits/women/29.jpg" }, specialization: "Gynecology", rating: { average: 4.8, count: 191 }, experience: 13, location: { city: "Atlanta", state: "GA" }, languages: ["English", "French"], consultationFee: 52, videoConsultationFee: 52, chatConsultationFee: 42, availableToday: false, availableTomorrow: true },
          // Obstetrics
          { _id: "obs-1", user: { name: "Dr. Rachel Green", profilePicture: "https://randomuser.me/api/portraits/women/36.jpg" }, specialization: "Obstetrics", rating: { average: 4.9, count: 245 }, experience: 18, location: { city: "Philadelphia", state: "PA" }, languages: ["English"], consultationFee: 60, videoConsultationFee: 60, chatConsultationFee: 50, availableToday: true },
          { _id: "obs-2", user: { name: "Dr. Nicole White", profilePicture: "https://randomuser.me/api/portraits/women/42.jpg" }, specialization: "Obstetrics", rating: { average: 4.8, count: 178 }, experience: 11, location: { city: "Portland", state: "OR" }, languages: ["English", "Spanish"], consultationFee: 58, videoConsultationFee: 58, chatConsultationFee: 48, availableToday: true },
          // General Medicine
          { _id: "gm-1", user: { name: "Dr. Lisa Anderson", profilePicture: "https://randomuser.me/api/portraits/women/32.jpg" }, specialization: "General Medicine", rating: { average: 4.8, count: 189 }, experience: 12, location: { city: "Los Angeles", state: "CA" }, languages: ["English", "Spanish"], consultationFee: 40, videoConsultationFee: 40, chatConsultationFee: 35, availableToday: true },
          { _id: "gm-2", user: { name: "Dr. Kavitha Nair", profilePicture: "https://randomuser.me/api/portraits/women/53.jpg" }, specialization: "General Medicine", rating: { average: 4.7, count: 167 }, experience: 10, location: { city: "Miami", state: "FL" }, languages: ["English", "Hindi", "Malayalam"], consultationFee: 42, videoConsultationFee: 42, chatConsultationFee: 36, availableToday: false, availableTomorrow: true },
          // Endocrinology
          { _id: "endo-1", user: { name: "Dr. Meera Patel", profilePicture: "https://randomuser.me/api/portraits/women/55.jpg" }, specialization: "Endocrinology", rating: { average: 4.8, count: 187 }, experience: 15, location: { city: "San Diego", state: "CA" }, languages: ["English", "Hindi"], consultationFee: 55, videoConsultationFee: 55, chatConsultationFee: 45, availableToday: true },
          { _id: "endo-2", user: { name: "Dr. Sandra Lopez", profilePicture: "https://randomuser.me/api/portraits/women/57.jpg" }, specialization: "Endocrinology", rating: { average: 4.7, count: 154 }, experience: 12, location: { city: "Austin", state: "TX" }, languages: ["English", "Spanish"], consultationFee: 58, videoConsultationFee: 58, chatConsultationFee: 48, availableToday: false, availableTomorrow: true },
          // Nutrition/Dietetics
          { _id: "nutr-1", user: { name: "Dr. Jessica Walker", profilePicture: "https://randomuser.me/api/portraits/women/40.jpg" }, specialization: "Nutrition/Dietetics", rating: { average: 4.8, count: 167 }, experience: 7, location: { city: "Portland", state: "OR" }, languages: ["English"], consultationFee: 45, videoConsultationFee: 45, chatConsultationFee: 38, availableToday: true },
          { _id: "nutr-2", user: { name: "Dr. Michelle Hall", profilePicture: "https://randomuser.me/api/portraits/women/31.jpg" }, specialization: "Nutrition/Dietetics", rating: { average: 4.9, count: 189 }, experience: 11, location: { city: "San Francisco", state: "CA" }, languages: ["English", "Spanish"], consultationFee: 48, videoConsultationFee: 48, chatConsultationFee: 40, availableToday: true },
          // Mental Health
          { _id: "mh-1", user: { name: "Dr. Elizabeth Clark", profilePicture: "https://randomuser.me/api/portraits/women/35.jpg" }, specialization: "Mental Health", rating: { average: 4.8, count: 201 }, experience: 14, location: { city: "Washington", state: "DC" }, languages: ["English"], consultationFee: 65, videoConsultationFee: 65, chatConsultationFee: 55, availableToday: true },
          { _id: "mh-2", user: { name: "Dr. Anjali Verma", profilePicture: "https://randomuser.me/api/portraits/women/59.jpg" }, specialization: "Mental Health", rating: { average: 4.7, count: 148 }, experience: 9, location: { city: "Minneapolis", state: "MN" }, languages: ["English", "Hindi"], consultationFee: 62, videoConsultationFee: 62, chatConsultationFee: 52, availableToday: false, availableTomorrow: true },
          // Dermatology
          { _id: "derm-1", user: { name: "Dr. Sarah Williams", profilePicture: "https://randomuser.me/api/portraits/women/45.jpg" }, specialization: "Dermatology", rating: { average: 4.7, count: 156 }, experience: 10, location: { city: "Chicago", state: "IL" }, languages: ["English"], consultationFee: 45, videoConsultationFee: 45, chatConsultationFee: 40, availableToday: true },
          { _id: "derm-2", user: { name: "Dr. Jennifer Martinez", profilePicture: "https://randomuser.me/api/portraits/women/28.jpg" }, specialization: "Dermatology", rating: { average: 4.8, count: 198 }, experience: 14, location: { city: "San Francisco", state: "CA" }, languages: ["English", "Spanish"], consultationFee: 50, videoConsultationFee: 50, chatConsultationFee: 42, availableToday: false, availableTomorrow: true },
          // Pediatrics
          { _id: "ped-1", user: { name: "Dr. Maria Garcia", profilePicture: "https://randomuser.me/api/portraits/women/51.jpg" }, specialization: "Pediatrics", rating: { average: 4.9, count: 201 }, experience: 8, location: { city: "Seattle", state: "WA" }, languages: ["English", "Spanish"], consultationFee: 45, videoConsultationFee: 45, chatConsultationFee: 40, availableToday: true },
          { _id: "ped-2", user: { name: "Dr. Sonia Kapoor", profilePicture: "https://randomuser.me/api/portraits/women/61.jpg" }, specialization: "Pediatrics", rating: { average: 4.8, count: 176 }, experience: 11, location: { city: "Houston", state: "TX" }, languages: ["English", "Hindi"], consultationFee: 48, videoConsultationFee: 48, chatConsultationFee: 40, availableToday: true },
          // Orthopedics
          { _id: "ortho-1", user: { name: "Dr. Priya Sharma", profilePicture: "https://randomuser.me/api/portraits/women/46.jpg" }, specialization: "Orthopedics", rating: { average: 4.8, count: 174 }, experience: 14, location: { city: "Dallas", state: "TX" }, languages: ["English", "Hindi"], consultationFee: 60, videoConsultationFee: 60, chatConsultationFee: 50, availableToday: true },
          { _id: "ortho-2", user: { name: "Dr. Hannah Brooks", profilePicture: "https://randomuser.me/api/portraits/women/63.jpg" }, specialization: "Orthopedics", rating: { average: 4.7, count: 138 }, experience: 10, location: { city: "Chicago", state: "IL" }, languages: ["English"], consultationFee: 55, videoConsultationFee: 55, chatConsultationFee: 45, availableToday: false, availableTomorrow: true },
          // Cardiology
          { _id: "cardio-1", user: { name: "Dr. Emily Chen", profilePicture: "https://randomuser.me/api/portraits/women/47.jpg" }, specialization: "Cardiology", rating: { average: 4.9, count: 234 }, experience: 15, location: { city: "New York", state: "NY" }, languages: ["English", "Mandarin"], consultationFee: 50, videoConsultationFee: 50, chatConsultationFee: 40, availableToday: true },
          { _id: "cardio-2", user: { name: "Dr. Nisha Reddy", profilePicture: "https://randomuser.me/api/portraits/women/65.jpg" }, specialization: "Cardiology", rating: { average: 4.8, count: 189 }, experience: 12, location: { city: "Boston", state: "MA" }, languages: ["English", "Hindi"], consultationFee: 55, videoConsultationFee: 55, chatConsultationFee: 45, availableToday: true },
          // Oncology
          { _id: "onco-1", user: { name: "Dr. Catherine Brooks", profilePicture: "https://randomuser.me/api/portraits/women/48.jpg" }, specialization: "Oncology", rating: { average: 4.9, count: 210 }, experience: 20, location: { city: "Houston", state: "TX" }, languages: ["English"], consultationFee: 75, videoConsultationFee: 75, chatConsultationFee: 65, availableToday: false, availableTomorrow: true },
          { _id: "onco-2", user: { name: "Dr. Lakshmi Iyer", profilePicture: "https://randomuser.me/api/portraits/women/67.jpg" }, specialization: "Oncology", rating: { average: 4.8, count: 192 }, experience: 17, location: { city: "Baltimore", state: "MD" }, languages: ["English", "Hindi", "Malayalam"], consultationFee: 70, videoConsultationFee: 70, chatConsultationFee: 60, availableToday: true },
          // Urology
          { _id: "uro-1", user: { name: "Dr. Anita Desai", profilePicture: "https://randomuser.me/api/portraits/women/50.jpg" }, specialization: "Urology", rating: { average: 4.7, count: 145 }, experience: 11, location: { city: "San Jose", state: "CA" }, languages: ["English", "Hindi"], consultationFee: 55, videoConsultationFee: 55, chatConsultationFee: 45, availableToday: true },
          { _id: "uro-2", user: { name: "Dr. Rebecca Kim", profilePicture: "https://randomuser.me/api/portraits/women/69.jpg" }, specialization: "Urology", rating: { average: 4.8, count: 163 }, experience: 13, location: { city: "Seattle", state: "WA" }, languages: ["English", "Korean"], consultationFee: 58, videoConsultationFee: 58, chatConsultationFee: 48, availableToday: false, availableTomorrow: true },
        ];
      
      // Use real doctors for connected patient-doctor workflow.
      // Fallback to mock doctors only when backend has no doctors.
      const allDoctors = normalizedDoctors.length > 0 ? normalizedDoctors : mockDoctors;
      setDoctors(allDoctors);
    } catch (error) {
      console.error("Error fetching doctors:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleBookAppointment = (doctor) => {
    const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(doctor?._id || "");
    if (!isValidObjectId) {
      toast.error("Please book with a registered doctor profile to sync with doctor module.");
      return;
    }
    setSelectedDoctor(doctor);
    setShowBookingModal(true);
  };

  const handleFilterChange = (key, value) => {
    setFilters({ ...filters, [key]: value });
  };

  // Apply client-side filtering for search and specialization (backend handles other filters)
  const filteredDoctors = doctors.filter((doctor) => {
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const nameMatch = doctor.user?.name?.toLowerCase().includes(searchLower);
      const specMatch = doctor.specialization?.toLowerCase().includes(searchLower);
      if (!nameMatch && !specMatch) return false;
    }
    if (filters.specialization && filters.specialization !== "all") {
      if (doctor.specialization?.toLowerCase() !== filters.specialization.toLowerCase()) {
        return false;
      }
    }
    if (filters.minRating) {
      const rating = doctor.rating?.average || 0;
      if (rating < parseFloat(filters.minRating)) return false;
    }
    if (filters.language) {
      const languages = doctor.languages || [];
      if (!languages.some(lang => lang.toLowerCase() === filters.language.toLowerCase())) {
        return false;
      }
    }
    return true;
  });

  return (
    <div className="doctor-directory">
      {/* Page Header */}
      <div className="page-header">
        <h1>Find a Doctor</h1>
        <p className="header-subtitle">Connect with experienced healthcare professionals</p>
      </div>

      {/* Filter Bar Component */}
      <FilterBar
        filters={filters}
        onFilterChange={handleFilterChange}
        filtersOpen={filtersOpen}
        onToggleFilters={() => setFiltersOpen(!filtersOpen)}
      />

      {/* Results Count */}
      <p className="results-count">{filteredDoctors.length} doctors found</p>

      {/* Directory Grid Component */}
      <DirectoryGrid
        doctors={filteredDoctors}
        loading={loading}
        onBookAppointment={handleBookAppointment}
      />

      {/* Booking Modal */}
      {showBookingModal && selectedDoctor && (
        <BookingModal
          doctor={selectedDoctor}
          onClose={() => {
            setShowBookingModal(false);
            setSelectedDoctor(null);
          }}
        />
      )}
    </div>
  );
}

function BookingModal({ doctor, onClose }) {
  const [step, setStep] = useState(1);
  const today = new Date();
  const [formData, setFormData] = useState({
    selectedDate: today,
    selectedTime: "",
    consultationType: "video",
    addToCalendar: true,
  });
  const [loading, setLoading] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(new Date().getMonth());
  const [calendarYear, setCalendarYear] = useState(new Date().getFullYear());
  const calendarRef = useRef(null);
  const dateInputRef = useRef(null);
  const [availableDates, setAvailableDates] = useState([]);
  const [slotsByDate, setSlotsByDate] = useState({});
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [slotsError, setSlotsError] = useState("");
  const [paymentStatus, setPaymentStatus] = useState(null); // 'redirecting', 'success', 'failed'
  const [appointmentData, setAppointmentData] = useState(null);
  const [paymentError, setPaymentError] = useState(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        calendarRef.current &&
        !calendarRef.current.contains(event.target) &&
        dateInputRef.current &&
        !dateInputRef.current.contains(event.target)
      ) {
        setShowCalendar(false);
      }
    };
    if (showCalendar) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showCalendar]);

  const toDateKey = (date) => {
    const d = new Date(date);
    const y = d.getFullYear();
    const m = `${d.getMonth() + 1}`.padStart(2, "0");
    const day = `${d.getDate()}`.padStart(2, "0");
    return `${y}-${m}-${day}`;
  };

  const fetchSlotsForDate = async (date) => {
    const dateKey = toDateKey(date);
    const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(doctor?._id || "");

    if (!isValidObjectId) {
      const fallback = [
        "9:00 AM",
        "9:30 AM",
        "10:00 AM",
        "10:30 AM",
        "11:00 AM",
        "11:30 AM",
        "2:00 PM",
        "2:30 PM",
        "3:00 PM",
        "3:30 PM",
        "4:00 PM",
        "4:30 PM",
        "5:00 PM",
      ];
      setSlotsByDate((prev) => ({ ...prev, [dateKey]: fallback }));
      setAvailableSlots(fallback);
      setFormData((prev) => ({
        ...prev,
        selectedDate: date,
        selectedTime: prev.selectedTime || fallback[0],
      }));
      return;
    }

    if (slotsByDate[dateKey]) {
      setAvailableSlots(slotsByDate[dateKey]);
      setFormData((prev) => ({
        ...prev,
        selectedDate: date,
        selectedTime:
          prev.selectedDate && toDateKey(prev.selectedDate) === dateKey
            ? prev.selectedTime
            : slotsByDate[dateKey][0] || "",
      }));
      return;
    }

    try {
      setLoadingSlots(true);
      setSlotsError("");
      const res = await api.get(`/telehealth/doctors/${doctor._id}/slots?date=${dateKey}`);
      const slots = res.data?.slots || [];
      setSlotsByDate((prev) => ({ ...prev, [dateKey]: slots }));
      setAvailableSlots(slots);
      setFormData((prev) => ({
        ...prev,
        selectedDate: date,
        selectedTime:
          prev.selectedDate && toDateKey(prev.selectedDate) === dateKey
            ? prev.selectedTime
            : slots[0] || "",
      }));
    } catch (error) {
      console.error("Failed to load slots:", error);
      setAvailableSlots([]);
      setSlotsError("");
      toast.error("Unable to load slots.");
      setFormData((prev) => ({ ...prev, selectedDate: date, selectedTime: "" }));
    } finally {
      setLoadingSlots(false);
    }
  };

  useEffect(() => {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const ranges = [];
    const slotConfig = doctor?.availability?.timeSlots || [];
    for (let i = 0; i < 60; i += 1) {
      const d = new Date(todayStart);
      d.setDate(todayStart.getDate() + i);
      const dayName = d.toLocaleDateString("en-US", { weekday: "long" });
      if (slotConfig.length === 0 || slotConfig.some((slot) => slot.day === dayName)) {
        ranges.push({ date: toDateKey(d), slotCount: 1 });
      }
    }
    setAvailableDates(ranges);
    fetchSlotsForDate(todayStart);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doctor?._id]);

  const generateCalendarDays = () => {
    const firstDay = new Date(calendarYear, calendarMonth, 1);
    const lastDay = new Date(calendarYear, calendarMonth + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    const todayDate = new Date();
    todayDate.setHours(0, 0, 0, 0);

    for (let i = 0; i < startingDayOfWeek; i += 1) days.push(null);
    for (let day = 1; day <= daysInMonth; day += 1) {
      const date = new Date(calendarYear, calendarMonth, day);
      const dateKey = toDateKey(date);
      const isPast = date < todayDate;
      const hasSlots = Boolean(slotsByDate[dateKey]?.length || availableDates.some((d) => d.date === dateKey));
      days.push({ date, day, isPast, hasSlots });
    }
    return days;
  };

  const handleDateSelect = (dayObj) => {
    if (!dayObj || dayObj.isPast || !dayObj.hasSlots) return;
    fetchSlotsForDate(dayObj.date);
    setShowCalendar(false);
  };

  const handlePrevMonth = () => {
    if (calendarMonth === 0) {
      setCalendarMonth(11);
      setCalendarYear((prev) => prev - 1);
    } else {
      setCalendarMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (calendarMonth === 11) {
      setCalendarMonth(0);
      setCalendarYear((prev) => prev + 1);
    } else {
      setCalendarMonth((prev) => prev + 1);
    }
  };

  const formatDateForInput = () => {
    if (!formData.selectedDate) return "";
    const date = new Date(formData.selectedDate);
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const selected = new Date(date);
    selected.setHours(0, 0, 0, 0);
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    if (selected.getTime() === now.getTime()) return `Today, ${months[date.getMonth()]} ${date.getDate()}`;
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);
    if (selected.getTime() === tomorrow.getTime()) return `Tomorrow, ${months[date.getMonth()]} ${date.getDate()}`;
    return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
  };

  const getDoctorPhoto = (doctor) => {
    if (doctor.user?.profilePicture) {
      return getImageUrl(doctor.user.profilePicture);
    }
    return null;
  };

  const getDoctorInitials = (doctor) => {
    const name = doctor?.user?.name || "Doctor";
    return name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() || "")
      .join("") || "DR";
  };

  const getConsultationFee = () => {
    switch (formData.consultationType) {
      case "video":
        return doctor.videoConsultationFee || doctor.consultationFee || 50;
      case "chat":
        return doctor.chatConsultationFee || 40;
      case "in-person":
        return 60;
      default:
        return doctor.consultationFee || 50;
    }
  };

  const formatDate = (dateToFormat) => {
    if (!dateToFormat) return "";
    const date = new Date(dateToFormat);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selected = new Date(date);
    selected.setHours(0, 0, 0, 0);
    
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    
    if (selected.getTime() === today.getTime()) {
      return `Today, ${months[date.getMonth()]} ${date.getDate()}`;
    }
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    if (selected.getTime() === tomorrow.getTime()) {
      return `Tomorrow, ${months[date.getMonth()]} ${date.getDate()}`;
    }
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return `${days[date.getDay()]}, ${months[date.getMonth()]} ${date.getDate()}`;
  };

  const formatSelectedDate = () => formatDate(formData.selectedDate);

  const handleContinue = () => {
    if (step === 1) {
      if (formData.selectedDate && formData.selectedTime) {
        setStep(2);
      }
    } else if (step === 2) {
      if (formData.consultationType) {
        setStep(3);
      }
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      // Check if Razorpay is already loaded
      if (window.Razorpay) {
        console.log("Razorpay already loaded");
        resolve(true);
        return;
      }

      // Check if script tag already exists
      const existingScript = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
      if (existingScript) {
        console.log("Razorpay script tag exists, waiting for load...");
        existingScript.onload = () => {
          console.log("Razorpay script loaded from existing tag");
          resolve(true);
        };
        existingScript.onerror = () => {
          console.error("Razorpay script failed to load from existing tag");
          resolve(false);
        };
        // If already loaded but window.Razorpay not available, wait a bit
        setTimeout(() => {
          if (window.Razorpay) {
            resolve(true);
          } else {
            resolve(false);
          }
        }, 1000);
        return;
      }

      // Create new script tag
      console.log("Loading Razorpay script...");
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = () => {
        console.log("Razorpay script loaded successfully");
        // Give it a moment to initialize
        setTimeout(() => {
          if (window.Razorpay) {
            resolve(true);
          } else {
            console.error("Razorpay script loaded but window.Razorpay not available");
            resolve(false);
          }
        }, 100);
      };
      script.onerror = () => {
        console.error("Failed to load Razorpay script");
        resolve(false);
      };
      document.body.appendChild(script);
    });
  };

  const handlePaymentSuccess = async (paymentId, orderId, signature) => {
    try {
      const selectedDate = new Date(formData.selectedDate);
      const timeStr = formData.selectedTime;
      const [timePart, period] = timeStr.split(" ");
      const [hours, minutes] = timePart.split(":");
      let hour24 = parseInt(hours);
      if (period === "PM" && hour24 !== 12) hour24 += 12;
      if (period === "AM" && hour24 === 12) hour24 = 0;
      
      selectedDate.setHours(hour24, parseInt(minutes), 0, 0);

      // Verify payment
      try {
        await api.post("/payment/verify-payment", {
          razorpay_payment_id: paymentId,
          razorpay_order_id: orderId,
          razorpay_signature: signature,
          orderType: "appointment",
        });
      } catch (verifyError) {
        console.error("Payment verification error:", verifyError);
        // Continue even if verification fails (for mock payments)
      }

      // Create appointment in backend so doctor module and patient module stay in sync.
      const appointmentResponse = await api.post("/telehealth/appointments", {
        doctor: doctor._id,
        scheduledAt: selectedDate.toISOString(),
        consultationType: formData.consultationType,
        paymentId: paymentId,
      });

      // Prepare appointment data for success screen
      const createdAppointment = appointmentResponse?.data?.appointment;
      if (!createdAppointment?._id) {
        throw new Error("Appointment was not created after payment. Please contact support.");
      }

      const appointmentDataToSet = {
        _id: createdAppointment._id,
        appointmentNumber: createdAppointment.appointmentNumber || `APT-${Date.now()}`,
        doctor: doctor,
        scheduledAt: selectedDate.toISOString(),
        selectedDate: selectedDate,
        selectedTime: formData.selectedTime,
        consultationType: formData.consultationType,
        paymentId: paymentId,
        status: createdAppointment.status || "confirmed",
        ...createdAppointment,
      };

      setAppointmentData(appointmentDataToSet);
      setPaymentStatus("success");
      toast.success("Payment successful. Appointment booked.");
      setLoading(false);
    } catch (error) {
      console.error("Payment success handler error:", error);
      setPaymentError(error.response?.data?.message || "Failed to confirm appointment");
      setPaymentStatus("failed");
      toast.error(error.response?.data?.message || "Payment succeeded but appointment confirmation failed.");
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    try {
      const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(doctor?._id || "");
      if (!isValidObjectId) {
        throw new Error("Selected doctor is not a registered backend profile. Please choose a registered doctor.");
      }

      setLoading(true);
      setPaymentStatus("redirecting");
      setPaymentError(null);

      const consultationFee = getConsultationFee();
      const amountInPaise = Math.round(consultationFee * 100);
      
      console.log("Creating payment order with amount:", amountInPaise, "INR");

      // Create Razorpay order
      let orderResponse;
      try {
        orderResponse = await api.post("/payment/create-order", {
          amount: amountInPaise,
          currency: "INR",
          receipt: `appointment_${Date.now()}`,
          orderType: "appointment",
        });
        console.log("Order response:", orderResponse.data);
      } catch (error) {
        console.error("Error creating order:", error);
        throw new Error(error.response?.data?.message || "Failed to create payment order. Please try again.");
      }

      if (!orderResponse.data || !orderResponse.data.success) {
        console.error("Order creation failed:", orderResponse.data);
        throw new Error(orderResponse.data?.message || "Failed to create payment order");
      }

      const { order, keyId, isMock } = orderResponse.data;
      
      if (!order || !keyId) {
        console.error("Invalid order response:", orderResponse.data);
        throw new Error("Invalid payment order response. Please try again.");
      }
      
      console.log("Order created successfully:", order.id, "KeyId:", keyId, "isMock:", isMock);

      // Load Razorpay script
      console.log("Loading Razorpay script...");
      const scriptLoaded = await loadRazorpayScript();
      console.log("Script loaded:", scriptLoaded, "isMock:", isMock);
      
      if (!scriptLoaded && !isMock) {
        console.error("Failed to load Razorpay script");
        throw new Error("Failed to load payment gateway. Please refresh and try again.");
      }

      // Check if Razorpay is available
      if (!window.Razorpay) {
        console.error("window.Razorpay is not available");
        throw new Error("Payment gateway not available. Please refresh the page and try again.");
      }

      // Get user data for prefill
      const userData = JSON.parse(localStorage.getItem("user") || "{}");
      console.log("User data for prefill:", userData);

      // Real Razorpay checkout
      console.log("Creating Razorpay options...");
      const options = {
        key: keyId,
        amount: order.amount,
        currency: order.currency,
        name: "TeleHealth Platform",
        description: "Appointment with Doctor",
        order_id: order.id,
        method: {
          upi: true,
          card: true,
          netbanking: true,
          wallet: true,
          emi: false,
          paylater: false,
        },
        handler: async function (response) {
          console.log("Payment success response:", response);
          await handlePaymentSuccess(
            response.razorpay_payment_id,
            response.razorpay_order_id,
            response.razorpay_signature
          );
        },
        prefill: {
          name: userData.name || "",
          email: userData.email || "",
          contact: userData.phone || "",
        },
        theme: {
          color: "#8b5cf6",
        },
        modal: {
          ondismiss: function () {
            console.log("Razorpay modal dismissed");
            setPaymentStatus(null);
            setLoading(false);
          },
        },
      };

      console.log("Razorpay options:", options);
      console.log("Creating Razorpay instance...");
      
      try {
        const razorpay = new window.Razorpay(options);
        console.log("Razorpay instance created, opening checkout...");
        
        // Handle payment failure
        razorpay.on("payment.failed", function (response) {
          console.error("Payment failed:", response);
          const errorDescription =
            response?.error?.description || response?.error?.reason || "Payment failed. Please try again.";

          setPaymentError(errorDescription);
          setPaymentStatus("failed");
          toast.error(errorDescription);
          setLoading(false);
        });
        
        // Open Razorpay checkout
        razorpay.open();
        console.log("Razorpay checkout opened");
      } catch (error) {
        console.error("Error creating Razorpay instance:", error);
        throw new Error("Failed to initialize payment gateway: " + error.message);
      }
    } catch (error) {
      console.error("Payment error:", error);
      const message = error.response?.data?.message || error.message || "Failed to process payment";
      setPaymentError(message);
      setPaymentStatus("failed");
      toast.error(message);
      setLoading(false);
    }
  };

  const handleAddToCalendar = () => {
    if (!appointmentData) return;
    
    const startDate = new Date(appointmentData.selectedDate);
    const timeStr = appointmentData.selectedTime;
    const [timePart, period] = timeStr.split(" ");
    const [hours, minutes] = timePart.split(":");
    let hour24 = parseInt(hours);
    if (period === "PM" && hour24 !== 12) hour24 += 12;
    if (period === "AM" && hour24 === 12) hour24 = 0;
    startDate.setHours(hour24, parseInt(minutes), 0, 0);
    
    const endDate = new Date(startDate);
    endDate.setMinutes(endDate.getMinutes() + 30); // 30 min appointment
    
    const formatDate = (date) => {
      return date.toISOString().replace(/-|:|\.\d\d\d/g, "");
    };
    
    const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=Appointment with Doctor&dates=${formatDate(startDate)}/${formatDate(endDate)}&details=Appointment with Doctor - ${appointmentData.doctor.specialization}&location=TeleHealth Platform`;
    
    window.open(calendarUrl, "_blank");
  };

  const handleDownloadInvoice = () => {
    if (!appointmentData) return;
    
    const date = new Date(appointmentData.selectedDate);
    const formattedDate = date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    
    // Create a simple invoice (you can enhance this to PDF later)
    const invoiceContent = `
APPOINTMENT INVOICE
================================

Appointment Number: ${appointmentData.appointmentNumber || "N/A"}
Date: ${formattedDate}
Time: ${appointmentData.selectedTime}

Doctor Information:
  Name: Doctor
  Specialization: ${appointmentData.doctor.specialization || "N/A"}

Consultation Details:
  Type: ${appointmentData.consultationType === "video" ? "Video Call" : appointmentData.consultationType === "chat" ? "Chat Consultation" : "In-Person Visit"}
  Fee: ₹${getConsultationFee()}

Payment Status: Confirmed
Payment ID: ${appointmentData.paymentId || "N/A"}

================================
Thank you for using TeleHealth Platform!
    `;
    
    const blob = new Blob([invoiceContent], { type: "text/plain" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `appointment_invoice_${appointmentData.appointmentNumber || Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const handleGoToDashboard = () => {
    onClose();
    window.location.href = "/telehealth/appointments";
  };

  const photo = getDoctorPhoto(doctor);
  const initials = getDoctorInitials(doctor);
  const calendarDays = generateCalendarDays();
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="booking-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="booking-modal-header">
          <div className="booking-doctor-info">
            {photo ? (
              <img src={photo} alt="Doctor" className="booking-doctor-photo" />
            ) : (
              <div className="booking-doctor-avatar">{initials}</div>
            )}
            <div className="booking-doctor-details">
              <h3 className="booking-doctor-name">Doctor</h3>
              <p className="booking-doctor-specialization">{doctor.specialization}</p>
            </div>
          </div>
          <button className="booking-close-btn" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        {/* Progress Indicator */}
        <div className="booking-progress">
          <div className={`progress-step ${step >= 1 ? "active" : ""} ${step > 1 ? "completed" : ""}`}>
            <div className="progress-circle">1</div>
          </div>
          <div className={`progress-line ${step > 1 ? "completed" : ""}`}></div>
          <div className={`progress-step ${step >= 2 ? "active" : ""} ${step > 2 ? "completed" : ""}`}>
            <div className="progress-circle">2</div>
          </div>
          <div className={`progress-line ${step > 2 ? "completed" : ""}`}></div>
          <div className={`progress-step ${step >= 3 ? "active" : ""}`}>
            <div className="progress-circle">3</div>
          </div>
        </div>

        {/* Step 1: Select Date & Time */}
        {step === 1 && (
          <div className="booking-step-content">
            <div className="booking-section-title">
              <FaCalendarAlt className="section-icon" />
              <h2>Select Date & Time</h2>
            </div>

            <div className="booking-date-section">
              <label className="booking-label">Choose Date</label>
              <div className="date-input-wrapper">
                <input
                  ref={dateInputRef}
                  type="text"
                  className="date-input-field"
                  value={formatDateForInput()}
                  readOnly
                  placeholder="Select a date"
                  onClick={() => setShowCalendar(!showCalendar)}
                />
                <button
                  type="button"
                  className="calendar-icon-btn"
                  onClick={() => setShowCalendar(!showCalendar)}
                  aria-label="Open calendar"
                >
                  <FaCalendarAlt />
                </button>
                {showCalendar && (
                  <div ref={calendarRef} className="calendar-dropdown">
                    <div className="calendar-header">
                      <button type="button" className="calendar-nav-btn" onClick={handlePrevMonth}>
                        ‹
                      </button>
                      <h3 className="calendar-month-year">
                        {monthNames[calendarMonth]} {calendarYear}
                      </h3>
                      <button type="button" className="calendar-nav-btn" onClick={handleNextMonth}>
                        ›
                      </button>
                    </div>
                    <div className="calendar-weekdays">
                      {dayNames.map((day) => (
                        <div key={day} className="calendar-weekday">{day}</div>
                      ))}
                    </div>
                    <div className="calendar-days-grid">
                      {calendarDays.map((dayObj, idx) => {
                        if (!dayObj) return <div key={`empty-${idx}`} className="calendar-day empty"></div>;
                        const isSelected =
                          formData.selectedDate &&
                          dayObj.date.getDate() === formData.selectedDate.getDate() &&
                          dayObj.date.getMonth() === formData.selectedDate.getMonth() &&
                          dayObj.date.getFullYear() === formData.selectedDate.getFullYear();
                        return (
                          <button
                            key={idx}
                            type="button"
                            className={`calendar-day ${dayObj.isPast || !dayObj.hasSlots ? "past" : ""} ${isSelected ? "selected" : ""}`}
                            onClick={() => handleDateSelect(dayObj)}
                            disabled={dayObj.isPast || !dayObj.hasSlots}
                          >
                            {dayObj.day}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <AppointmentModal
              errorMessage={slotsError}
              slots={availableSlots}
              onSlotSelect={(time) => setFormData({ ...formData, selectedTime: time })}
              selectedSlot={formData.selectedTime}
              loading={loadingSlots}
            />

            <div className="booking-modal-actions">
              <button
                type="button"
                className="btn-continue"
                onClick={handleContinue}
                disabled={!formData.selectedDate || !formData.selectedTime}
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Choose Consultation Type */}
        {step === 2 && (
          <div className="booking-step-content">
            <h2 className="booking-step-title">Choose Consultation Type</h2>

            <div className="consultation-types">
              <div
                className={`consultation-type-card ${formData.consultationType === "video" ? "selected" : ""}`}
                onClick={() => setFormData({ ...formData, consultationType: "video" })}
              >
                <FaVideo className="consultation-icon" />
                <div className="consultation-info">
                  <h3>Video Call</h3>
                  <p>Face-to-face consultation via video</p>
                </div>
                <div className="consultation-price">₹{doctor.videoConsultationFee || doctor.consultationFee || 50}</div>
              </div>

              <div
                className={`consultation-type-card ${formData.consultationType === "chat" ? "selected" : ""}`}
                onClick={() => setFormData({ ...formData, consultationType: "chat" })}
              >
                <FaComments className="consultation-icon" />
                <div className="consultation-info">
                  <h3>Chat Consultation</h3>
                  <p>Text-based consultation with doctor</p>
                </div>
                <div className="consultation-price">₹{doctor.chatConsultationFee || 40}</div>
              </div>

              <div
                className={`consultation-type-card ${formData.consultationType === "in-person" ? "selected" : ""}`}
                onClick={() => setFormData({ ...formData, consultationType: "in-person" })}
              >
                <FaHome className="consultation-icon in-person-icon" />
                <div className="consultation-info">
                  <h3>In-Person Visit</h3>
                  <p>Visit doctor's clinic in person</p>
                </div>
                <div className="consultation-price">₹60</div>
              </div>
            </div>

            <div className="booking-modal-actions">
              <button type="button" className="btn-back" onClick={handleBack}>
                Back
              </button>
              <button
                type="button"
                className="btn-continue"
                onClick={handleContinue}
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Confirm Appointment */}
        {step === 3 && !paymentStatus && (
          <div className="booking-step-content">
            <h2 className="booking-step-title">Confirm Appointment</h2>

            <div className="appointment-details">
              <div className="detail-row">
                <span className="detail-label">DOCTOR:</span>
                <div className="detail-value-group">
                  <span className="detail-value-bold">{doctor.user?.name || "Doctor"}</span>
                  <span className="detail-value-sub">{doctor.specialization}</span>
                </div>
              </div>

              <div className="detail-row">
                <span className="detail-label">DATE & TIME:</span>
                <span className="detail-value-bold">
                  {formatSelectedDate()} at {formData.selectedTime}
                </span>
              </div>

              <div className="detail-row">
                <span className="detail-label">CONSULTATION TYPE:</span>
                <span className="detail-value-bold">
                  {formData.consultationType === "video" ? "Video Call" : formData.consultationType === "chat" ? "Chat Consultation" : "In-Person Visit"}
                </span>
              </div>

              <div className="detail-row">
                <span className="detail-label">CONSULTATION FEE:</span>
                <span className="detail-value-bold">₹{getConsultationFee()}</span>
              </div>
            </div>

            <div className="calendar-checkbox">
              <label>
                <input
                  type="checkbox"
                  checked={formData.addToCalendar}
                  onChange={(e) => setFormData({ ...formData, addToCalendar: e.target.checked })}
                />
                <span>Add this appointment to my calendar and send me reminders.</span>
              </label>
            </div>

            <div className="booking-modal-actions">
              <button type="button" className="btn-back" onClick={handleBack}>
                Back
              </button>
              <button
                type="button"
                className="btn-confirm-pay"
                onClick={handleConfirm}
                disabled={loading}
              >
                {loading ? "Processing..." : "Confirm & Pay"}
              </button>
            </div>
          </div>
        )}

        {/* Payment Redirecting Screen */}
        {paymentStatus === "redirecting" && (
          <div className="booking-step-content payment-status-screen">
            <div className="payment-loading">
              <div className="spinner"></div>
              <h2>Redirecting to secure payment...</h2>
              <p>Please wait while we redirect you to the payment gateway.</p>
            </div>
          </div>
        )}

        {/* Payment Success Screen */}
        {paymentStatus === "success" && appointmentData && (
          <div className="booking-step-content payment-status-screen">
            <div className="payment-success">
              <div className="success-icon">✓</div>
              <h2>Your appointment with {appointmentData.doctor?.user?.name || "Doctor"} is confirmed!</h2>
              
              <div className="appointment-summary-card">
                <div className="summary-row">
                  <span className="summary-label">Doctor:</span>
                  <div className="summary-value-group">
                    <span className="summary-value-bold">{appointmentData.doctor?.user?.name || "Doctor"}</span>
                    <span className="summary-value-sub">{appointmentData.doctor.specialization}</span>
                  </div>
                </div>
                <div className="summary-row">
                  <span className="summary-label">Date & Time:</span>
                  <span className="summary-value-bold">
                    {formatDate(appointmentData.selectedDate)} at {appointmentData.selectedTime}
                  </span>
                </div>
                <div className="summary-row">
                  <span className="summary-label">Consultation Type:</span>
                  <span className="summary-value-bold">
                    {appointmentData.consultationType === "video" ? "Video Call" : appointmentData.consultationType === "chat" ? "Chat Consultation" : "In-Person Visit"}
                  </span>
                </div>
                <div className="summary-row">
                  <span className="summary-label">Appointment Number:</span>
                  <span className="summary-value-bold">{appointmentData.appointmentNumber || "N/A"}</span>
                </div>
              </div>

              <div className="payment-success-actions">
                <button
                  type="button"
                  className="btn-add-calendar"
                  onClick={handleAddToCalendar}
                >
                  <FaCalendarAlt /> Add to Calendar
                </button>
                <button
                  type="button"
                  className="btn-download-invoice"
                  onClick={handleDownloadInvoice}
                >
                  <FaDownload /> Download Invoice
                </button>
              </div>

              <div className="payment-success-cta">
                <button
                  type="button"
                  className="btn-go-dashboard"
                  onClick={handleGoToDashboard}
                >
                  Go to Dashboard
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Payment Failed Screen */}
        {paymentStatus === "failed" && (
          <div className="booking-step-content payment-status-screen">
            <div className="payment-failed">
              <div className="error-icon">✕</div>
              <h2>Payment Failed</h2>
              <p className="error-message">
                {paymentError || "Payment failed. Please try again or choose another payment method."}
              </p>
              <div className="payment-failed-actions">
                <button
                  type="button"
                  className="btn-retry-payment"
                  onClick={() => {
                    setPaymentStatus(null);
                    setPaymentError(null);
                    handleConfirm();
                  }}
                >
                  Try Again
                </button>
                <button
                  type="button"
                  className="btn-back"
                  onClick={() => {
                    setPaymentStatus(null);
                    setPaymentError(null);
                  }}
                >
                  Go Back
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
