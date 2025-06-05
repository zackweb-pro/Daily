import React, { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import { format, isValid } from 'date-fns'
import { FiEdit, FiTrash2 } from "react-icons/fi";

function EditIcon() {
  return <FiEdit className="action-icon" />
}

function DeleteIcon() {
  return <FiTrash2 className="action-icon" />
}
function JournalViewer() {
  const { id } = useParams()
  const navigate = useNavigate()
  
  const [entry, setEntry] = useState(null)
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    loadEntry()
  }, [id])
  
  const loadEntry = async () => {
    try {
      setLoading(true)
      const result = await window.api.journal.getEntry(id)
      
      // Parse frontmatter manually
      const lines = result.content.split('\n')
      let frontMatterFound = false
      let frontMatterEnd = -1
      let actualContent = ''
      let entryTitle = ''
      let entryDate = new Date()
      let entryCategories = []
      
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
            entryTitle = line.substring(6).trim()
          } else if (line.startsWith('date:')) {
            const dateStr = line.substring(5).trim()
            entryDate = new Date(dateStr)
          } else if (line.startsWith('categories:')) {
            const catText = line.substring(11).trim()
            if (catText.startsWith('[') && catText.endsWith(']')) {
              entryCategories = catText.slice(1, -1).split(',').map(c => c.trim())
            }
          }
        }
      }
      
      // Extract content after frontmatter
      if (frontMatterFound && frontMatterEnd > 0) {
        actualContent = lines.slice(frontMatterEnd + 1).join('\n')
      } else {
        actualContent = result.content
      }
      
      setEntry({
        id,
        title: entryTitle || 'Untitled Entry',
        date: entryDate,
        categories: entryCategories,
        content: actualContent,
      })
    } catch (error) {
      console.error('Failed to load entry:', error)
      navigate('/')
    } finally {
      setLoading(false)
    }
  }
  
  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this entry?')) {
      try {
        await window.api.journal.deleteEntry(id)
        navigate('/')
      } catch (error) {
        console.error('Failed to delete entry:', error)
      }
    }
  }
  
  const formatDate = (dateValue) => {
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
  
  if (loading) {
    return <div className="loading">Loading entry...</div>
  }
  
  if (!entry) {
    return <div className="error">Entry not found</div>
  }
  
  return (
    <div className="journal-viewer">
      <div className="viewer-header">
        <h2>{entry.title}</h2>
        <div className="entry-meta">
          <div className="entry-date">
            {formatDate(entry.date)}
          </div>
          {entry.categories && entry.categories.length > 0 && (
            <div className="entry-categories">
              {entry.categories.map(category => (
                <span key={category} className="category-tag">{category}</span>
              ))}
            </div>
          )}
        </div>
        <div className="viewer-actions">
          <Link to={`/edit/${id}`} className="edit-button"><EditIcon  /></Link>
          <button onClick={handleDelete} className="delete-button"><DeleteIcon  /></button>
          <Link to="/" className="back-button">Back to List</Link>
        </div>
      </div>
      
      <div className="markdown-content">
        <ReactMarkdown>{entry.content}</ReactMarkdown>
      </div>
    </div>
  )
}

export default JournalViewer