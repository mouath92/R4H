import React, { useState, useEffect } from 'react';
import { AlertCircle, Loader } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Space {
  id: string;
  title: string;
  address: string;
  price_per_hour: number;
  size_m2: number;
  image_urls: string[];
  host: {
    name: string;
    email: string;
  };
}

s

      {spaces.length === 0 && (
        <div className="col-span-full text-center py-12">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No spaces available</p>
        </div>
      )}
    </div>
  );
};

export default SpacesList;