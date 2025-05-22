import React, { useState } from 'react';
import { assets } from '../assets/assets';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const AI = () => {
    const navigate = useNavigate();
    // Chat state
    const [messages, setMessages] = useState([
        { type: 'bot', content: 'Hello! I\'m your AI health assistant. How can I help you today?' }
    ]);
    const [currentMessage, setCurrentMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    
    // Voice chat modal state
    const [showVoiceModal, setShowVoiceModal] = useState(false);
    const [voiceDetails, setVoiceDetails] = useState({
        name: '',
        phone: '',
        preferredTime: ''
    });

    const SUGGESTED_QUERIES = [
        { label: "Ask Precautions", message: "What precautions should I take for my condition?" },
        { label: "Get Medication", message: "What medications or remedies can help with my symptoms?" },
        { label: "Find Diet", message: "Suggest some diet changes that I should do." },
        { label: "Possible Disease", message: "What could be the possible diseases or causes for my symptoms?" },
        { label: "Workout Advice", message: "What kind of workout or exercise is suitable for my condition?" }
    ];

    const handleChat = async (e) => {
        e.preventDefault();
        if (!currentMessage.trim()) return;

        const userMessage = currentMessage;
        setCurrentMessage('');
        setMessages(prev => [...prev, { type: 'user', content: userMessage }]);
        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ userMessage })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: { message: 'Unknown error occurred' } }));
                console.error('API Error:', errorData);
                throw new Error(errorData.error?.message || `API Error: ${response.status}`);
            }

            const data = await response.json();
            
            if (!data.response) {
                console.error('Invalid API Response:', data);
                throw new Error('Invalid response format from API');
            }

            setMessages(prev => [...prev, { type: 'bot', content: data.response }]);
        } catch (err) {
            console.error('Chat error:', err);
            setError(err.message);
            toast.error('Unable to get response. Please try again in a moment.');
            setMessages(prev => [...prev, { 
                type: 'bot', 
                content: 'I apologize, but I\'m having trouble processing your request right now. Please try again in a moment.'
            }]);
        } finally {
            setLoading(false);
        }
    };

    const handleVoiceChatSubmit = (e) => {
        e.preventDefault();
        // Here you would typically make an API call to schedule the voice chat
        toast.success('Voice chat request received! We will call you shortly.');
        setShowVoiceModal(false);
        setVoiceDetails({ name: '', phone: '', preferredTime: '' });
    };

    // New handler for pill click
    const handlePillClick = async (pillMessage) => {
        if (!pillMessage.trim()) return;
        setCurrentMessage('');
        setMessages(prev => [...prev, { type: 'user', content: pillMessage }]);
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ userMessage: pillMessage })
            });
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: { message: 'Unknown error occurred' } }));
                throw new Error(errorData.error?.message || `API Error: ${response.status}`);
            }
            const data = await response.json();
            if (!data.response) {
                throw new Error('Invalid response format from API');
            }
            setMessages(prev => [...prev, { type: 'bot', content: data.response }]);
        } catch (err) {
            setError(err.message);
            toast.error('Unable to get response. Please try again in a moment.');
            setMessages(prev => [...prev, { 
                type: 'bot', 
                content: 'I apologize, but I\'m having trouble processing your request right now. Please try again in a moment.'
            }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto py-8 px-4">
            <div className="flex gap-8 items-start">
                {/* Chat Interface */}
                <div className="flex-1 max-w-3xl">
                    <div className="w-full bg-white rounded-lg shadow-lg overflow-hidden relative min-h-[70vh]">
                        <div className="h-[70vh] flex flex-col relative">
                            {/* Chat Header */}
                            <div className="bg-gray-800 p-4 border-b">
                                <h2 className="text-2xl font-bold text-white mb-1">DR. AI</h2>
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                                    <p className="text-sm text-white/90">Online</p>
                                </div>
                            </div>
                            
                            {/* Chat Messages */}
                            <div className="flex-1 p-4 overflow-y-auto bg-gray-50 relative">
                                {/* Background Image at the bottom */}
                                {messages.length === 1 && (
                                    <div className="absolute left-0 right-0 bottom-0 z-10 flex items-end justify-center pointer-events-none h-1/2">
                                        <img 
                                            src={assets.dr_ai_image} 
                                            alt="AI Doctor"
                                            className="w-64 h-64 object-contain"
                                        />
                                    </div>
                                )}
                                
                                <div className="space-y-4 relative z-20">
                                    {messages.map((message, index) => (
                                        <div
                                            key={index}
                                            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
                                        >
                                            <div
                                                className={`max-w-[80%] rounded-lg p-3 ${
                                                    message.type === 'user'
                                                        ? 'bg-primary text-white'
                                                        : 'bg-white text-gray-800 shadow-sm'
                                                }`}
                                            >
                                                {message.content}
                                            </div>
                                        </div>
                                    ))}
                                    {loading && (
                                        <div className="flex justify-start animate-fade-in">
                                            <div className="bg-white text-gray-800 shadow-sm rounded-lg p-3">
                                                <div className="flex gap-2">
                                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                            {/* Option Pills */}
                            <div className="flex gap-2 mb-2 flex-wrap px-4 pt-2 bg-white border-t">
                              {SUGGESTED_QUERIES.map((pill, idx) => (
                                <button
                                  key={idx}
                                  type="button"
                                  className="bg-gray-200 text-gray-800 px-4 py-1 rounded-full hover:bg-primary hover:text-white transition"
                                  onClick={() => handlePillClick(pill.message)}
                                >
                                  {pill.label}
                                </button>
                              ))}
                            </div>
                            
                            {/* Chat Input */}
                            <form onSubmit={handleChat} className="border-t p-4 bg-white">
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={currentMessage}
                                        onChange={(e) => setCurrentMessage(e.target.value)}
                                        placeholder="Type your message..."
                                        className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                                        disabled={loading}
                                    />
                                    <button
                                        type="submit"
                                        className={`bg-primary text-white px-6 py-2 rounded-lg transition-all ${
                                            loading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-opacity-90'
                                        }`}
                                        disabled={loading}
                                    >
                                        {loading ? 'Sending...' : 'Send'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
                
                {/* Navigation Button - Right Side */}
                <div className="w-64 flex flex-col justify-center h-[70vh] text-center space-y-6 ml-16">
                    <div className="space-y-4">
                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <h4 className="text-xl font-semibold text-gray-800 mb-2">Get a Call from AI Assistant</h4>
                            <p className="text-gray-600 mb-4">Prefer speaking over typing? Our AI will call you at your preferred time.</p>
                            <button 
                                onClick={() => setShowVoiceModal(true)}
                                className="w-full bg-gray-800 text-white px-6 py-3 rounded-full hover:bg-opacity-90 transition-all text-base font-semibold"
                            >
                                Schedule AI Call
                            </button>
                        </div>
                    </div>

                    <div className="border-t pt-6 mt-6">
                        <h3 className="text-2xl font-bold text-gray-800 mb-4">
                            Need to see a doctor?
                        </h3>
                        <p className="text-gray-600 mb-4">If you need professional medical attention, we can help you book an appointment with our doctors.</p>
                        <button 
                            onClick={() => {
                                navigate('/');
                                setTimeout(() => {
                                    const specialitySection = document.getElementById('speciality');
                                    if (specialitySection) {
                                        specialitySection.scrollIntoView({ behavior: 'smooth' });
                                    }
                                }, 100);
                            }}
                            className="w-full bg-primary text-white px-6 py-3 rounded-full hover:bg-opacity-90 transition-all text-base font-semibold"
                        >
                            Book Doctor Appointment
                        </button>
                    </div>
                </div>

                {/* Voice Chat Modal */}
                {showVoiceModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-xl font-semibold text-gray-800">Schedule AI Call</h3>
                                <button 
                                    onClick={() => setShowVoiceModal(false)}
                                    className="text-gray-500 hover:text-gray-700"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                            <form onSubmit={handleVoiceChatSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Your Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={voiceDetails.name}
                                        onChange={(e) => setVoiceDetails(prev => ({ ...prev, name: e.target.value }))}
                                        className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                                        placeholder="Enter your name"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                                    <input
                                        type="tel"
                                        required
                                        value={voiceDetails.phone}
                                        onChange={(e) => setVoiceDetails(prev => ({ ...prev, phone: e.target.value }))}
                                        className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                                        placeholder="Enter your phone number"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Time</label>
                                    <input
                                        type="datetime-local"
                                        required
                                        value={voiceDetails.preferredTime}
                                        onChange={(e) => setVoiceDetails(prev => ({ ...prev, preferredTime: e.target.value }))}
                                        className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="w-full bg-primary text-white px-6 py-3 rounded-lg hover:bg-opacity-90 transition-all"
                                >
                                    Request Call
                                </button>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AI; 