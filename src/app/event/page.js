// /src/app/event/page.js
import { Suspense } from 'react';
import EventsContent from './EventsContent';

// Force dynamic rendering to avoid prerendering issues
export const dynamic = 'force-dynamic';

export default function EventPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    }>
      <EventsContent />
    </Suspense>
  );
}