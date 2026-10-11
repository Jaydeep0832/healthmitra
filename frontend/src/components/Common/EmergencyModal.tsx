import React, { useState } from 'react';
import { Phone, AlertTriangle, X, ShieldAlert, HeartPulse, Hospital, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface EmergencyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const emergencyNumbers = [
  {
    service: 'National Ambulance',
    number: '108',
    desc: 'Toll-free 24/7 emergency medical response & basic/advanced life support',
    badge: 'Immediate Medical',
    color: 'bg-red-50 text-red-700 border-red-200',
    btnColor: 'bg-red-600 hover:bg-red-700 text-white',
  },
  {
    service: 'All-in-One National Emergency',
    number: '112',
    desc: 'Integrated emergency response for Police, Fire, and Ambulance across India',
    badge: 'Emergency Services',
    color: 'bg-blue-50 text-blue-700 border-blue-200',
    btnColor: 'bg-blue-600 hover:bg-blue-700 text-white',
  },
  {
    service: 'State Health Advice Helpline',
    number: '104',
    desc: 'Round-the-clock telephonic medical consultation and minor ailment guidance',
    badge: '24x7 Doctor Advice',
    color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    btnColor: 'bg-emerald-600 hover:bg-emerald-700 text-white',
  },
  {
    service: "Women's Emergency Helpline",
    number: '1091',
    desc: 'Immediate distress response and security assistance for women',
    badge: 'Safety Helpline',
    color: 'bg-purple-50 text-purple-700 border-purple-200',
    btnColor: 'bg-purple-600 hover:bg-purple-700 text-white',
  },
];

export default function EmergencyModal({ isOpen, onClose }: EmergencyModalProps) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'helplines' | 'firstaid'>('helplines');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-red-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-red-600 via-rose-600 to-red-700 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-white/20 backdrop-blur rounded-2xl animate-pulse">
                <ShieldAlert className="h-7 w-7 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-black tracking-tight flex items-center gap-2">
                  Emergency Medical SOS <span className="text-xs bg-white text-red-600 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Active</span>
                </h2>
                <p className="text-red-100 text-sm mt-0.5">
                  If this is a life-threatening situation, dial 108 or 112 immediately.
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-full transition"
              aria-label="Close"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Tab buttons */}
          <div className="flex space-x-2 mt-5">
            <button
              onClick={() => setActiveTab('helplines')}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition flex items-center gap-1.5 ${
                activeTab === 'helplines'
                  ? 'bg-white text-red-700 shadow-md'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              <Phone className="h-4 w-4" /> Emergency Contacts
            </button>
            <button
              onClick={() => setActiveTab('firstaid')}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition flex items-center gap-1.5 ${
                activeTab === 'firstaid'
                  ? 'bg-white text-red-700 shadow-md'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              <HeartPulse className="h-4 w-4" /> Life-Saving First Aid
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[65vh] overflow-y-auto">
          {activeTab === 'helplines' ? (
            <div className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-3">
                {emergencyNumbers.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl border border-gray-100 bg-gray-50/70 hover:bg-white hover:border-gray-200 hover:shadow-md transition group flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-white text-gray-700 border border-gray-200">
                          {item.badge}
                        </span>
                        <span className="text-xl font-black text-gray-900 group-hover:text-red-600 transition">
                          {item.number}
                        </span>
                      </div>
                      <h3 className="font-bold text-gray-900 text-sm mb-1">{item.service}</h3>
                      <p className="text-xs text-gray-500 leading-relaxed mb-4">{item.desc}</p>
                    </div>
                    <a
                      href={`tel:${item.number}`}
                      className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition ${item.btnColor}`}
                    >
                      <Phone className="h-3.5 w-3.5" /> Call {item.number} Now
                    </a>
                  </div>
                ))}
              </div>

              {/* Direct hospital action banner */}
              <div className="mt-4 p-4 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 bg-blue-600 text-white rounded-xl">
                    <Hospital className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-sm">Need immediate emergency room?</h4>
                    <p className="text-xs text-gray-600">Find 24/7 ICU & trauma hospitals with available beds nearby.</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    onClose();
                    navigate('/hospitals');
                  }}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl flex items-center gap-1 transition shadow-sm"
                >
                  Locate Hospitals <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4 text-sm text-gray-700">
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-800 leading-relaxed">
                  <strong>Important:</strong> First aid steps are supportive measures while waiting for emergency responders (108). Do not delay calling medical professionals.
                </p>
              </div>

              <div className="border border-gray-100 rounded-2xl divide-y divide-gray-100 overflow-hidden">
                <div className="p-4 bg-white">
                  <h4 className="font-bold text-gray-900 mb-1 flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-red-600" /> Suspected Heart Attack / Chest Pain
                  </h4>
                  <ul className="text-xs text-gray-600 space-y-1 list-disc list-inside mt-2">
                    <li>Have patient rest immediately in a comfortable seated position (W-position against wall).</li>
                    <li>Loosen tight clothing around neck and chest.</li>
                    <li>Only give aspirin if an emergency dispatcher or treating clinician specifically instructs you to do so.</li>
                    <li>Do not give heavy food, drink, or allow patient to walk or exert.</li>
                  </ul>
                </div>

                <div className="p-4 bg-white">
                  <h4 className="font-bold text-gray-900 mb-1 flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-blue-600" /> Severe Bleeding & Trauma
                  </h4>
                  <ul className="text-xs text-gray-600 space-y-1 list-disc list-inside mt-2">
                    <li>Apply continuous, firm direct pressure using a clean cloth or sterile bandage.</li>
                    <li>Elevate the injured limb above heart level if no fractures are suspected.</li>
                    <li>Do not remove embedded objects; stabilize them with cloth rolls around the object.</li>
                  </ul>
                </div>

                <div className="p-4 bg-white">
                  <h4 className="font-bold text-gray-900 mb-1 flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-purple-600" /> Stroke Recognition (F.A.S.T.)
                  </h4>
                  <ul className="text-xs text-gray-600 space-y-1 list-disc list-inside mt-2">
                    <li><strong>Face:</strong> Ask the person to smile. Does one side of the face droop?</li>
                    <li><strong>Arms:</strong> Ask to raise both arms. Does one arm drift downward?</li>
                    <li><strong>Speech:</strong> Is their speech slurred or strange?</li>
                    <li><strong>Time:</strong> Call 108 immediately if any of these signs appear! Note exact onset time.</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
          <span>National Emergency Response Support System (ERSS)</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg border border-gray-300 font-medium text-gray-700 hover:bg-gray-100 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
