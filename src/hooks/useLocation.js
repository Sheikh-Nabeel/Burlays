import { useState, useEffect } from 'react'

export const useLocation = () => {
const [location, setLocation] = useState({
  countryCode: "PK",
  country: "Pakistan",
});


  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchLocation = async () => {
      try {
        // Try ip-api.com first (better CORS support) - use HTTPS
        const response = await fetch('https://ip-api.com/json/?fields=status,countryCode,country')
        
        if (response.ok) {
          const data = await response.json()
          if (data.status === 'success' && data.countryCode) {
            setLocation({
              countryCode: data.countryCode || 'PK',
              country: data.country || 'Pakistan'
            })
            setLoading(false)
            return
          }
        }
        
        // Fallback: Try ipapi.co with error handling
        try {
          const fallbackResponse = await fetch('https://ipapi.co/json/')
          if (fallbackResponse.ok) {
            const fallbackData = await fallbackResponse.json()
            setLocation({
              countryCode: fallbackData.country_code || 'PK',
              country: fallbackData.country_name || 'Pakistan'
            })
          }
        } catch (fallbackErr) {
          // If both fail, keep default (Pakistan)
          console.warn('Location service unavailable, using default (Pakistan)')
        }
      } catch (err) {
        console.warn('Error fetching location:', err)
        setError(err.message)
        // Keep default location on error (Pakistan)
      } finally {
        setLoading(false)
      }
    }
    
    fetchLocation()
  }, [])

  return { location, loading, error }
}