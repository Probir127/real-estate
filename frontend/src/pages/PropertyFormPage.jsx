import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FaUpload, FaTimes, FaTrash, FaStar } from 'react-icons/fa'
import { propertiesApi } from '../api/client'
import { getErrorMessage } from '../utils/helpers'
import toast from 'react-hot-toast'
import './PropertyFormPage.css'

const PROPERTY_TYPES = ['house','apartment','condo','townhouse','villa','land','commercial']
const LISTING_TYPES = [{ value: 'sale', label: 'For Sale' }, { value: 'rent', label: 'For Rent' }]
const STATUS_CHOICES = [
  { value: 'active', label: 'Active' },
  { value: 'pending', label: 'Pending' },
  { value: 'sold', label: 'Sold' },
  { value: 'rented', label: 'Rented' },
]

const EMPTY_FORM = {
  title: '', description: '', price: '',
  property_type: 'house', listing_type: 'sale', status: 'active',
  address: '', city: '', state: '', zip_code: '',
  latitude: '', longitude: '',
  bedrooms: 1, bathrooms: 1, area_sqft: 0, garage: 0, year_built: '',
  features: '', is_featured: false, is_published: true,
}

export default function PropertyFormPage() {
  const { id } = useParams() // if editing existing property
  const navigate = useNavigate()
  const isEdit = Boolean(id)

  const [form, setForm] = useState(EMPTY_FORM)
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(isEdit)

  // Image upload state
  const [newImages, setNewImages] = useState([]) // { file, preview }
  const [existingImages, setExistingImages] = useState([])

  // Fetch property data if editing
  useEffect(() => {
    if (!isEdit) return
    const fetchProperty = async () => {
      try {
        const res = await propertiesApi.getById(id)
        const p = res.data
        setForm({
          title: p.title || '',
          description: p.description || '',
          price: p.price || '',
          property_type: p.property_type || 'house',
          listing_type: p.listing_type || 'sale',
          status: p.status || 'active',
          address: p.address || '',
          city: p.city || '',
          state: p.state || '',
          zip_code: p.zip_code || '',
          latitude: p.latitude || '',
          longitude: p.longitude || '',
          bedrooms: p.bedrooms || 1,
          bathrooms: p.bathrooms || 1,
          area_sqft: p.area_sqft || 0,
          garage: p.garage || 0,
          year_built: p.year_built || '',
          features: p.features || '',
          is_featured: p.is_featured || false,
          is_published: p.is_published !== false,
        })
        setExistingImages(p.images || [])
      } catch {
        toast.error('Could not load property.')
        navigate('/dashboard')
      } finally { setFetching(false) }
    }
    fetchProperty()
  }, [id, isEdit])

  const handleField = (key, val) => setForm(prev => ({ ...prev, [key]: val }))

  const handleImageAdd = (e) => {
    const files = Array.from(e.target.files)
    const valid = files.filter(f => {
      if (f.size > 5 * 1024 * 1024) { toast.error(`${f.name} is over 5 MB.`); return false }
      return true
    })
    const previews = valid.map(f => ({ file: f, preview: URL.createObjectURL(f) }))
    setNewImages(prev => [...prev, ...previews])
  }

  const handleRemoveNew = (idx) => {
    setNewImages(prev => {
      URL.revokeObjectURL(prev[idx].preview)
      return prev.filter((_, i) => i !== idx)
    })
  }

  const handleDeleteExisting = async (imageId) => {
    try {
      await propertiesApi.deleteImage(imageId)
      setExistingImages(prev => prev.filter(img => img.id !== imageId))
      toast.success('Image deleted.')
    } catch (err) {
      toast.error(getErrorMessage(err))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.title || !form.price || !form.city || !form.address) {
      toast.error('Please fill in title, price, address, and city.')
      return
    }
    setLoading(true)
    try {
      let propertyId = id
      if (isEdit) {
        await propertiesApi.update(id, form)
        toast.success('Listing updated!')
      } else {
        const res = await propertiesApi.create(form)
        propertyId = res.data.id
        toast.success('Listing created!')
      }

      // Upload new images
      for (const img of newImages) {
        const fd = new FormData()
        fd.append('image', img.file)
        try {
          await propertiesApi.uploadImage(propertyId, fd)
        } catch {
          toast.error(`Failed to upload ${img.file.name}`)
        }
      }

      navigate(`/properties/${propertyId}`)
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally { setLoading(false) }
  }

  if (fetching) return (
    <div className="loading-wrapper page-wrapper"><div className="spinner" /></div>
  )

  return (
    <main className="property-form-page page-wrapper">
      <div className="container">
        <div className="property-form-page__header">
          <h1>{isEdit ? 'Edit Listing' : 'Create New Listing'}</h1>
          <p className="text-slate">
            {isEdit ? 'Update your property details below.' : 'Fill in the details to list your property.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-sections">

            {/* Basic Info */}
            <motion.section
              className="form-section glass-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0 }}
            >
              <h3>Basic Information</h3>
              <div className="form-group">
                <label className="form-label">Title *</label>
                <input type="text" className="form-input"
                  placeholder="e.g. Modern 3BR House in Downtown"
                  value={form.title}
                  onChange={e => handleField('title', e.target.value)}
                  maxLength={255} required />
              </div>
              <div className="form-group">
                <label className="form-label">Description *</label>
                <textarea className="form-textarea" rows={5}
                  placeholder="Describe the property, its features, neighbourhood…"
                  value={form.description}
                  onChange={e => handleField('description', e.target.value)}
                  required />
              </div>

              <div className="form-grid-3">
                <div className="form-group">
                  <label className="form-label">Property Type</label>
                  <select className="form-select" value={form.property_type}
                    onChange={e => handleField('property_type', e.target.value)}>
                    {PROPERTY_TYPES.map(t => (
                      <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Listing Type</label>
                  <select className="form-select" value={form.listing_type}
                    onChange={e => handleField('listing_type', e.target.value)}>
                    {LISTING_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select className="form-select" value={form.status}
                    onChange={e => handleField('status', e.target.value)}>
                    {STATUS_CHOICES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                </div>
              </div>

              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">Price (৳) *</label>
                  <input type="number" className="form-input" placeholder="e.g. 5000000 = ৳50 Lakh"
                    value={form.price}
                    onChange={e => handleField('price', e.target.value)}
                    min={0} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Year Built</label>
                  <input type="number" className="form-input" placeholder="e.g. 2018"
                    value={form.year_built}
                    onChange={e => handleField('year_built', e.target.value)}
                    min={1800} max={new Date().getFullYear()} />
                </div>
              </div>
            </motion.section>

            {/* Location */}
            <motion.section
              className="form-section glass-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
            >
              <h3>Location</h3>
              <div className="form-group">
                <label className="form-label">Street Address *</label>
                <input type="text" className="form-input" placeholder="123 Main Street"
                  value={form.address}
                  onChange={e => handleField('address', e.target.value)} required />
              </div>
              <div className="form-grid-3">
                <div className="form-group">
                  <label className="form-label">City *</label>
                  <input type="text" className="form-input" placeholder="e.g. Gulshan, Dhanmondi"
                    value={form.city}
                    onChange={e => handleField('city', e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label">State</label>
                  <input type="text" className="form-input" placeholder="NY"
                    value={form.state}
                    onChange={e => handleField('state', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">ZIP Code</label>
                  <input type="text" className="form-input" placeholder="10001"
                    value={form.zip_code}
                    onChange={e => handleField('zip_code', e.target.value)} />
                </div>
              </div>
              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">Latitude (optional)</label>
                  <input type="number" step="any" className="form-input"
                    value={form.latitude} onChange={e => handleField('latitude', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Longitude (optional)</label>
                  <input type="number" step="any" className="form-input"
                    value={form.longitude} onChange={e => handleField('longitude', e.target.value)} />
                </div>
              </div>
            </motion.section>

            {/* Details */}
            <motion.section
              className="form-section glass-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <h3>Property Details</h3>
              <div className="form-grid-4">
                {[
                  { label: 'Bedrooms', key: 'bedrooms', min: 0 },
                  { label: 'Bathrooms', key: 'bathrooms', min: 0 },
                  { label: 'Area (sqft)', key: 'area_sqft', min: 0 },
                  { label: 'Garage', key: 'garage', min: 0 },
                ].map(f => (
                  <div key={f.key} className="form-group">
                    <label className="form-label">{f.label}</label>
                    <input type="number" className="form-input"
                      value={form[f.key]}
                      onChange={e => {
                        const v = e.target.value;
                        handleField(f.key, v === '' ? '' : Number(v));
                      }}
                      min={f.min} />
                  </div>
                ))}
              </div>
              <div className="form-group">
                <label className="form-label">Features (comma-separated)</label>
                <input type="text" className="form-input"
                  placeholder="Pool, Garden, Gym, Parking, Air Conditioning"
                  value={form.features}
                  onChange={e => handleField('features', e.target.value)} />
              </div>

              {/* Flags */}
              <div className="form-flags">
                <label className="flag-toggle">
                  <input type="checkbox" checked={form.is_published}
                    onChange={e => handleField('is_published', e.target.checked)} />
                  <span>Published (visible to public)</span>
                </label>
                <label className="flag-toggle">
                  <input type="checkbox" checked={form.is_featured}
                    onChange={e => handleField('is_featured', e.target.checked)} />
                  <FaStar style={{ color: 'var(--gold-500)' }} />
                  <span>Featured Listing</span>
                </label>
              </div>
            </motion.section>

            {/* Images */}
            <motion.section
              className="form-section glass-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
            >
              <h3>Photos</h3>
              <p className="text-slate" style={{ fontSize: '0.875rem', marginBottom: '1rem' }}>
                Upload high-quality photos (JPG, PNG, WebP — max 5 MB each)
              </p>

              {/* Existing images */}
              {existingImages.length > 0 && (
                <div className="image-grid">
                  {existingImages.map(img => (
                    <div key={img.id} className="image-thumb">
                      <img src={img.image_url} alt={img.alt_text || 'Property'} />
                      {img.is_primary && (
                        <span className="image-thumb__badge">Primary</span>
                      )}
                      <button
                        type="button"
                        className="image-thumb__delete"
                        onClick={() => handleDeleteExisting(img.id)}
                        title="Delete image"
                      >
                        <FaTimes />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* New images preview */}
              {newImages.length > 0 && (
                <div className="image-grid" style={{ marginTop: '0.75rem' }}>
                  {newImages.map((img, i) => (
                    <div key={i} className="image-thumb image-thumb--new">
                      <img src={img.preview} alt="Preview" />
                      <button
                        type="button"
                        className="image-thumb__delete"
                        onClick={() => handleRemoveNew(i)}
                        title="Remove"
                      >
                        <FaTimes />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Upload button */}
              <label className="image-upload-area">
                <FaUpload />
                <span>Click to add photos</span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  onChange={handleImageAdd}
                  hidden
                />
              </label>
            </motion.section>
          </div>

          {/* Submit */}
          <div className="property-form-page__submit">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate(isEdit ? `/properties/${id}` : '/dashboard')}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
              {loading
                ? <><span className="spinner-sm" /> Saving…</>
                : isEdit ? 'Save Changes' : 'Publish Listing'
              }
            </button>
          </div>
        </form>
      </div>
    </main>
  )
}
