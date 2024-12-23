import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';

const DashFarmer = () => {
  const [activeSection, setActiveSection] = useState('Crop Recommendation');
  const [formData, setFormData] = useState({
    Nitrogen: '',
    Phosphorus: '',
    Potassium: '',
    Ph: '',
    Rainfall: '',
    location: '',
  });
  const [step, setStep] = useState(1);
  const [result, setResult] = useState('');
  const [cropImage, setCropImage] = useState('');  // State to store crop image
  const [error, setError] = useState(''); // Single error message for the form
  const [loading, setLoading] = useState(false); // Loading state
  const [loadingStep, setLoadingStep] = useState(null); // Track which step is loading

  const sidebarItems = [
    { title: 'Crop Recommendation' },
    { title: 'Log Complaint' },
    { title: 'Market Insights' },
  ];

  // Reset form data when switching sections
  useEffect(() => {
    if (activeSection !== 'Crop Recommendation') {
      setFormData({
        Nitrogen: '',
        Phosphorus: '',
        Potassium: '',
        Ph: '',
        Rainfall: '',
        location: '',
      });
      setStep(1); // Reset to step 1
      setResult('');
      setCropImage('');
      setError('');
      setLoading(false);
      setLoadingStep(null);
    }
  }, [activeSection]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const validateForm = () => {
    let errorMessage = '';
    if (step === 1) {
      if (!formData.Nitrogen || !formData.Phosphorus || !formData.Potassium) {
        errorMessage = 'All soil parameters (Nitrogen, Phosphorus, Potassium) are required.';
      }
    }
    if (step === 2) {
      if (!formData.location) {
        errorMessage = 'Location is required.';
      }
    }
    if (step === 3) {
      if (!formData.Ph || !formData.Rainfall) {
        errorMessage = 'Both Ph and Rainfall are required.';
      }
    }
    setError(errorMessage);
    return !errorMessage; // Return true if there is no error
  };

  const handleNextStep = (nextStep) => {
    if (validateForm()) {
      setLoadingStep(nextStep);
      setLoading(true);
      setTimeout(() => {
        setStep(nextStep);
        setLoading(false);
        setLoadingStep(null); // Reset loading step
      }, 1000); // Simulate loading time (1 second)
    }
  };

  const handlePrevStep = () => {
    if (step > 1) {
      setStep(step - 1); // Go to previous step
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!validateForm()) {
      return; // Prevent submission if form is invalid
    }
    setLoadingStep(3); // Loading for Crop Recommendation
    setLoading(true);
    try {
      const response = await axios.post('http://127.0.0.1:5001/api/predict', formData, {
        headers: { 'Content-Type': 'application/json' },
      });
      setLoading(false);
      setLoadingStep(null);
      if (response.data.success) {
        setResult(`Recommended Crop: ${response.data.data.recommendedCrop}`);
        setCropImage(`http://localhost:5001${response.data.data.cropImage}`);  // Store the crop image path
      } else {
        setError(response.data.message || 'Failed to get recommendation. Please try again.');
      }
    } catch (err) {
      setLoading(false);
      setLoadingStep(null);
      console.error('Error:', err);
      setError('An error occurred while fetching the recommendation.');
    }
  };

  const renderStepForm = () => {
    switch (step) {
      case 1:
        return (
          <div>
            <h2 className="text-2xl font-bold text-gray-700">Soil Analysis</h2>
            <div className="space-y-4">
              {['Nitrogen', 'Phosphorus', 'Potassium'].map((field) => (
                <div key={field}>
                  <label className="block text-lg font-medium text-gray-700">{field}</label>
                  <input
                    type="number"
                    name={field}
                    value={formData[field]}
                    onChange={handleChange}
                    required
                    className="mt-1 p-2 w-full border border-gray-300 rounded-md"
                  />
                </div>
              ))}
            </div>
            <div className="mt-4">
              <button
                type="button"
                onClick={() => handleNextStep(2)} // Trigger loading before moving to next step
                className="bg-green-600 text-white py-2 px-6 rounded-md hover:bg-green-700 transition"
              >
                Next: Weather Analysis
              </button>
            </div>
          </div>
        );

      case 2:
        return (
          <div>
            <h2 className="text-2xl font-bold text-gray-700">Weather Analysis</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-lg font-medium text-gray-700">Location</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  required
                  className="mt-1 p-2 w-full border border-gray-300 rounded-md"
                />
              </div>
            </div>
            <div className="mt-4 flex space-x-4">
              <button
                type="button"
                onClick={handlePrevStep} // Back button to go to previous step
                className="bg-gray-600 text-white py-2 px-6 rounded-md hover:bg-gray-700 transition"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => handleNextStep(3)} // Trigger loading before moving to next step
                className="bg-green-600 text-white py-2 px-6 rounded-md hover:bg-green-700 transition"
              >
                Next: Other Factore
              </button>
            </div>
          </div>
        );

      case 3:
        return (
          <div>
            <h2 className="text-2xl font-bold text-gray-700">Other Factors</h2>
            <div className="space-y-4">
              {['Ph', 'Rainfall'].map((field) => (
                <div key={field}>
                  <label className="block text-lg font-medium text-gray-700">{field}</label>
                  <input
                    type="number"
                    name={field}
                    value={formData[field]}
                    onChange={handleChange}
                    required
                    className="mt-1 p-2 w-full border border-gray-300 rounded-md"
                  />
                </div>
              ))}
            </div>
            <div className="mt-4 flex space-x-4">
              <button
                type="button"
                onClick={handlePrevStep} // Back button to go to previous step
                className="bg-gray-600 text-white py-2 px-6 rounded-md hover:bg-gray-700 transition"
              >
                Back
              </button>
              <button
                type="submit"
                onClick={handleSubmit}
                className="bg-green-600 text-white py-2 px-6 rounded-md hover:bg-green-700 transition"
              >
                Get Recommendation
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'Crop Recommendation':
        return (
          <div className="p-8">
            <h1 className="text-3xl font-bold mb-6">Crop Recommendation</h1>
            <form onSubmit={handleSubmit} className="space-y-8 bg-white p-6 rounded-lg shadow-md">
              {/* Modal with animation */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.5 }}
                className={`relative p-6 rounded-lg shadow-lg ${cropImage ? 'bg-transparent' : 'bg-white'}`}
              >
                {/* Optional overlay to improve legibility */}
                {cropImage && (
                  <div
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                    style={{
                      backgroundImage: `url(${cropImage})`,
                      zIndex: -1, // Ensure the image stays behind the content
                      opacity: 0.7, // Adjust opacity of the background image
                    }}
                  >
                    {/* Semi-transparent overlay */}
                    <div className="bg-black opacity-50 w-full h-full absolute inset-0"></div>
                  </div>
                )}

                {error && <p className="text-red-600 mb-4">{error}</p>} {/* Display error at the top */}
                {renderStepForm()}
                {loading && loadingStep && (
                  <div className="text-center my-4">
                    <div className="loader">Processing Input Data...</div> {/* Loading Spinner */}
                  </div>
                )}
                {result && <p className="text-green-600 text-xl mt-4">{result}</p>}
              </motion.div>
            </form>
          </div>
        );

      case 'Create A Complaint':
        return <p>Complaint Section coming soon...</p>;

      case 'Market Insights':
        return <p>Market Insights Section Coming Soon...</p>;

      default:
        return null;
    }
  };

  return (
    <div className="flex min-h-screen bg-white">
      <div className="w-64 bg-gray-100 p-6 sidebar-container" style={{ marginTop: '50px' }}> {/* Sidebar items moved down */}
        <ul>
          {sidebarItems.map((item) => (
            <li
              key={item.title}
              onClick={() => setActiveSection(item.title)}
              className={`p-4 cursor-pointer ${activeSection === item.title ? 'bg-green-500 text-white' : 'text-gray-800'}`}
            >
              {item.title}
            </li>
          ))}
        </ul>
      </div>

      <div className="flex-1 p-6 bg-cover bg-center" style={{ backgroundImage: activeSection === 'Crop Recommendation' ? `url(${cropImage})` : 'none', backgroundSize: 'cover' }}>
        {renderContent()}
      </div>
    </div>
  );
};

export default DashFarmer;
