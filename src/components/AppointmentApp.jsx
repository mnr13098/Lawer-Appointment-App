import React, { useState, createContext, useContext, useReducer } from 'react';
import { Calendar } from 'lucide-react';

// Mock Data remains the same
const mockLawyers = [
  {
    id: 1,
    name: " Ganesh ",
    specialties: ["Criminal Law", "Property Law"],
    availability: {
      monday: ["09:00", "09:30", "10:00", "10:30"],
      tuesday: ["14:00", "14:30", "15:00", "15:30"],
      wednesday: ["11:00", "11:30", "12:00", "12:30"]
    },
    costPerAppointment: 200
  },
  {
    id: 2,
    name: " Narasimha Reddy ",
    specialties: ["Divorce Law", "Family Law"],
    availability: {
      monday: ["13:00", "13:30", "14:00", "14:30"],
      thursday: ["10:00", "10:30", "11:00", "11:30"],
      friday: ["15:00", "15:30", "16:00", "16:30"]
    },
    costPerAppointment: 250
  }
];

const specialties = ["Criminal Law", "Property Law", "Divorce Law", "Family Law"];

// Utility function to get day of week
const getDayOfWeek = (date) => {
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  return days[date.getDay()];
};

// Reducer for appointments
const appointmentReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_APPOINTMENT':
      return [...state, action.payload];
    default:
      return state;
  }
};

// Custom Select Component
const Select = ({ value, onChange, options, placeholder }) => (
  <select 
    value={value} 
    onChange={(e) => onChange(e.target.value)}
    className="w-full p-2 border rounded-lg bg-white"
  >
    <option value="">{placeholder}</option>
    {options.map(({ value: optionValue, label, disabled }) => (
      <option key={optionValue} value={optionValue} disabled={disabled}>
        {label}
      </option>
    ))}
  </select>
);

// Main App Component
const AppointmentApp = () => {
  const [appointments, dispatch] = useReducer(appointmentReducer, []);
  const [activeTab, setActiveTab] = useState('book');
  const [selectedSpecialty, setSelectedSpecialty] = useState("");
  const [selectedLawyer, setSelectedLawyer] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState("");
  const [error, setError] = useState("");

  const filteredLawyers = mockLawyers.filter(lawyer => 
    lawyer.specialties.includes(selectedSpecialty)
  );

  const getAvailableTimesForDate = (lawyer, date) => {
    if (!lawyer) return [];
    const dayOfWeek = getDayOfWeek(date);
    console.log('Day of week:', dayOfWeek); // Debug log
    console.log('Available times:', lawyer.availability[dayOfWeek]); // Debug log
    return lawyer.availability[dayOfWeek] || [];
  };

  const isTimeSlotAvailable = (lawyer, date, time) => {
    const existingAppointments = appointments.filter(
      app => app.lawyerId === lawyer.id && 
      app.date === date.toISOString() && 
      app.time === time
    );
    return existingAppointments.length === 0;
  };

  const handleBookAppointment = () => {
    if (!selectedLawyer || !selectedDate || !selectedTime) {
      setError("Please select all required fields");
      return;
    }

    if (!isTimeSlotAvailable(selectedLawyer, selectedDate, selectedTime)) {
      setError("Appointment not available");
      return;
    }

    const appointment = {
      id: Date.now(),
      lawyerId: selectedLawyer.id,
      lawyerName: selectedLawyer.name,
      date: selectedDate.toISOString(),
      time: selectedTime,
      specialty: selectedSpecialty,
      cost: selectedLawyer.costPerAppointment
    };

    dispatch({ type: 'ADD_APPOINTMENT', payload: appointment });
    setError("Appointment booked successfully!");
    
    // Reset form
    setSelectedTime("");
  };

  const handleDateChange = (e) => {
    const newDate = new Date(e.target.value);
    // Set time to noon to avoid timezone issues
    newDate.setHours(12, 0, 0, 0);
    setSelectedDate(newDate);
    // Clear selected time when date changes
    setSelectedTime("");
  };

  // Generate time slot options
  const getTimeSlotOptions = (lawyer, date) => {
    const availableTimes = getAvailableTimesForDate(lawyer, date);
    return availableTimes.map(time => ({
      value: time,
      label: time,
      disabled: !isTimeSlotAvailable(lawyer, date, time)
    }));
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="bg-white rounded-lg shadow-lg">
        {/* Tabs */}
        <div className="flex border-b">
          <button 
            className={`px-4 py-2 ${activeTab === 'book' ? 'border-b-2 border-blue-500' : ''}`}
            onClick={() => setActiveTab('book')}
          >
            Book Appointment
          </button>
          <button 
            className={`px-4 py-2 ${activeTab === 'history' ? 'border-b-2 border-blue-500' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            Appointment History
          </button>
        </div>

        {/* Booking Form */}
        {activeTab === 'book' && (
          <div className="p-6 space-y-4">
            <h2 className="text-2xl font-bold mb-4">Book a Lawyer Appointment</h2>
            
            <div className="space-y-4">
              <Select
                value={selectedSpecialty}
                onChange={setSelectedSpecialty}
                options={specialties.map(specialty => ({
                  value: specialty,
                  label: specialty
                }))}
                placeholder="Select Specialty"
              />

              {selectedSpecialty && (
                <Select
                  value={selectedLawyer?.id || ''}
                  onChange={(id) => {
                    setSelectedLawyer(mockLawyers.find(l => l.id === parseInt(id)));
                    setSelectedTime(""); // Reset time when lawyer changes
                  }}
                  options={filteredLawyers.map(lawyer => ({
                    value: lawyer.id.toString(),
                    label: `${lawyer.name} - $${lawyer.costPerAppointment}`
                  }))}
                  placeholder="Select Lawyer"
                />
              )}

              {selectedLawyer && (
                <>
                  <div className="border rounded-lg p-4">
                    <input
                      type="date"
                      value={selectedDate.toISOString().split('T')[0]}
                      onChange={handleDateChange}
                      className="w-full p-2 border rounded"
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>

                  {selectedDate && (
                    <div>
                      <p className="text-sm text-gray-600 mb-2">
                        Available times for {getDayOfWeek(selectedDate)}:
                      </p>
                      <Select
                        value={selectedTime}
                        onChange={setSelectedTime}
                        options={getTimeSlotOptions(selectedLawyer, selectedDate)}
                        placeholder="Select Time"
                      />
                    </div>
                  )}

                  <button 
                    onClick={handleBookAppointment}
                    className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600"
                  >
                    Book Appointment
                  </button>

                  {error && (
                    <div className={`p-4 rounded-lg ${
                      error.includes("successfully") ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                    }`}>
                      {error}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {/* Appointment History */}
        {activeTab === 'history' && (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">Appointment History</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Lawyer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Specialty</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cost</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {appointments.map(appointment => (
                    <tr key={appointment.id}>
                      <td className="px-6 py-4 whitespace-nowrap">{appointment.lawyerName}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{appointment.specialty}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {new Date(appointment.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">{appointment.time}</td>
                      <td className="px-6 py-4 whitespace-nowrap">${appointment.cost}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AppointmentApp;