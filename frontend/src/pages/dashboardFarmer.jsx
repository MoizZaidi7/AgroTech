import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';

const mapContainerStyle = {
  width: '100%',
  height: '400px',
};

const defaultCenter = { lat: 31.5204, lng: 74.3587 }; // Default location (Lahore, Pakistan)

const DashFarmer = () => {
  const [activeSection, setActiveSection] = useState('Crop Recommendation');
  const [formData, setFormData] = useState({
    Nitrogen: '',
    Phosphorus: '',
    Potassium: '',
    Ph: '',
    Rainfall: '',
    location: '', // Can be a string (address) or an object { lat, lng }
    latitude: '',
    longitude: '',
  });
  const [step, setStep] = useState(1);
  const [result, setResult] = useState('');
  const [cropImage, setCropImage] = useState(''); // State to store crop image
  const [error, setError] = useState(''); // Single error message for the form
  const [loading, setLoading] = useState(false); // Loading state
  const [loadingStep, setLoadingStep] = useState(null); // Track which step is loading
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [useMap, setUseMap] = useState(false); // Toggle between manual input and map selection

  // New state for Crop Yield Prediction
  const [cropYieldData, setCropYieldData] = useState({
    Year: '',
    average_rain_fall_mm_per_year: '',
    pesticides_tonnes: '',
    avg_temp: '',
    Country: 'Pakistan', // Default country set to Pakistan
    Crop: '',
  });
  const [cropYieldResult, setCropYieldResult] = useState('');

  const sidebarItems = [
    { title: 'Crop Recommendation' },
    { title: 'Crop Yield Prediction' }, // New section
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

  const handleMapClick = (event) => {
    const lat = event.latLng.lat();
    const lng = event.latLng.lng();
    setSelectedLocation({ lat, lng });
    setFormData({
      ...formData,
      location: { lat, lng }, // Set location as an object for map selection
      latitude: lat,
      longitude: lng,
    });
  };

  const validateForm = () => {
    let errorMessage = '';
    if (step === 1) {
      if (!formData.Nitrogen || !formData.Phosphorus || !formData.Potassium) {
        errorMessage = 'All soil parameters (Nitrogen, Phosphorus, Potassium) are required.';
      }
    }
    if (step === 2) {
      if (!formData.location && !selectedLocation) {
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

    // Prepare the data to send to the Flask API
    const payload = {
      ...formData,
      location: useMap ? { lat: formData.latitude, lng: formData.longitude } : formData.location,
    };

    try {
      const response = await axios.post('http://127.0.0.1:5001/api/predict', payload, {
        headers: { 'Content-Type': 'application/json' },
      });
      setLoading(false);
      setLoadingStep(null);
      if (response.data.success) {
        setResult(`Recommended Crop: ${response.data.data.recommendedCrop}`);
        setCropImage(`http://localhost:5001${response.data.data.cropImage}`); // Store the crop image path
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

  // Handle Crop Yield Prediction
  const handleCropYieldSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const payload = {
      Year: parseInt(cropYieldData.Year),
      average_rain_fall_mm_per_year: parseFloat(cropYieldData.average_rain_fall_mm_per_year),
      pesticides_tonnes: parseFloat(cropYieldData.pesticides_tonnes),
      avg_temp: parseFloat(cropYieldData.avg_temp),
      Country: cropYieldData.Country, // Default country is already set to "Pakistan"
      Crop: cropYieldData.Crop,
    };

    try {
      const response = await axios.post('http://127.0.0.1:5000/predict', payload, {
        headers: { 'Content-Type': 'application/json' },
      });
      setLoading(false);
      if (response.data.predicted_yield) {
        setCropYieldResult(`Predicted Yield: ${response.data.predicted_yield} tons`);
      } else {
        setError(response.data.error || 'Failed to predict crop yield. Please try again.');
      }
    } catch (err) {
      setLoading(false);
      console.error('Error:', err);
      setError('An error occurred while predicting crop yield.');
    }
  };

  const renderStepForm = () => {
    switch (step) {
      case 1:
        return (
          <div>
            <h2 className="text-2xl font-bold text-gray-700">Soil Analysis</h2>
            <div className="space-y-4">
              {[
                { name: 'Nitrogen', min: 1, max: 100, unit: 'percentage' },
                { name: 'Phosphorus', min: 1, max: 100, unit: 'percentage' },
                { name: 'Potassium', min: 1, max: 100, unit: 'percentage' },
              ].map(({ name, min, max, unit }) => (
                <div key={name}>
                  <label className="block text-lg font-medium text-gray-700">
                    {name} ({unit})
                  </label>
                  <input
                    type="number"
                    name={name}
                    value={formData[name]}
                    onChange={handleChange}
                    min={min}
                    max={max}
                    placeholder={`Enter ${name}`}
                    required
                    className="mt-1 p-2 w-full border border-gray-300 rounded-md"
                  />
                  <p className="text-sm text-gray-500">
                    Recommended range: {min}-{max} {unit}
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <button
                type="button"
                onClick={() => setStep(2)}
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
                <button
                  type="button"
                  onClick={() => setUseMap(!useMap)}
                  className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition mb-4"
                >
                  {useMap ? 'Enter Location Manually' : 'Select Location from Map'}
                </button>
                {useMap ? (
                  <LoadScript googleMapsApiKey="AIzaSyAul5d2P43ED8RbSgfsFiTgmPoeneYyuOk">
                    <GoogleMap
                      mapContainerStyle={mapContainerStyle}
                      center={defaultCenter}
                      zoom={6}
                      onClick={handleMapClick}
                    >
                      {selectedLocation && <Marker position={selectedLocation} />}
                    </GoogleMap>
                  </LoadScript>
                ) : (
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="Enter location manually"
                    className="mt-1 p-2 w-full border border-gray-300 rounded-md"
                  />
                )}
              </div>
            </div>
            <button onClick={() => setStep(3)} className="mt-4 bg-green-600 text-white py-2 px-6 rounded-md">
              Next: Crop Recommendation
            </button>
          </div>
        );

      case 3:
        return (
          <div>
            <h2 className="text-2xl font-bold text-gray-700">Crop Recommendation</h2>
            <div className="space-y-4">
              {[
                { name: 'Ph', min: 1, max: 14, unit: 'pH level' },
                { name: 'Rainfall', min: 1, max: 700, unit: 'mm/year' },
              ].map(({ name, min, max, unit }) => (
                <div key={name}>
                  <label className="block text-lg font-medium text-gray-700">
                    {name} ({unit})
                  </label>
                  <input
                    type="number"
                    name={name}
                    value={formData[name]}
                    onChange={handleChange}
                    min={min}
                    max={max}
                    placeholder={`Enter ${name}`}
                    required
                    className="mt-1 p-2 w-full border border-gray-300 rounded-md"
                  />
                  <p className="text-sm text-gray-500">
                    Recommended range: {min}-{max} {unit}
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-4 flex space-x-4">
              <button
                type="button"
                onClick={handlePrevStep}
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

  const renderCropYieldPrediction = () => (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Crop Yield Prediction</h1>
      <form onSubmit={handleCropYieldSubmit} className="space-y-8 bg-white p-6 rounded-lg shadow-md">
        {[
          { name: 'Year', type: 'number', placeholder: 'Enter year' },
          { name: 'average_rain_fall_mm_per_year', type: 'number', placeholder: 'Enter average rainfall (mm/year)' },
          { name: 'pesticides_tonnes', type: 'number', placeholder: 'Enter pesticides (tonnes)' },
          { name: 'avg_temp', type: 'number', placeholder: 'Enter average temperature (°C)' },
          { name: 'Crop', type: 'text', placeholder: 'Enter crop type' },
        ].map(({ name, type, placeholder }) => (
          <div key={name}>
            <label className="block text-lg font-medium text-gray-700">{name}</label>
            <input
              type={type}
              name={name}
              value={cropYieldData[name]}
              onChange={(e) => setCropYieldData({ ...cropYieldData, [name]: e.target.value })}
              placeholder={placeholder}
              required
              className="mt-1 p-2 w-full border border-gray-300 rounded-md"
            />
          </div>
        ))}
  
        <div>
          <label className="block text-lg font-medium text-gray-700">Location</label>
          <LoadScript googleMapsApiKey="AIzaSyAul5d2P43ED8RbSgfsFiTgmPoeneYyuOk">
            <GoogleMap
              mapContainerStyle={mapContainerStyle}
              center={defaultCenter}
              zoom={6}
              onClick={handleMapClick}
            >
              {selectedLocation && <Marker position={selectedLocation} />}
            </GoogleMap>
          </LoadScript>
          <p className="text-sm text-gray-500 mt-2">
          </p>
        </div>
  
        <button
          type="submit"
          className="bg-green-600 text-white py-2 px-6 rounded-md hover:bg-green-700 transition"
        >
          Predict Yield
        </button>
        {loading && <div className="text-center my-4">Predicting Crop Yield...</div>}
        {cropYieldResult && <p className="text-green-600 text-xl mt-4">{cropYieldResult}</p>}
      </form>
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'Crop Recommendation':
        return (
          <div className="p-8">
            <h1 className="text-3xl font-bold mb-6">Crop Recommendation</h1>
            <form onSubmit={handleSubmit} className="space-y-8 bg-white p-6 rounded-lg shadow-md">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.5 }}
                className={`relative p-6 rounded-lg shadow-lg ${cropImage ? 'bg-transparent' : 'bg-white'}`}
              >
                {cropImage && (
                  <div
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                    style={{
                      backgroundImage: `url(${cropImage})`,
                      zIndex: -1,
                      opacity: 0.7,
                    }}
                  >
                    <div className="bg-black opacity-50 w-full h-full absolute inset-0"></div>
                  </div>
                )}

                {error && <p className="text-red-600 mb-4">{error}</p>}
                {renderStepForm()}
                {loading && loadingStep && (
                  <div className="text-center my-4">
                    <div className="loader">Processing Input Data...</div>
                  </div>
                )}
                {result && <p className="text-green-600 text-xl mt-4">{result}</p>}
              </motion.div>
            </form>
          </div>
        );

      case 'Crop Yield Prediction':
        return renderCropYieldPrediction();

      case 'Log Complaint':
        return <p>Complaint Section coming soon...</p>;

      case 'Market Insights':
        return <p>Market Insights Section Coming Soon...</p>;

      default:
        return null;
    }
  };

  return (
    <div className="flex min-h-screen bg-white">
      <div className="w-64 bg-gray-100 p-6 sidebar-container" style={{ marginTop: '50px' }}>
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

      <div
        className="flex-1 p-6 bg-cover bg-center"
        style={{
          backgroundImage: activeSection === 'Crop Recommendation' ? `url(${cropImage})` : 'none',
          backgroundSize: 'cover',
        }}
      >
        {renderContent()}
      </div>
    </div>
  );
};

export default DashFarmer;