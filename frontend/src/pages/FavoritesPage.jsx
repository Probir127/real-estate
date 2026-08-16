import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FaHeart, FaSearch } from 'react-icons/fa'
import { Link } from 'react-router-dom'
import { favoritesApi } from '../api/client'
import PropertyCard from '../components/PropertyCard'
import { getErrorMessage } from '../utils/helpers'
import toast from 'react-hot-toast'
import './FavoritesPage.css'

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchFavorites = async () => {
    setLoading(true)
    try {
      const res = await favoritesApi.list()
      // API returns paginated or array
      const data = res.data.results || res.data || []
      setFavorites(data)
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchFavorites() }, [])

  const handleRemove = (favoriteId) => {
    setFavorites(prev => prev.filter(f => f.id !== favoriteId))
  }

  return (
    <main className="favorites-page page-wrapper">
      <div className="container">
        {/* Header */}
        <div className="favorites-page__header">
          <div className="favorites-page__title-row">
            <FaHeart className="favorites-page__icon" />
            <div>
              <h1>Saved Properties</h1>
              <p className="text-slate">
                {loading ? 'Loading…' : `${favorites.length} saved propert${favorites.length === 1 ? 'y' : 'ies'}`}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="favorites-page__grid">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="skeleton" style={{ height: 380, borderRadius: 16 }} />
            ))}
          </div>
        ) : favorites.length === 0 ? (
          <motion.div
            className="favorites-page__empty"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <FaHeart className="favorites-page__empty-icon" />
            <h3>No saved properties yet</h3>
            <p>Browse properties and tap the heart to save your favourites.</p>
            <Link to="/properties" className="btn btn-primary mt-lg">
              <FaSearch /> Browse Properties
            </Link>
          </motion.div>
        ) : (
          <motion.div
            className="favorites-page__grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {favorites.map(fav => (
              <PropertyCard
                key={fav.id}
                property={{
                  ...fav.property_detail,
                  is_favorited: true,
                  favorite_id: fav.id,
                }}
                onFavoriteToggle={() => handleRemove(fav.id)}
              />
            ))}
          </motion.div>
        )}
      </div>
    </main>
  )
}
