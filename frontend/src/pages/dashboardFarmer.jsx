import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import { FaLeaf, FaChartLine, FaCamera, FaStore, FaArrowLeft, FaArrowRight, FaMapMarkerAlt, FaCheck } from 'react-icons/fa';

const DashFarmer = () => {
  const [activeSection, setActiveSection] = useState('Crop Recommendation');
  const [formData, setFormData] = useState({
    Nitrogen: '',
    Phosphorus: '',
    Potassium: '',
    Ph: '',
    Rainfall: '',
    location: '',
    latitude: '',
    longitude: '',
  });
  const [step, setStep] = useState(1);
  const [result, setResult] = useState('');
  const [cropImage, setCropImage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [useMap, setUseMap] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Crop Yield Prediction state
  const [cropYieldData, setCropYieldData] = useState({
    Year: new Date().getFullYear(),
    average_rain_fall_mm_per_year: '',
    pesticides_tonnes: '',
    avg_temp: '',
    Country: 'Pakistan',
    Crop: '',
  });
  const [cropYieldResult, setCropYieldResult] = useState('');

  // Crop Health Monitoring state
  const [healthImage, setHealthImage] = useState(null);
  const [healthImagePreview, setHealthImagePreview] = useState(null);
  const [healthPrediction, setHealthPrediction] = useState('');
  const [healthLoading, setHealthLoading] = useState(false);

  const sidebarItems = [
    { title: 'Crop Recommendation', icon: <FaLeaf /> },
    { title: 'Crop Yield Prediction', icon: <FaChartLine /> },
    { title: 'Crop Health Monitoring', icon: <FaCamera /> },
    { title: 'Market Insights', icon: <FaStore /> },
  ];

  const crops = ['Wheat', 'Rice', 'Maize', 'Cotton', 'Sugarcane', 'Potato', 'Tomato', 'Onion', 'Mango', 'Citrus'];

  // Map configuration
  const mapContainerStyle = {
    width: '100%',
    height: '300px',
  };

  const defaultCenter = { lat: 31.5204, lng: 74.3587 }; // Lahore, Pakistan

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
        latitude: '',
        longitude: '',
      });
      setStep(1);
      setResult('');
      setCropImage('');
      setError('');
      setLoading(false);
      setLoadingStep(null);
    }
  }, [activeSection]);

  // Handle image preview for crop health monitoring
  useEffect(() => {
    if (healthImage) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setHealthImagePreview(reader.result);
      };
      reader.readAsDataURL(healthImage);
    } else {
      setHealthImagePreview(null);
    }
  }, [healthImage]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleCropYieldChange = (e) => {
    const { name, value } = e.target;
    setCropYieldData({ ...cropYieldData, [name]: value });
  };

  const handleMapClick = (event) => {
    const lat = event.latLng.lat();
    const lng = event.latLng.lng();
    setSelectedLocation({ lat, lng });
    setFormData({
      ...formData,
      location: { lat, lng },
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
      if (!formData.location && !selectedLocation && !formData.latitude && !formData.longitude) {
        errorMessage = 'Location is required.';
      }
    }
    if (step === 3) {
      if (!formData.Ph || !formData.Rainfall) {
        errorMessage = 'Both Ph and Rainfall are required.';
      }
    }
    setError(errorMessage);
    return !errorMessage;
  };

  const handleNextStep = () => {
    if (validateForm()) {
      setLoadingStep(step + 1);
      setLoading(true);
      setTimeout(() => {
        setStep(step + 1);
        setLoading(false);
        setLoadingStep(null);
      }, 800);
    }
  };

  const handlePrevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!validateForm()) {
      return;
    }
    setLoadingStep(3);
    setLoading(true);

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
        setCropImage(`http://localhost:5001${response.data.data.cropImage}`);
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

  const handleCropYieldSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const payload = {
      Year: parseInt(cropYieldData.Year),
      average_rain_fall_mm_per_year: parseFloat(cropYieldData.average_rain_fall_mm_per_year),
      pesticides_tonnes: parseFloat(cropYieldData.pesticides_tonnes),
      avg_temp: parseFloat(cropYieldData.avg_temp),
      Country: cropYieldData.Country,
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

  const handleHealthImageUpload = async (e) => {
    e.preventDefault();
    if (!healthImage) {
      setError('Please upload an image.');
      return;
    }

    setHealthLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('file', healthImage);

    try {
      const response = await axios.post('http://127.0.0.1:5003/predict', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setHealthLoading(false);
      if (response.data.prediction) {
        setHealthPrediction(response.data.prediction);
      } else {
        setError(response.data.error || 'Failed to predict crop health. Please try again.');
      }
    } catch (err) {
      setHealthLoading(false);
      console.error('Error:', err);
      setError('An error occurred while predicting crop health.');
    }
  };

  const FormField = ({ label, name, type, value, onChange, min, max, unit, placeholder, options }) => (
    <div className="mb-4">
      <label className="block text-lg font-medium text-gray-700 mb-2">
        {label} {unit && `(${unit})`}
      </label>
      {options ? (
        <select
          name={name}
          value={value}
          onChange={onChange}
          className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:border-green-500 focus:ring focus:ring-green-200 focus:ring-opacity-50 transition-all"
        >
          <option value="">Select {label}</option>
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      ) : (
        <input
          type={type || "text"}
          name={name}
          value={value}
          onChange={onChange}
          min={min}
          max={max}
          placeholder={placeholder || `Enter ${label}`}
          className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:border-green-500 focus:ring focus:ring-green-200 focus:ring-opacity-50 transition-all"
          required
        />
      )}
      {min && max && (
        <p className="text-sm text-gray-500 mt-1">
          Recommended range: {min}-{max} {unit}
        </p>
      )}
    </div>
  );

  const renderStepForm = () => {
    const soilParams = [
      { name: 'Nitrogen', label: 'Nitrogen', min: 1, max: 100, unit: 'percentage' },
      { name: 'Phosphorus', label: 'Phosphorus', min: 1, max: 100, unit: 'percentage' },
      { name: 'Potassium', label: 'Potassium', min: 1, max: 100, unit: 'percentage' },
    ];

    const environmentParams = [
      { name: 'Ph', label: 'pH Level', min: 1, max: 14, unit: 'pH' },
      { name: 'Rainfall', label: 'Rainfall', min: 1, max: 700, unit: 'mm/year' },
    ];

    const stepContent = {
      1: (
        <div className="space-y-4">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Soil Analysis</h2>
            <p className="text-gray-600 mb-6">Enter the soil composition parameters to analyze soil quality.</p>
          </div>
          {soilParams.map((param) => (
            <FormField
              key={param.name}
              label={param.label}
              name={param.name}
              type="number"
              value={formData[param.name]}
              onChange={handleChange}
              min={param.min}
              max={param.max}
              unit={param.unit}
            />
          ))}
        </div>
      ),
      2: (
        <div className="space-y-4">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Location Analysis</h2>
            <p className="text-gray-600 mb-6">Provide your farm location for accurate recommendations.</p>
          </div>
          <div className="mb-4">
            <div className="flex items-center mb-4">
              <button
                type="button"
                onClick={() => setUseMap(!useMap)}
                className={`flex items-center px-4 py-2 rounded-lg mr-2 ${
                  useMap ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700'
                }`}
              >
                <FaMapMarkerAlt className="mr-2" /> Use Map
              </button>
              <button
                type="button"
                onClick={() => setUseMap(!useMap)}
                className={`flex items-center px-4 py-2 rounded-lg ${
                  !useMap ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700'
                }`}
              >
                <FaCheck className="mr-2" /> Manual Entry
              </button>
            </div>

            {useMap ? (
              <div className="rounded-lg overflow-hidden shadow-md">
                <LoadScript googleMapsApiKey="AIzaSyAul5d2P43ED8RbSgfsFiTgmPoeneYyuOk">
                  <GoogleMap
                    mapContainerStyle={mapContainerStyle}
                    center={selectedLocation || defaultCenter}
                    zoom={6}
                    onClick={handleMapClick}
                  >
                    {selectedLocation && <Marker position={selectedLocation} />}
                  </GoogleMap>
                </LoadScript>
                {selectedLocation && (
                  <div className="bg-gray-100 p-3 border-t border-gray-300">
                    <p className="text-sm text-gray-700">
                      Selected location: Lat: {selectedLocation.lat.toFixed(4)}, Lng: {selectedLocation.lng.toFixed(4)}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  label="Latitude"
                  name="latitude"
                  type="number"
                  value={formData.latitude}
                  onChange={handleChange}
                  placeholder="Enter latitude"
                />
                <FormField
                  label="Longitude"
                  name="longitude"
                  type="number"
                  value={formData.longitude}
                  onChange={handleChange}
                  placeholder="Enter longitude"
                />
              </div>
            )}
          </div>
        </div>
      ),
      3: (
        <div className="space-y-4">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Environmental Factors</h2>
            <p className="text-gray-600 mb-6">Enter environmental factors to complete the recommendation.</p>
          </div>
          {environmentParams.map((param) => (
            <FormField
              key={param.name}
              label={param.label}
              name={param.name}
              type="number"
              value={formData[param.name]}
              onChange={handleChange}
              min={param.min}
              max={param.max}
              unit={param.unit}
            />
          ))}
        </div>
      ),
    };

    return stepContent[step] || null;
  };

  const renderStepIndicator = () => {
    const steps = [
      { label: 'Soil', isActive: step >= 1, isDone: step > 1 },
      { label: 'Location', isActive: step >= 2, isDone: step > 2 },
      { label: 'Environment', isActive: step >= 3, isDone: false },
    ];

    return (
      <div className="flex justify-between mb-8 relative">
        <div className="absolute top-1/2 h-1 bg-gray-200 w-full -z-10 transform -translate-y-1/2"></div>
        {steps.map((s, i) => (
          <div key={i} className="flex flex-col items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${
                s.isDone
                  ? 'bg-green-600 text-white'
                  : s.isActive
                  ? 'bg-green-500 text-white'
                  : 'bg-white text-gray-500 border-2 border-gray-300'
              }`}
            >
              {s.isDone ? <FaCheck className="text-white" /> : i + 1}
            </div>
            <span
              className={`mt-2 ${
                s.isActive ? 'text-green-600 font-medium' : 'text-gray-500'
              }`}
            >
              {s.label}
            </span>
          </div>
        ))}
      </div>
    );
  };

  const renderCropRecommendation = () => (
    <div className="p-4 md:p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Crop Recommendation</h1>
        <p className="text-gray-600">
          Get personalized crop recommendations based on your soil and environment.
        </p>
      </motion.div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-xl overflow-hidden">
        <div className="p-6 md:p-8">
          {renderStepIndicator()}

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderStepForm()}
            </motion.div>
          </AnimatePresence>

          {loading && loadingStep && (
            <div className="text-center my-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div>
              <p className="mt-2 text-gray-600">Processing data...</p>
            </div>
          )}

          {result && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-6 p-6 bg-green-50 border border-green-200 rounded-lg"
            >
              <h3 className="text-xl font-bold text-green-800 mb-2">{result}</h3>
              {cropImage && (
                <div className="mt-4 rounded-lg overflow-hidden shadow-md">
                  <img src={cropImage} alt="Recommended crop" className="w-full h-40 object-cover" />
                </div>
              )}
            </motion.div>
          )}

          <div className="mt-8 flex justify-between">
            {step > 1 ? (
              <button
                type="button"
                onClick={handlePrevStep}
                className="flex items-center px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
              >
                <FaArrowLeft className="mr-2" /> Back
              </button>
            ) : (
              <div></div>
            )}

            {step < 3 ? (
              <button
                type="button"
                onClick={handleNextStep}
                className="flex items-center px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition ml-auto"
              >
                Next <FaArrowRight className="ml-2" />
              </button>
            ) : (
              <button
                type="submit"
                className="flex items-center px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition ml-auto"
              >
                Get Recommendation <FaLeaf className="ml-2" />
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );

  const renderCropYieldPrediction = () => (
    <div className="p-4 md:p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Crop Yield Prediction</h1>
        <p className="text-gray-600">
          Predict your expected crop yield based on environmental conditions and inputs.
        </p>
      </motion.div>

      <form
        onSubmit={handleCropYieldSubmit}
        className="bg-white rounded-xl shadow-xl overflow-hidden p-6 md:p-8"
      >
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            label="Year"
            name="Year"
            type="number"
            value={cropYieldData.Year}
            onChange={handleCropYieldChange}
            placeholder="Enter year"
          />
          <FormField
            label="Average Rainfall"
            name="average_rain_fall_mm_per_year"
            type="number"
            value={cropYieldData.average_rain_fall_mm_per_year}
            onChange={handleCropYieldChange}
            placeholder="Enter average rainfall"
            unit="mm/year"
          />
          <FormField
            label="Pesticides Used"
            name="pesticides_tonnes"
            type="number"
            value={cropYieldData.pesticides_tonnes}
            onChange={handleCropYieldChange}
            placeholder="Enter pesticides amount"
            unit="tonnes"
          />
          <FormField
            label="Average Temperature"
            name="avg_temp"
            type="number"
            value={cropYieldData.avg_temp}
            onChange={handleCropYieldChange}
            placeholder="Enter average temperature"
            unit="°C"
          />
          <FormField
            label="Crop Type"
            name="Crop"
            value={cropYieldData.Crop}
            onChange={handleCropYieldChange}
            options={crops}
          />
        </div>

        <button
          type="submit"
          className="mt-8 w-full md:w-auto px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center justify-center"
        >
          <FaChartLine className="mr-2" /> Predict Yield
        </button>

        {loading && (
          <div className="text-center my-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div>
            <p className="mt-2 text-gray-600">Predicting crop yield...</p>
          </div>
        )}

        {cropYieldResult && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 p-6 bg-green-50 border border-green-200 rounded-lg"
          >
            <h3 className="text-2xl font-bold text-green-800">{cropYieldResult}</h3>
          </motion.div>
        )}
      </form>
    </div>
  );

  const renderCropHealthMonitoring = () => (
    <div className="p-4 md:p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Crop Health Monitoring</h1>
        <p className="text-gray-600">
          Upload images of your crops to analyze health conditions and detect diseases.
        </p>
      </motion.div>

      <form
        onSubmit={handleHealthImageUpload}
        className="bg-white rounded-xl shadow-xl overflow-hidden p-6 md:p-8"
      >
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        <div className="mb-6">
          <label className="block text-lg font-medium text-gray-700 mb-2">Upload Crop Image</label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setHealthImage(e.target.files[0])}
              className="hidden"
              id="cropImageInput"
            />
            <label
              htmlFor="cropImageInput"
              className="cursor-pointer flex flex-col items-center justify-center"
            >
              {healthImagePreview ? (
                <div className="w-full">
                  <img
                    src={healthImagePreview}
                    alt="Crop preview"
                    className="mb-4 max-h-56 mx-auto rounded-lg object-contain"
                  />
                  <p className="text-sm text-gray-500">Click to change image</p>
                </div>
              ) : (
                <>
                  <FaCamera className="text-4xl text-gray-400 mb-2" />
                  <p className="text-gray-600">Click to upload an image of your crop</p>
                </>
              )}
            </label>
          </div>
        </div>

        <button
          type="submit"
          className="w-full md:w-auto px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center justify-center"
          disabled={!healthImage}
        >
          <FaLeaf className="mr-2" /> Analyze Crop Health
        </button>

        {healthLoading && (
          <div className="text-center my-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div>
            <p className="mt-2 text-gray-600">Analyzing crop health...</p>
          </div>
        )}

        {healthPrediction && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 p-6 bg-green-50 border border-green-200 rounded-lg"
          >
            <h3 className="text-xl font-bold text-green-800 mb-2">Analysis Result</h3>
            <p className="text-gray-700">{healthPrediction}</p>
          </motion.div>
        )}
      </form>
    </div>
  );

  const renderMarketInsights = () => (
    <div className="p-4 md:p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Market Insights</h1>
        <p className="text-gray-600">
          Stay updated with current market trends and pricing information.
        </p>
      </motion.div>

      <div className="bg-white rounded-xl shadow-xl overflow-hidden p-6 md:p-8 text-center">
        <FaStore className="text-6xl text-gray-300 mx-auto mb-4" />
        <h3 className="text-xl font-medium text-gray-700 mb-2">Coming Soon</h3>
        <p className="text-gray-500">
          We're working on bringing you the latest market insights. This feature will be available soon!
        </p>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'Crop Recommendation':
        return renderCropRecommendation();
      case 'Crop Yield Prediction':
        return renderCropYieldPrediction();
      case 'Crop Health Monitoring':
        return renderCropHealthMonitoring();
      case 'Market Insights':
        return renderMarketInsights();
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