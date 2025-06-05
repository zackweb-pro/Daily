import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import { format, isValid } from 'date-fns'
import templates from '../utils/journalTemplates'

function JournalEditor() {
  const { id } = useParams()
  const navigate = useNavigate()
  
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [categories, setCategories] = useState('')
  const [previewMode, setPreviewMode] = useState(false)
  const [showTemplateSelector, setShowTemplateSelector] = useState(!id)
  
  useEffect(() => {
    if (id) {
      loadEntry(id)
    }
  }, [id])
  
  const loadEntry = async (entryId) => {
    try {
      const entry = await window.api.journal.getEntry(entryId)
      
      // Parse frontmatter manually
      const lines = entry.content.split('\n')
      let frontMatterFound = false
      let frontMatterEnd = -1
      let actualContent = ''
      let entryTitle = ''
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
        actualContent = entry.content
      }
      
      setTitle(entryTitle || '')
      setContent(actualContent || '')
      setCategories(entryCategories.join(', ') || '')
      setShowTemplateSelector(false)
    } catch (error) {
      console.error('Failed to load entry:', error)
      navigate('/')
    }
  }
  
  const saveEntry = async () => {
    try {
      // Parse categories into an array
      const categoryArray = categories
        .split(',')
        .map(cat => cat.trim())
        .filter(cat => cat.length > 0)
      
      // Create frontmatter manually
      const frontMatter = [
        '---',
        `title: ${title}`,
        `date: ${new Date().toISOString()}`,
        `categories: [${categoryArray.join(', ')}]`,
        '---'
      ].join('\n')
      
      // Combine frontmatter and content
      const markdown = `${frontMatter}\n\n${content}`
      
      console.log("Saving entry with content type:", typeof markdown)
      
      // Save to file system
      const result = await window.api.journal.saveEntry({
        id: id || undefined,
        content: markdown
      })
      
      console.log("Save result:", result)
      
      if (!result || !result.id) {
        throw new Error("Save failed: No ID returned")
      }
      
      navigate(`/view/${result.id}`)
    } catch (error) {
      console.error('Failed to save entry:', error)
      alert(`Failed to save entry: ${error.message}`)
    }
  }
  
  const getMdContent = () => {
    return `# ${title}\n\n${content}`
  }
  
  const applyTemplate = (templateKey) => {
    if (templates[templateKey]) {
      setContent(templates[templateKey].content)
    }
    setShowTemplateSelector(false)
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
  
  return (
    <div className="journal-editor">
      <div className="editor-header">
        <h2>{id ? 'Edit Journal Entry' : 'New Journal Entry'}</h2>
        <div className="editor-actions">
          {!id && (
            <button 
              onClick={() => setShowTemplateSelector(!showTemplateSelector)} 
              className="template-button"
            >
              {showTemplateSelector ? 'Hide Templates' : 'Show Templates'}
            </button>
          )}
          <button 
            onClick={() => setPreviewMode(!previewMode)}
            className="preview-button"
          >
            {previewMode ? 'Edit' : 'Preview'}
          </button>
          <button onClick={saveEntry} className="save-button">Save</button>
          <button onClick={() => navigate(-1)} className="cancel-button">Cancel</button>
        </div>
      </div>
      
      {showTemplateSelector && (
        <div className="template-selector">
          <h3>Choose a Template</h3>
          <div className="templates-grid">
            {Object.entries(templates).map(([key, template]) => (
              <div 
                key={key} 
                className="template-card" 
                onClick={() => applyTemplate(key)}
              >
                <h4>{template.name}</h4>
                <p>{template.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {previewMode ? (
        <div className="preview-mode">
          <ReactMarkdown>{getMdContent()}</ReactMarkdown>
        </div>
      ) : (
        <div className="edit-mode">
          <div className="form-group">
            <label>Title</label>
            <input 
              type="text" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Journal Entry Title"
              className="title-input" 
            />
          </div>
          
          <div className="form-group">
            <label>Categories (comma-separated)</label>
            <input 
              type="text" 
              value={categories} 
              onChange={(e) => setCategories(e.target.value)}
              placeholder="personal, work, ideas"
              className="categories-input" 
            />
          </div>
          
          <div className="form-group">
            <label>Content (Markdown)</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your journal entry here using Markdown..."
              className="content-textarea"
              rows={15}
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default JournalEditor