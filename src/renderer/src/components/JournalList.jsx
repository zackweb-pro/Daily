import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { format, isValid } from 'date-fns'

function JournalList() {
  const [entries, setEntries] = useState([])
  const [filteredEntries, setFilteredEntries] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [categories, setCategories] = useState([])
  
  useEffect(() => {
    loadEntries()
  }, [])
  
  useEffect(() => {
    filterEntries()
  }, [searchTerm, selectedCategory, entries])
  
  const loadEntries = async () => {
    try {
      const allEntries = await window.api.journal.getAll()
      
      // Parse frontmatter manually
      const parsedEntries = allEntries.map(entry => {
        const lines = entry.content.split('\n')
        let frontMatterFound = false
        let frontMatterEnd = -1
        let title = 'Untitled Entry'
        let date = new Date()
        let categories = []
        
        // Find YAML frontmatter between --- markers
        if (lines[0] === '---') {
          frontMatterFound = true
          for (let i = 1; i < lines.length; i++) {
            if (lines[i] === '---') {
              frontMatterEnd = i
              break
            }
            
            const line = lines[i]
            if (line.startsWith('title:')) {
              title = line.substring(6).trim()
            } else if (line.startsWith('date:')) {
              const dateStr = line.substring(5).trim()
              date = new Date(dateStr)
            } else if (line.startsWith('categories:')) {
              const catText = line.substring(11).trim()
              if (catText.startsWith('[') && catText.endsWith(']')) {
                categories = catText.slice(1, -1).split(',').map(c => c.trim())
              }
            }
          }
        }
        
        // Extract content after frontmatter
        let content = entry.content
        if (frontMatterFound && frontMatterEnd > 0) {
          content = lines.slice(frontMatterEnd + 1).join('\n')
        }
        
        return {
          ...entry,
          title,
          date,
          categories,
          excerpt: content.substring(0, 100) + (content.length > 100 ? '...' : ''),
          parsed: true
        }
      })
      
      // Sort by date (newest first)
      parsedEntries.sort((a, b) => new Date(b.date) - new Date(a.date))
      
      setEntries(parsedEntries)
      setFilteredEntries(parsedEntries) // Initialize filtered entries with all entries
      
      // Extract unique categories
      const allCategories = new Set()
      parsedEntries.forEach(entry => {
        if (Array.isArray(entry.categories)) {
          entry.categories.forEach(cat => allCategories.add(cat))
        }
      })
      setCategories([...allCategories])
    } catch (error) {
      console.error('Failed to load entries:', error)
    }
  }
  
  const filterEntries = () => {
    let filtered = [...entries]
    
    // Filter by search term
    if (searchTerm && searchTerm.trim() !== '') {
      const searchLower = searchTerm.toLowerCase().trim()
      filtered = filtered.filter(entry => 
        (entry.title && entry.title.toLowerCase().includes(searchLower)) || 
        (entry.content && entry.content.toLowerCase().includes(searchLower)) ||
        (entry.excerpt && entry.excerpt.toLowerCase().includes(searchLower))
      )
    }
    
    // Filter by category
    if (selectedCategory) {
      filtered = filtered.filter(entry => 
        Array.isArray(entry.categories) && entry.categories.includes(selectedCategory)
      )
    }
    
    console.log('Filtering entries:', {
      searchTerm,
      selectedCategory,
      totalEntries: entries.length,
      filteredCount: filtered.length
    })
    
    setFilteredEntries(filtered)
  }
  
  // Safe format function to handle potentially invalid dates
  const formatDate = (dateValue) => {
    // Check if the date is valid first
    const date = new Date(dateValue);
    if (!dateValue || !isValid(date)) {
      return 'No date';
    }
    try {
      return format(date, 'MMMM d, yyyy');
    } catch (error) {
      console.error('Date formatting error:', error);
      return 'Invalid date';
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };
  
  const handleDelete = async (id, e) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (confirm('Are you sure you want to delete this entry?')) {
      try {
        await window.api.journal.deleteEntry(id)
        loadEntries()
      } catch (error) {
        console.error('Failed to delete entry:', error)
      }
    }
  }
  
  return (
    <div className="journal-list">
      <div className="filters">
        <div className="search-container">
          <input
            type="text"
            placeholder="Search entries..."
            value={searchTerm}
            onChange={handleSearch}
            className="search-input"
          />
          {searchTerm && (
            <button className="search-clear" onClick={() => setSearchTerm('')}>
              ✕
            </button>
          )}
        </div>
        
        <select 
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="category-filter"
        >
          <option value="">All Categories</option>
          {categories.map(category => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
        
        <button onClick={() => { setSearchTerm(''); setSelectedCategory('') }} className="clear-filters-button">
          Clear Filters
        </button>
      </div>
      
      <div className="entries-list">
        {filteredEntries.length === 0 ? (
          <p className="no-entries">No journal entries found</p>
        ) : (
          filteredEntries.map(entry => (
            <div key={entry.id} className="entry-card">
              <Link to={`/view/${entry.id}`} className="entry-link">
                <h3 className="entry-title">{entry.title}</h3>
                <div className="entry-meta">
                  <span className="entry-date">
                    {formatDate(entry.date)}
                  </span>
                  {entry.categories && entry.categories.length > 0 && (
                    <div className="entry-categories">
                      {entry.categories.map(cat => (
                        <span key={cat} className="category-tag">{cat}</span>
                      ))}
                    </div>
                  )}
                </div>
                <p className="entry-excerpt">{entry.excerpt}</p>
              </Link>
              <div className="entry-actions">
                <Link to={`/edit/${entry.id}`} className="edit-button">✏️ Edit</Link>
                <button 
                  onClick={(e) => handleDelete(entry.id, e)} 
                  className="delete-button"
                >🗑️ Delete</button>
              </div>
            </div>
          ))
        )}
      </div>
      
      <Link to="/new" className="new-entry-button">
        New Journal Entry
      </Link>
    </div>
  )
}

export default JournalList