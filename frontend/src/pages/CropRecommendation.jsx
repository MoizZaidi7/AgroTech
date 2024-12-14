import React, { useState } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';

const CropRecommendation = () => {
  const [formData, setFormData] = useState({
    Nitrogen: '',
    Phosphorus: '',
    Potassium: '',
    Temperature: '',
    Humidity: '',
    Ph: '',
    Rainfall: '',
  });

  const [result, setResult] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); // Reset error

    try {
      const response = await axios.post('http://localhost:5001/api/predict', formData, {
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.data.success) {
        setResult(`Recommended Crop: ${response.data.data.recommendedCrop}`);
      } else {
        setError(response.data.message || 'Failed to get recommendation. Please try again.');
      }
    } catch (error) {
      console.error('Error:', error);
      setError('An error occurred while fetching the recommendation.');
    }
  };

  return (
    <div className="relative min-h-screen bg-white">
      <div className="absolute inset-0 w-full h-full">
        <video className="w-full h-full object-cover" autoPlay loop muted playsInline>
          <source src="/backvideo.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>

      <motion.div className="relative z-0 pt-24 px-6 py-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }}>
        <h1 className="text-4xl font-bold text-green-700 mb-8">Crop Recommendation</h1>
        <p className="text-center text-lg text-gray-600 mb-8">Get the best crop recommendations based on your data.</p>

        <form onSubmit={handleSubmit} className="max-w-xl mx-auto bg-white p-6 rounded-lg shadow-md">
          <div className="space-y-4">
            {['Nitrogen', 'Phosphorus', 'Potassium', 'Temperature', 'Humidity', 'Ph', 'Rainfall'].map((field) => (
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

            <div className="mt-4">
              <button type="submit" className="bg-green-600 text-white py-2 px-6 rounded-md hover:bg-green-700 transition">
                Get Recommendation
              </button>
            </div>
          </div>
        </form>

        {error && <p className="mt-4 text-red-600 text-center">{error}</p>}
        {result && <p className="mt-4 text-green-700 text-center">{result}</p>}
      </motion.div>
    </div>
  );
};

export default CropRecommendation;
