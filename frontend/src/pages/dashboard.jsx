import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";

const ImageSlider = ({ images }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 2000); // Change image every 2 seconds

    return () => clearInterval(intervalId); // Cleanup on component unmount
  }, [images.length]);

  return (
    <div className="relative">
      <div className="w-full h-48 overflow-hidden rounded-lg">
        <div
          className="flex transition-transform duration-500"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {images.map((image, index) => (
            <div key={index} className="w-full flex-shrink-0">
              <img
                src={image}
                alt={`slide-${index}`}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const DashboardPage = () => {
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const navigate = useNavigate();

  const handleNavigationClick = (route) => {
    setShowLoginPopup(true);
    setPopupMessage("Can't Access This! Login First");
    setTimeout(() => {
      navigate("/login");
    }, 3000);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Background Video */}
      <div className="absolute inset-0 -z-10 w-full h-screen overflow-hidden">
        <video
          className="w-full h-full object-cover"
          autoPlay
          loop
          muted
          playsInline
        >
          <source src="backvideo.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>

      {/* Navbar */}
      <motion.div
        className="fixed inset-x-0 top-0 flex justify-between items-center p-3 bg-white bg-opacity-20 backdrop-blur-lg shadow-md z-20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        {/* Logo */}
        <div className="flex items-center space-x-2">
          <img
            src="/logo.png"
            alt="Logo"
            className="h-10 w-10 rounded-full border-2 border-white"
          />
          <div>
            <h1 className="text-white text-xl font-bold">AgroTech</h1>
            <p className="text-gray-200 text-sm italic">
              Cultivating Smarter Futures
            </p>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="flex space-x-6 text-lg text-green-700 font-semibold">
          <button
            onClick={() => handleNavigationClick("/")}
            className="hover:text-green-900"
          >
            Home
          </button>
          <button
            onClick={() => handleNavigationClick("/marketplace")}
            className="hover:text-green-900"
          >
            Marketplace
          </button>
          <Link to="/support" className="hover:text-green-900">
            Support
          </Link>
          <Link to="/login" className="hover:text-green-900">
            Login / SignUp
          </Link>
        </div>
      </motion.div>

      {/* Main Section */}
      <div className="relative z-10 flex flex-col justify-center items-center h-screen text-white text-center">
        <h1 className="text-5xl font-bold mb-4">Welcome to AgroTech</h1>
        <p className="text-lg mb-8">
          Revolutionizing agriculture with smart tools and data-driven insights.
        </p>
        <motion.button
          className="bg-green-700 px-6 py-3 rounded-full text-white hover:bg-green-900 transition duration-300"
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          whileHover={{ scale: 1.1 }}
          link to="/login"
        >
          Get Started
        </motion.button>
      </div>

{/* Features Section */}
<section className="py-16 px-8 bg-gray-100">
  <h2 className="text-3xl font-bold text-green-700 mb-6 text-center">
    Features
  </h2>
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
    {/* Crop Monitoring Feature */}
    <div className="bg-white p-6 rounded-lg shadow-md transform transition duration-500 hover:scale-105 hover:shadow-xl">
      <div className="relative">
        <ImageSlider images={['crops1.jpg', 'crops2.jpg', 'crops3.jpg']} />
        <h3 className="text-xl font-semibold text-green-700 mt-4">
          Crop Monitoring
        </h3>
        <p className="text-gray-600 mt-2">
          Monitor crop health, water, and nutrients efficiently.
        </p>
      </div>
    </div>

    {/* Marketplace Feature */}
    <div className="bg-white p-6 rounded-lg shadow-md transform transition duration-500 hover:scale-105 hover:shadow-xl">
      <div className="relative">
        <ImageSlider images={['marketplace1.jpg', 'marketplace2.jpg', 'marketplace3.jpg']} />
        <h3 className="text-xl font-semibold text-green-700 mt-4">
          Marketplace
        </h3>
        <p className="text-gray-600 mt-2">
          Buy and sell agricultural products easily.
        </p>
      </div>
    </div>

    {/* Support Feature */}
    <div className="bg-white p-6 rounded-lg shadow-md transform transition duration-500 hover:scale-105 hover:shadow-xl">
      <div className="relative">
        <div className="w-full h-48 overflow-hidden rounded-lg">
          <div className="swiper-container">
            <div className="swiper-wrapper">
              <div className="swiper-slide">
                <img
                  src="support.jpg"
                  alt="Support"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
        <h3 className="text-xl font-semibold text-green-700 mt-4">Support</h3>
        <p className="text-gray-600 mt-2">
          Access expert advice and troubleshooting resources.
        </p>
      </div>
    </div>
  </div>
</section>


      {/* Ads Section */}
      <section className="py-16 px-8 bg-green-50">
        <h2 className="text-3xl font-bold text-green-700 mb-6 text-center">
          Advertisements
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <img
              src="wheat.jpg"
              alt="Image 1"
              className="w-full h-48 object-cover rounded-lg"
            />
            <h3 className="text-xl font-semibold text-green-700 mt-4">Wheat</h3>
            <p className="text-gray-600 mt-2">
              Description of the advertised product/service.
            </p>
            <div className="mt-4">
              <p className="text-sm text-gray-500">Customer: Mian Tayyab</p>
              <p className="text-sm text-gray-500">Price: $50</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <img
              src="fertilizer.jpg"
              alt="Image 2"
              className="w-full h-48 object-cover rounded-lg"
            />
            <h3 className="text-xl font-semibold text-green-700 mt-4">Fertilizers</h3>
            <p className="text-gray-600 mt-2">
              Description of the advertised product/service.
            </p>
            <div className="mt-4">
              <p className="text-sm text-gray-500">Customer: Hamad Gul</p>
              <p className="text-sm text-gray-500">Price: $45</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <img
              src="Urea.jpg"
              alt="Image 3"
              className="w-full h-48 object-cover rounded-lg"
            />
            <h3 className="text-xl font-semibold text-green-700 mt-4">Urea</h3>
            <p className="text-gray-600 mt-2">
              Description of the advertised product/service.
            </p>
            <div className="mt-4">
              <p className="text-sm text-gray-500">Customer: Basit</p>
              <p className="text-sm text-gray-500">Price: $60</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-green-700 py-8 text-white">
        <div className="text-center">
          <p className="font-bold text-lg">Contact Us</p>
          <p>Email: agrotech@gmail.com</p>
          <p>Phone: 0314-1860287</p>
          <p>instagram: AgroTech.pk</p>
          <p className="mt-4">&copy; 2024 AgroTech. All Rights Reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default DashboardPage;