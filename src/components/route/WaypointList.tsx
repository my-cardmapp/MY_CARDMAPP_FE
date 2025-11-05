'use client';

import React, { useState, useCallback } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { AutocompleteDropdown } from '@/components/search/AutocompleteDropdown';
import { PlusIcon, XMarkIcon, Bars3Icon } from '@heroicons/react/24/outline';
import { MapPinIcon } from '@heroicons/react/24/solid';

export interface Waypoint {
  id: string;
  name: string;
  address: string;
  location: {
    lat: number;
    lng: number;
  };
}

interface WaypointListProps {
  waypoints: Waypoint[];
  onWaypointsChange: (waypoints: Waypoint[]) => void;
  maxWaypoints?: number;
}

interface SortableWaypointProps {
  waypoint: Waypoint;
  index: number;
  onRemove: (id: string) => void;
  isDraggable: boolean;
}

function SortableWaypoint({ waypoint, index, onRemove, isDraggable }: SortableWaypointProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: waypoint.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-3 p-3 bg-white border rounded-lg shadow-sm ${
        isDragging ? 'shadow-lg z-50' : ''
      }`}
    >
      {/* Drag Handle */}
      <button
        className={`touch-none ${isDraggable ? 'cursor-grab' : 'cursor-not-allowed opacity-50'}`}
        aria-label="Drag waypoint to reorder"
        aria-describedby={`waypoint-${waypoint.id}`}
        aria-roledescription="sortable"
        aria-disabled={!isDraggable}
        tabIndex={0}
        {...(isDraggable ? attributes : {})}
        {...(isDraggable ? listeners : {})}
      >
        <Bars3Icon className="h-5 w-5 text-gray-400" />
      </button>

      {/* Order Number */}
      <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-semibold text-sm">
        {index + 1}
      </div>

      {/* Waypoint Info */}
      <div className="flex-1 min-w-0" id={`waypoint-${waypoint.id}`}>
        <div className="font-medium text-gray-900 truncate">{waypoint.name}</div>
        <div className="text-sm text-gray-500 truncate">{waypoint.address}</div>
      </div>

      {/* Remove Button */}
      <button
        onClick={() => onRemove(waypoint.id)}
        className="flex-shrink-0 p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
        aria-label={`Remove waypoint: ${waypoint.name}`}
      >
        <XMarkIcon className="h-5 w-5" />
      </button>
    </div>
  );
}

export function WaypointList({
  waypoints = [],
  onWaypointsChange,
  maxWaypoints = 5,
}: WaypointListProps) {
  const [isAddingWaypoint, setIsAddingWaypoint] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (over && active.id !== over.id) {
      const oldIndex = waypoints.findIndex((w) => w.id === active.id);
      const newIndex = waypoints.findIndex((w) => w.id === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        const reorderedWaypoints = arrayMove(waypoints, oldIndex, newIndex);
        onWaypointsChange(reorderedWaypoints);
      }
    }
  };

  const handleAddWaypoint = useCallback(
    (place: any) => {
      const newWaypoint: Waypoint = {
        id: `waypoint-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: place.name,
        address: place.address,
        location: place.location,
      };

      onWaypointsChange([...waypoints, newWaypoint]);
      setIsAddingWaypoint(false);
    },
    [waypoints, onWaypointsChange]
  );

  const handleRemoveWaypoint = useCallback(
    (id: string) => {
      const updatedWaypoints = waypoints.filter((w) => w.id !== id);
      onWaypointsChange(updatedWaypoints);
    },
    [waypoints, onWaypointsChange]
  );

  const canAddMoreWaypoints = waypoints.length < maxWaypoints;
  const isDraggable = waypoints.length > 1;
  const activeWaypoint = activeId ? waypoints.find((w) => w.id === activeId) : null;

  return (
    <div className="space-y-4" role="region" aria-label="Waypoint list">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          <MapPinIcon className="inline-block h-5 w-5 mr-2 text-blue-600" />
          <span aria-live="polite">Waypoints ({waypoints.length}/{maxWaypoints})</span>
        </h3>
        {!canAddMoreWaypoints && (
          <span className="text-sm text-gray-500">Maximum 5 waypoints</span>
        )}
      </div>

      {/* Waypoint List */}
      {waypoints.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <MapPinIcon className="h-12 w-12 mx-auto mb-3 text-gray-300" />
          <p>No waypoints added</p>
          <p className="text-sm mt-1">Add waypoints to plan your route</p>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={waypoints.map((w) => w.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-2">
              {waypoints.map((waypoint, index) => (
                <SortableWaypoint
                  key={waypoint.id}
                  waypoint={waypoint}
                  index={index}
                  onRemove={handleRemoveWaypoint}
                  isDraggable={isDraggable}
                />
              ))}
            </div>
          </SortableContext>

          <DragOverlay>
            {activeWaypoint ? (
              <div className="flex items-center gap-3 p-3 bg-white border rounded-lg shadow-lg">
                <Bars3Icon className="h-5 w-5 text-gray-400" />
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-semibold text-sm">
                  {waypoints.findIndex((w) => w.id === activeWaypoint.id) + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 truncate">
                    {activeWaypoint.name}
                  </div>
                  <div className="text-sm text-gray-500 truncate">
                    {activeWaypoint.address}
                  </div>
                </div>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      )}

      {/* Add Waypoint Section */}
      {isAddingWaypoint ? (
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Add waypoint
            </label>
            <AutocompleteDropdown
              onSelect={handleAddWaypoint}
              placeholder="Search for a waypoint location..."
              autoFocus
            />
          </div>
          <button
            onClick={() => setIsAddingWaypoint(false)}
            className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
            aria-label="Cancel adding waypoint"
          >
            Cancel
          </button>
        </div>
      ) : (
        <button
          onClick={() => setIsAddingWaypoint(true)}
          disabled={!canAddMoreWaypoints}
          className={`w-full flex items-center justify-center gap-2 p-3 min-h-[48px] rounded-lg border-2 border-dashed transition-colors ${
            canAddMoreWaypoints
              ? 'border-gray-300 hover:border-blue-400 hover:bg-blue-50 text-gray-700 hover:text-blue-700'
              : 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
          }`}
          aria-label="Add waypoint"
        >
          <PlusIcon className="h-5 w-5" />
          <span className="font-medium">Add Waypoint</span>
        </button>
      )}

      {/* Instructions for screen readers */}
      <div className="sr-only" aria-live="polite">
        {isDraggable
          ? 'Use the drag handles to reorder waypoints. Press space or enter to start dragging, then use arrow keys to move, and space or enter again to drop.'
          : waypoints.length === 1
          ? 'Add more waypoints to enable reordering.'
          : ''}
      </div>
    </div>
  );
}