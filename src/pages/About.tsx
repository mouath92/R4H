import React from 'react';
import Card from '../components/ui/Card';

const About: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">About R4H</h1>
      
      <Card className="p-8 mb-8">
        <h2 className="text-2xl font-semibold mb-4">Our Mission</h2>
        <p className="text-gray-700 mb-6">
          R4H (Rent for Hours) is revolutionizing the way people access and share spaces. We believe that everyone should have access to great spaces when they need them, without the burden of long-term commitments.
        </p>
        
        <h2 className="text-2xl font-semibold mb-4">Our Story</h2>
        <p className="text-gray-700 mb-6">
          Founded in 2024, R4H emerged from a simple observation: while there are countless beautiful and functional spaces in our cities, many remain unused for significant portions of the day. Meanwhile, individuals and businesses struggle to find affordable, short-term spaces for their needs.
        </p>
        
        <h2 className="text-2xl font-semibold mb-4">What We Do</h2>
        <p className="text-gray-700 mb-6">
          We connect space owners with people who need temporary access to spaces. Whether it's a photographer looking for a studio, a startup needing a meeting room, or an artist seeking a gallery space, R4H makes it easy to find and book spaces by the hour.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="text-center">
            <div className="text-4xl font-bold text-orange-500 mb-2">1000+</div>
            <div className="text-gray-600">Active Spaces</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-orange-500 mb-2">50K+</div>
            <div className="text-gray-600">Happy Users</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-orange-500 mb-2">100+</div>
            <div className="text-gray-600">Cities</div>
          </div>
        </div>
      </Card>
      
      <Card className="p-8">
        <h2 className="text-2xl font-semibold mb-4">Our Values</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-xl font-medium text-gray-800 mb-2">Community First</h3>
            <p className="text-gray-600">
              We believe in building strong communities by facilitating meaningful connections between space owners and users.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-medium text-gray-800 mb-2">Accessibility</h3>
            <p className="text-gray-600">
              Making great spaces accessible to everyone, regardless of budget or duration needs.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-medium text-gray-800 mb-2">Trust & Safety</h3>
            <p className="text-gray-600">
              Maintaining a secure and trustworthy platform for all our users through careful verification and support.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-medium text-gray-800 mb-2">Innovation</h3>
            <p className="text-gray-600">
              Continuously improving our platform to make space rental as easy and efficient as possible.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default About;