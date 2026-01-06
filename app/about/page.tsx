'use client'
import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default Leaflet marker icon missing in some Webpack/Next.js builds
const iconParams = {
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41] as [number, number],
  iconAnchor: [12, 41] as [number, number],
};
const defaultIcon = L.icon(iconParams);

// --- Components ---

const SectionHeader = ({ title, subtitle }: { title: string; subtitle?: string }) => (
  <div className="text-center mb-12">
    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{title}</h2>
    {subtitle && <p className="text-lg text-gray-600 max-w-2xl mx-auto">{subtitle}</p>}
  </div>
);

const ValueCard = ({ title, description, icon }: { title: string; description: string; icon: React.ReactNode }) => (
  <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow border border-gray-100 text-center">
    <div className="w-16 h-16 mx-auto mb-6 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
      {icon}
    </div>
    <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
    <p className="text-gray-600 leading-relaxed">{description}</p>
  </div>
);

const MapComponent = () => {
  // Approximate coordinates for Uttara, Dhaka
  const position: [number, number] = [23.8728, 90.3984];

  return (
    <div className="h-[400px] w-full rounded-2xl overflow-hidden shadow-lg border border-gray-200 z-0 relative">
      <MapContainer 
        center={position} 
        zoom={14} 
        scrollWheelZoom={false} 
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={position} icon={defaultIcon}>
          <Popup>
            <div className="text-center">
              <span className="font-bold">Robonauts Club</span><br />
              Uttara, Dhaka, Bangladesh
            </div>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
};

// --- Main Page ---

const AboutUs = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative bg-blue-900 text-white py-24 px-6">
        <div className="absolute inset-0 bg-linear-to-r from-blue-900 to-indigo-900 opacity-90"></div>
        {/* Decorative background pattern could go here */}
        <div className="relative max-w-7xl mx-auto text-center z-10">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6">
            Where Innovation Meets <span className="text-blue-300">Curiosity</span>
          </h1>
          <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
            Igniting young minds through hands-on STEM education. We are nurturing the next generation of scientists and engineers in Dhaka.
          </p>
        </div>
      </section>

      {/* Mission & Vision Section */}
      <section className="py-20 px-6 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-900">Who We Are</h2>
            <p className="text-gray-600 text-lg leading-relaxed">
              Founded in 2022, <strong>Robonauts Club</strong> emerged from a passion for making STEM (Science, Technology, Engineering, and Mathematics) accessible and exciting for children and teenagers.
            </p>
            <p className="text-gray-600 text-lg leading-relaxed">
              Our mission is to empower young minds with the tools and confidence to become tomorrow&apos;s leaders. Through interactive workshops and real-world projects, we turn theoretical knowledge into creative solutions.
            </p>
          </div>
          <div className="relative h-64 md:h-96 rounded-2xl overflow-hidden shadow-xl bg-gray-200">
             {/* Placeholder for an actual team or workshop image */}
             <div className="absolute inset-0 flex items-center justify-center bg-gray-300 text-gray-500">
               <span className="text-lg font-medium">Insert Team/Workshop Image Here</span>
             </div>
          </div>
        </div>
      </section>

      {/* Core Values Section */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <SectionHeader 
            title="Our Core Values" 
            subtitle="The principles that guide every workshop, project, and mentorship session we offer."
          />
          
          <div className="grid md:grid-cols-3 gap-8">
            <ValueCard 
              title="Innovation" 
              description="We embrace creativity and encourage students to think outside the box to develop unique solutions for modern problems."
              icon={
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              }
            />
            <ValueCard 
              title="Collaboration" 
              description="Teamwork is at our heart. We foster an environment where diverse perspectives come together to enhance learning."
              icon={
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              }
            />
            <ValueCard 
              title="Empowerment" 
              description="We believe in building confidence. We provide the mentorship and resources needed for students to own their future."
              icon={
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
            />
          </div>
        </div>
      </section>

      {/* Location & Map Section */}
      <section className="py-20 px-6 max-w-7xl mx-auto">
        <SectionHeader 
          title="Visit Us" 
          subtitle="Come explore our labs and meet the mentors in Uttara."
        />
        
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Contact Info */}
          <div className="lg:col-span-1 space-y-8">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h4 className="font-bold text-lg text-gray-900 mb-2">Headquarters</h4>
              <p className="text-gray-600">Uttara, Dhaka, Bangladesh</p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h4 className="font-bold text-lg text-gray-900 mb-2">Get in Touch</h4>
              <p className="text-gray-600 mb-1">
                <span className="font-semibold">Phone:</span> 01824-863366
              </p>
              <p className="text-gray-600">
                <span className="font-semibold">Email:</span> info@robonautsclub.com
              </p>
            </div>

            <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
              <h4 className="font-bold text-lg text-blue-900 mb-2">Join the Club</h4>
              <p className="text-blue-800 mb-4 text-sm">
                Ready to start your STEM journey? Book a free consultation today.
              </p>
              <button className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors">
                Contact Us
              </button>
            </div>
          </div>

          {/* Map Component */}
          <div className="lg:col-span-2">
             <MapComponent />
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutUs;