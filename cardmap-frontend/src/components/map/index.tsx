import dynamic from 'next/dynamic'
import { MapSkeleton } from './MapSkeleton'

const MapContainer = dynamic(() => import('./MapContainer'), {
  ssr: false,
  loading: () => <MapSkeleton />,
})

export { MapContainer }
export { MapProvider } from '@/contexts/MapContext'