import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  FaSearch, FaCheck, FaBox, FaTruck, 
  FaArrowLeft, FaWrench, FaCog, FaClipboardCheck
} from "react-icons/fa";
import { appointmentAPI } from "../services/api";
import { useToast } from "../Component/Toast";
import Navbar from "../Component/Navbar";

const TrackRepair = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [token, setToken] = useState("");
  const [repair, setRepair] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleTrack = async (e) => {
    e.preventDefault();
    if (!token.trim()) return;
    
    setLoading(true);
    setError("");
    setRepair(null);
    
    try {
      const response = await appointmentAPI.getRepairStatus(token.trim());
      const repairData = response?.data ?? response;
      setRepair(repairData);
      toast.success("Repair status found!");
    } catch (err) {
      const message = err?.message || "Repair not found. Please check your token.";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const statusSteps = [
    { key: 'received', label: 'Received', icon: FaBox },
    { key: 'diagnosing', label: 'Diagnosing', icon: FaSearch },
    { key: 'in_progress', label: 'Repairing', icon: FaWrench },
    { key: 'waiting_parts', label: 'Waiting Parts', icon: FaCog },
    { key: 'completed', label: 'Completed', icon: FaClipboardCheck },
    { key: 'ready_pickup', label: 'Ready for Pickup', icon: FaTruck },
  ];
  
  const getStepIndex = (status) => {
    const index = statusSteps.findIndex(s => s.key === status);
    return index >= 0 ? index : 0;
  };

  const currentStepIndex = repair ? getStepIndex(repair.status) : -1;

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 pt-20">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-12">
          <div className="max-w-3xl mx-auto px-4">
            <button 
              onClick={() => navigate(-1)} 
              className="flex items-center gap-2 text-white/80 hover:text-white mb-4"
            >
              <FaArrowLeft /> Back
            </button>
            <h1 className="text-3xl font-bold">Track Your Repair</h1>
            <p className="text-white/80 mt-2">Enter the repair token sent to your email</p>
          </div>
        </div>

        {/* Search Box */}
        <div className="max-w-3xl mx-auto px-4 -mt-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <form onSubmit={handleTrack} className="flex gap-3">
              <input
                type="text"
                value={token}
                onChange={(e) => setToken(e.target.value.toUpperCase())}
                placeholder="Enter Token (e.g., RPR-XXXXX)"
                className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 font-mono text-lg"
              />
              <button
                type="submit"
                disabled={loading || !token.trim()}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
              >
                {loading ? "..." : "Track"}
              </button>
            </form>

            {error && (
              <div className="mt-4 bg-red-50 text-red-600 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}
          </div>
        </div>

        {/* Repair Details */}
        {repair && (
          <div className="max-w-3xl mx-auto px-4 py-8">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              {/* Token & Status Header */}
              <div className="bg-gray-800 text-white p-6">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-gray-400 text-sm">Repair Token</p>
                    <p className="text-xl font-mono font-bold">{repair.repairToken}</p>
                  </div>
                  <div className={`px-4 py-2 rounded-full text-sm font-semibold ${
                    repair.status === 'ready_pickup' 
                      ? 'bg-green-500 text-white' 
                      : 'bg-blue-500 text-white'
                  }`}>
                    {repair.status === 'ready_pickup' ? '✅ Ready for Pickup' : 
                     statusSteps[currentStepIndex]?.label || repair.status}
                  </div>
                </div>
              </div>

              {/* Progress Steps */}
              <div className="p-6 border-b">
                <h3 className="font-semibold mb-4">Repair Progress</h3>
                <div className="flex justify-between">
                  {statusSteps.map((step, index) => {
                    const StepIcon = step.icon;
                    const isCompleted = index <= currentStepIndex;
                    const isCurrent = index === currentStepIndex;
                    
                    return (
                      <div key={step.key} className="flex flex-col items-center flex-1">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          isCompleted 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-gray-200 text-gray-400'
                        } ${isCurrent ? 'ring-4 ring-blue-200' : ''}`}>
                          {isCompleted && index < currentStepIndex ? (
                            <FaCheck />
                          ) : (
                            <StepIcon />
                          )}
                        </div>
                        <span className={`text-xs mt-2 text-center ${isCompleted ? 'text-gray-800' : 'text-gray-400'}`}>
                          {step.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Appointment Details */}
              {repair.Appointment && (
                <div className="p-6 border-b">
                  <h3 className="font-semibold mb-3">Device Information</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Device</p>
                      <p className="font-medium">{repair.Appointment.deviceType}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Brand</p>
                      <p className="font-medium">{repair.Appointment.deviceBrand || '-'}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-gray-500">Issue</p>
                      <p className="font-medium">{repair.Appointment.issueDescription}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Technician Updates */}
              <div className="p-6 bg-blue-50">
                <h3 className="font-semibold mb-3 text-blue-800">Technician Updates</h3>
                <div className="space-y-3">
                  {repair.estimatedCost && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Estimated Cost:</span>
                      <span className="font-semibold text-green-600">NPR {repair.estimatedCost}</span>
                    </div>
                  )}
                  {repair.finalCost && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Final Cost:</span>
                      <span className="font-bold text-green-600">NPR {repair.finalCost}</span>
                    </div>
                  )}
                  {repair.technicianNotes && (
                    <div className="mt-3 p-3 bg-white rounded-lg">
                      <p className="text-gray-500 text-sm mb-1">Notes:</p>
                      <p className="text-gray-800">{repair.technicianNotes}</p>
                    </div>
                  )}
                  {!repair.estimatedCost && !repair.finalCost && !repair.technicianNotes && (
                    <p className="text-gray-500 italic">No updates from technician yet.</p>
                  )}
                </div>
              </div>

              {/* Ready for Pickup Notice */}
              {repair.status === 'ready_pickup' && (
                <div className="p-6 bg-green-50 border-t border-green-200">
                  <div className="flex items-center gap-3">
                    <FaTruck className="text-green-600 text-2xl" />
                    <div>
                      <p className="font-semibold text-green-800">Your device is ready!</p>
                      <p className="text-sm text-green-600">Please visit our service center to collect it.</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Completed Date */}
              {repair.completedAt && (
                <div className="px-6 py-3 bg-gray-50 text-sm text-gray-500">
                  Completed on: {new Date(repair.completedAt).toLocaleString()}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default TrackRepair;
