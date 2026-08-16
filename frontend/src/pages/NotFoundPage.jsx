import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FaHome, FaSearch } from 'react-icons/fa'
import './NotFoundPage.css'

export default function NotFoundPage() {
  return (
    <main className="notfound page-wrapper">
      <div className="container notfound__inner">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="notfound__content"
        >
          {/* Big 404 */}
          <div className="notfound__code" aria-hidden="true">404</div>

          <h1 className="notfound__title">Page Not Found</h1>
          <p className="notfound__desc">
            The page you're looking for doesn't exist or has been moved.
          </p>

          <div className="notfound__actions">
            <Link to="/" className="btn btn-primary btn-lg">
              <FaHome /> Back to Home
            </Link>
            <Link to="/properties" className="btn btn-secondary btn-lg">
              <FaSearch /> Browse Properties
            </Link>
          </div>
        </motion.div>
      </div>
    </main>
  )
}
