import React from 'react';

const Host: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900 text-center mb-8">
        List Your Space
      </h1>
      
      <iframe
        src="https://airtable.com/app5Tv9tAV1kWrvzB/shr7JQ8oZ0DcCpTjT"
        width="100%"
        height="750"
        style={{ border: 'none', borderRadius: '8px' }}
        title="List Your Space Form"
      />
    </div>
  );
};

export default Host;