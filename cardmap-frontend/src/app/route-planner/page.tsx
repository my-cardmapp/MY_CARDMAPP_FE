import { RoutePlanner } from '@/components/route/RoutePlanner';

export default function RoutePlannerPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">경로 계획</h1>
        <RoutePlanner />
      </div>
    </div>
  );
}