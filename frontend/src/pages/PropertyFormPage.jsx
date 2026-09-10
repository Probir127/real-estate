import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FaUpload, FaTimes, FaStar, FaPlus, FaCube, FaTrash } from 'react-icons/fa'
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
  layout_data: {},
}

const ROOM_PRESETS = ['Living Room','Dining Room','Master Bedroom','Bedroom','Kitchen','Bathroom','Study / Office','Hallway','Storage','Garage']
const ROOM_SIZES  = [{value:'small',label:'Small (~200 sqft)'},{value:'medium',label:'Medium (~350 sqft)'},{value:'large',label:'Large (~500+ sqft)'}]

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

  // Floor plan image upload state
  const [floorPlanFile, setFloorPlanFile] = useState(null)
  const [floorPlanPreview, setFloorPlanPreview] = useState(null)
  const existingFloorPlan = existingImages.find(img =>
    img.alt_text?.toLowerCase().includes('floor') ||
    img.alt_text?.toLowerCase().includes('plan') ||
    img.alt_text?.toLowerCase().includes('layout')
  ) || null

  // 3D layout rooms
  const [rooms, setRooms] = useState([])

  const addRoom = () => setRooms(prev => [...prev, { name: 'Living Room', size: 'medium', description: '' }])
  const removeRoom = (i) => setRooms(prev => prev.filter((_, idx) => idx !== i))
  const updateRoom = (i, key, val) => setRooms(prev => prev.map((r, idx) => idx === i ? { ...r, [key]: val } : r))

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
          layout_data: p.layout_data || {},
        })
        setExistingImages(p.images || [])
        // Pre-populate rooms from layout_data
        if (p.layout_data?.rooms?.length) {
          setRooms(p.layout_data.rooms)
        }
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

  const handleFloorPlanAdd = (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 8 * 1024 * 1024) { toast.error('Floor plan image must be under 8 MB.'); return }
    setFloorPlanFile(file)
    setFloorPlanPreview(URL.createObjectURL(file))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.title || !form.price || !form.city || !form.address) {
      toast.error('Please fill in title, price, address, and city.')
      return
    }
    setLoading(true)
    try {
      const layout_data = rooms.length > 0 ? { rooms } : {}
      const payload = {
        ...form,
        layout_data,
        price: Number(form.price),
        bedrooms: form.bedrooms ? Number(form.bedrooms) : 1,
        bathrooms: form.bathrooms ? Number(form.bathrooms) : 1,
        area_sqft: form.area_sqft ? Number(form.area_sqft) : 0,
        garage: form.garage ? Number(form.garage) : 0,
        year_built: form.year_built ? Number(form.year_built) : null,
        latitude: form.latitude ? Number(form.latitude) : null,
        longitude: form.longitude ? Number(form.longitude) : null,
      }

      let propertyId = id
      if (isEdit) {
        await propertiesApi.update(id, payload)
        toast.success('Listing updated!')
      } else {
        const res = await propertiesApi.create(payload)
        propertyId = res.data.id
        toast.success('Listing created!')
      }

      // Upload property photos
      for (const img of newImages) {
        const fd = new FormData()
        fd.append('image', img.file)
        try {
          await propertiesApi.uploadImage(propertyId, fd)
        } catch {
          toast.error(`Failed to upload ${img.file.name}`)
        }
      }

      // Upload floor plan image
      if (floorPlanFile) {
        const fd = new FormData()
        fd.append('image', floorPlanFile)
        fd.append('alt_text', 'floor_plan')
        try {
          await propertiesApi.uploadImage(propertyId, fd)
        } catch {
          toast.error('Failed to upload floor plan image')
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
              <label className="file-dropzone">
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

            {/* 3D Layout Builder */}
            <motion.section
              className="form-section glass-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="layout-section-header">
                <div>
                  <h3><FaCube style={{ color: 'var(--z-blue)', marginRight: '0.5rem' }} />3D Layout</h3>
                  <p className="text-slate" style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>
                    Describe the rooms so buyers can explore a 3D floor plan. Upload a 2D floor plan image too.
                  </p>
                </div>
              </div>

              {/* Room list */}
              {rooms.length > 0 && (
                <div className="layout-room-list">
                  {rooms.map((room, i) => (
                    <div key={i} className="layout-room-row">
                      <div className="layout-room-row__num">{i + 1}</div>

                      <div className="layout-room-row__fields">
                        <div className="form-group">
                          <label className="form-label">Room Name</label>
                          <select
                            className="form-select"
                            value={room.name}
                            onChange={e => updateRoom(i, 'name', e.target.value)}
                          >
                            {ROOM_PRESETS.map(p => <option key={p} value={p}>{p}</option>)}
                          </select>
                        </div>

                        <div className="form-group">
                          <label className="form-label">Size</label>
                          <select
                            className="form-select"
                            value={room.size || 'medium'}
                            onChange={e => updateRoom(i, 'size', e.target.value)}
                          >
                            {ROOM_SIZES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                          </select>
                        </div>

                        <div className="form-group layout-room-row__desc">
                          <label className="form-label">Description (optional)</label>
                          <input
                            type="text"
                            className="form-input"
                            placeholder="e.g. Spacious with balcony access"
                            value={room.description || ''}
                            onChange={e => updateRoom(i, 'description', e.target.value)}
                          />
                        </div>
                      </div>

                      <button
                        type="button"
                        className="layout-room-row__remove"
                        onClick={() => removeRoom(i)}
                        aria-label="Remove room"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <button
                type="button"
                className="layout-add-room-btn"
                onClick={addRoom}
              >
                <FaPlus /> Add Room
              </button>

              {/* Floor Plan Image Upload */}
              <div style={{ borderTop: '1px solid var(--z-gray-100)', paddingTop: '1.25rem' }}>
                <p className="form-label" style={{ marginBottom: '0.5rem' }}>Floor Plan Image (2D — optional)</p>
                <p className="text-slate" style={{ fontSize: '0.8rem', marginBottom: '0.75rem' }}>
                  Upload an architect drawing or plan sketch. Shown alongside the 3D view.
                </p>

                {/* Existing floor plan */}
                {existingFloorPlan && !floorPlanPreview && (
                  <div className="image-thumb" style={{ width: 180, height: 130, marginBottom: '0.75rem' }}>
                    <img src={existingFloorPlan.image_url} alt="Current floor plan" />
                    <button
                      type="button"
                      className="image-thumb__delete"
                      onClick={() => handleDeleteExisting(existingFloorPlan.id)}
                      title="Remove floor plan"
                    >
                      <FaTimes />
                    </button>
                  </div>
                )}

                {/* New floor plan preview */}
                {floorPlanPreview && (
                  <div className="image-thumb" style={{ width: 180, height: 130, marginBottom: '0.75rem' }}>
                    <img src={floorPlanPreview} alt="Floor plan preview" />
                    <button
                      type="button"
                      className="image-thumb__delete"
                      onClick={() => { setFloorPlanFile(null); setFloorPlanPreview(null) }}
                      title="Remove"
                    >
                      <FaTimes />
                    </button>
                  </div>
                )}

                <label className="file-dropzone" style={{ maxWidth: 320 }}>
                  <FaUpload />
                  <span>Upload floor plan image</span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/svg+xml"
                    onChange={handleFloorPlanAdd}
                    hidden
                  />
                </label>
              </div>
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
