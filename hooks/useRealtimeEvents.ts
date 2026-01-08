'use client'

import { useEffect, useState } from 'react'
import { collection, onSnapshot, doc, query, where } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { Event } from '@/types/event'

/**
 * Hook to listen to events in real-time from Firestore
 */
export function useRealtimeEvents(publicAccess: boolean = false) {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!db) {
      setError('Firebase Firestore is not initialized')
      setLoading(false)
      return
    }

    try {
      // Create a query for events collection
      // Get all documents without orderBy (sort in memory to avoid index requirements)
      const eventsRef = collection(db, 'events')

      // Set up real-time listener
      const unsubscribe = onSnapshot(
        eventsRef,
        (snapshot) => {
          const eventsData: Event[] = []
          
          snapshot.forEach((doc) => {
            const data = doc.data()
            eventsData.push({
              id: doc.id,
              ...data,
              createdAt: data.createdAt?.toDate?.() || data.createdAt,
              updatedAt: data.updatedAt?.toDate?.() || data.updatedAt,
            } as Event)
          })

          // Sort by createdAt in descending order (newest first)
          eventsData.sort((a, b) => {
            if (!a.createdAt && !b.createdAt) return 0
            if (!a.createdAt) return 1
            if (!b.createdAt) return -1
            
            const dateA = a.createdAt instanceof Date ? a.createdAt.getTime() : new Date(a.createdAt).getTime()
            const dateB = b.createdAt instanceof Date ? b.createdAt.getTime() : new Date(b.createdAt).getTime()
            return dateB - dateA
          })

          setEvents(eventsData)
          setLoading(false)
          setError(null)
        },
        (err) => {
          console.error('Error listening to events:', err)
          setError('Failed to load events')
          setLoading(false)
        }
      )

      // Cleanup listener on unmount
      return () => unsubscribe()
    } catch (err) {
      console.error('Error setting up events listener:', err)
      setError('Failed to set up real-time listener')
      setLoading(false)
    }
  }, [])

  return { events, loading, error }
}

/**
 * Hook to listen to a single event in real-time from Firestore
 */
export function useRealtimeEvent(eventId: string) {
  const [event, setEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!db) {
      setError('Firebase Firestore is not initialized')
      setLoading(false)
      return
    }

    if (!eventId) {
      setLoading(false)
      return
    }

    try {
      const eventRef = doc(db, 'events', eventId)

      // Set up real-time listener for a single event
      const unsubscribe = onSnapshot(
        eventRef,
        (docSnapshot) => {
          if (docSnapshot.exists()) {
            const data = docSnapshot.data()
            setEvent({
              id: docSnapshot.id,
              ...data,
              createdAt: data.createdAt?.toDate?.() || data.createdAt,
              updatedAt: data.updatedAt?.toDate?.() || data.updatedAt,
            } as Event)
          } else {
            setEvent(null)
          }
          setLoading(false)
          setError(null)
        },
        (err) => {
          console.error('Error listening to event:', err)
          setError('Failed to load event')
          setLoading(false)
        }
      )

      // Cleanup listener on unmount
      return () => unsubscribe()
    } catch (err) {
      console.error('Error setting up event listener:', err)
      setError('Failed to set up real-time listener')
      setLoading(false)
    }
  }, [eventId])

  return { event, loading, error }
}

/**
 * Hook to listen to bookings for an event in real-time
 */
export function useRealtimeBookings(eventId: string) {
  const [bookings, setBookings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!db) {
      setError('Firebase Firestore is not initialized')
      setLoading(false)
      return
    }

    if (!eventId) {
      setLoading(false)
      return
    }

    try {
      const bookingsRef = collection(db, 'bookings')
      const bookingsQuery = query(bookingsRef, where('eventId', '==', eventId))

      // Set up real-time listener for bookings
      const unsubscribe = onSnapshot(
        bookingsQuery,
        (snapshot) => {
          const bookingsData: any[] = []
          
          snapshot.forEach((doc) => {
            const data = doc.data()
            const createdAt = data.createdAt?.toDate 
              ? data.createdAt.toDate().toISOString()
              : data.createdAt instanceof Date
              ? data.createdAt.toISOString()
              : data.createdAt

            bookingsData.push({
              id: doc.id,
              ...data,
              createdAt,
            })
          })

          // Sort by createdAt in descending order (newest first)
          bookingsData.sort((a, b) => {
            if (!a.createdAt && !b.createdAt) return 0
            if (!a.createdAt) return 1
            if (!b.createdAt) return -1
            
            const dateA = new Date(a.createdAt).getTime()
            const dateB = new Date(b.createdAt).getTime()
            return dateB - dateA
          })

          setBookings(bookingsData)
          setLoading(false)
          setError(null)
        },
        (err) => {
          console.error('Error listening to bookings:', err)
          setError('Failed to load bookings')
          setLoading(false)
        }
      )

      // Cleanup listener on unmount
      return () => unsubscribe()
    } catch (err) {
      console.error('Error setting up bookings listener:', err)
      setError('Failed to set up real-time listener')
      setLoading(false)
    }
  }, [eventId])

  return { bookings, loading, error }
}

