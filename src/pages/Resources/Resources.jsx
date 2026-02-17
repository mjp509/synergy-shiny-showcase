import { useState, useEffect } from 'react'
import { useDocumentHead } from '../../hooks/useDocumentHead'
import resourcesData from '../../data/resources.json'
import styles from './Resources.module.css'

export default function Resources() {
  const breadcrumbs = [
    { name: 'Home', url: '/' },
    { name: 'Resources', url: '/resources' }
  ];

  useDocumentHead({
    title: 'PokeMMO Resources - Guides, Tools & Community Links | Team Synergy',
    description: 'Explore Team Synergy\'s comprehensive PokeMMO resources. Find guides, tools, calculators, community links, and expert tips for shiny hunting, PVP training, and competitive gameplay.',
    canonicalPath: '/resources',
    breadcrumbs: breadcrumbs
  })

  // State for navigation through tabs
  const [activeCategory, setActiveCategory] = useState(Object.keys(resourcesData)[0])
  const [activeSubcategory, setActiveSubcategory] = useState(null)
  const [activeNestedTab, setActiveNestedTab] = useState(null)

  // Get available categories
  const categories = Object.keys(resourcesData)
  const currentCategory = resourcesData[activeCategory]
  const subcategories = currentCategory ? Object.keys(currentCategory) : []

  // Set initial subcategory when category changes
  useEffect(() => {
    const newSubcategories = currentCategory ? Object.keys(currentCategory) : []
    if (newSubcategories.length > 0) {
      setActiveSubcategory(newSubcategories[0])
      setActiveNestedTab(null)
    }
  }, [activeCategory])

  // Check if current subcategory has nested structure
  const getSubcategoryContent = () => {
    if (!activeSubcategory || !currentCategory) return null
    return currentCategory[activeSubcategory]
  }

  const subcategoryContent = getSubcategoryContent()
  const isNested = subcategoryContent && typeof subcategoryContent === 'object' && !Array.isArray(subcategoryContent)
  const nestedKeys = isNested ? Object.keys(subcategoryContent) : []

  // Set initial nested tab when subcategory changes
  useEffect(() => {
    if (!activeSubcategory) {
      setActiveNestedTab(null)
      return
    }
    
    const subcatContent = resourcesData[activeCategory]?.[activeSubcategory]
    const hasNesting = subcatContent && typeof subcatContent === 'object' && !Array.isArray(subcatContent)
    
    if (hasNesting) {
      const keys = Object.keys(subcatContent)
      setActiveNestedTab(keys[0] || null)
    } else {
      setActiveNestedTab(null)
    }
  }, [activeSubcategory, activeCategory])

  // Get items for current view
  const getItems = () => {
    if (!subcategoryContent) return []

    // If it's a direct array
    if (Array.isArray(subcategoryContent)) {
      return subcategoryContent.filter(item => item !== null && item !== undefined)
    }

    // If it's nested and we have a selected nested tab
    if (isNested && activeNestedTab) {
      const nestedContent = subcategoryContent[activeNestedTab]
      if (Array.isArray(nestedContent)) {
        return nestedContent.filter(item => item !== null && item !== undefined)
      }
    }

    return []
  }

  const items = getItems()

  // Dynamically render item fields, excluding certain keys
  const renderItemFields = (item) => {
    if (!item || typeof item !== 'object') return null

    const excludeKeys = ['name'] // Keys to exclude from display
    const entries = Object.entries(item).filter(([key]) => !excludeKeys.includes(key))

    return entries.map(([key, value]) => {
      // Special handling for links
      if (key === 'link' || key === 'url') {
        return null // Handled separately in the card
      }
      if (key === 'description') {
        return (
          <p key={key} className={styles.itemDescription}>
            {value}
          </p>
        )
      }
      return (
        <div key={key} className={styles.itemField}>
          <strong>{key.charAt(0).toUpperCase() + key.slice(1)}:</strong> {String(value)}
        </div>
      )
    })
  }

  return (
    <div className={styles.container}>
      <h1>Team Synergy Resources</h1>
      <p className={styles.intro}>
        Discover guides, tools, and community links to enhance your PokeMMO experience.
      </p>

      {/* Main Category Tabs */}
      <div className={styles.tabsContainer}>
        <div className={styles.tabs}>
          {categories.map(category => (
            <button
              key={category}
              className={`${styles.tab} ${activeCategory === category ? styles.activeTab : ''}`}
              onClick={() => setActiveCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Subcategory Tabs */}
      {subcategories.length > 0 && (
        <div className={styles.subTabsContainer}>
          <div className={styles.subTabs}>
            {subcategories.map(subcategory => (
              <button
                key={subcategory}
                className={`${styles.subTab} ${activeSubcategory === subcategory ? styles.activeSubTab : ''}`}
                onClick={() => {
                  setActiveSubcategory(subcategory)
                  // Immediately set the nested tab for this subcategory
                  const subcatContent = currentCategory?.[subcategory]
                  const hasNesting = subcatContent && typeof subcatContent === 'object' && !Array.isArray(subcatContent)
                  if (hasNesting) {
                    const keys = Object.keys(subcatContent)
                    setActiveNestedTab(keys[0] || null)
                  } else {
                    setActiveNestedTab(null)
                  }
                }}
              >
                {subcategory}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Nested Tabs (for third level) */}
      {isNested && nestedKeys.length > 0 && (
        <div className={styles.nestedTabsContainer}>
          <div className={styles.nestedTabs}>
            {nestedKeys.map(nestedKey => (
              <button
                key={nestedKey}
                className={`${styles.nestedTab} ${activeNestedTab === nestedKey ? styles.activeNestedTab : ''}`}
                onClick={() => setActiveNestedTab(nestedKey)}
              >
                {nestedKey}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Items Grid */}
      {items.length > 0 && (
        <div className={styles.itemsGrid}>
          {items.map((item, idx) => (
            item && (
              <div key={idx} className={styles.resourceCard}>
                <h3 className={styles.itemName}>{item.name || 'Unnamed Item'}</h3>
                {renderItemFields(item)}
                {(item.link || item.url) && (
                  <a
                    href={item.link || item.url}
                    target={(item.link || item.url).startsWith('http') ? '_blank' : '_self'}
                    rel={(item.link || item.url).startsWith('http') ? 'noopener noreferrer' : ''}
                    className={styles.itemLink}
                  >
                    Visit {item.name || 'Resource'}
                    {(item.link || item.url).startsWith('http') && (
                      <span className={styles.externalIcon}>↗</span>
                    )}
                  </a>
                )}
              </div>
            )
          ))}
        </div>
      )}

      {items.length === 0 && (
        <div className={styles.emptyState}>
          <p>No resources available in this section yet.</p>
        </div>
      )}
    </div>
  )
}
