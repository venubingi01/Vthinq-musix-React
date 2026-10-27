'use client';

import React, { Suspense } from 'react';
import { SearchView } from '../../components/SearchView';
import { Loader2 } from 'lucide-react';

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="search-view-container" style={{ textAlign: 'center', padding: '60px 20px' }}>
          <Loader2 size={36} className="spin-loader text-pink" style={{ margin: '0 auto 16px' }} />
          <p>Loading Search & Albums...</p>
        </div>
      }
    >
      <SearchView />
    </Suspense>
  );
}

