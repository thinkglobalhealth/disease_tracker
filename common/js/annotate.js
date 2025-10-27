/**
 * Annotation System
 * Two-column annotation layout with responsive design
 * Uses data attributes instead of custom elements
 */
(function() {
  // Initialize annotation system when DOM is loaded
  document.addEventListener('DOMContentLoaded', function() {
    // Initialize annotated content (for embedding in articles)
    initAnnotations();
    
    // Initialize annotation tool (only runs if tool elements exist)
    initAnnotationTool();
  });
  
  /**
   * Initialize annotations in the document
   * Finds content with data-annotation attribute and applies styles/effects
   */
  function initAnnotations() {
    // Find all annotation containers
    const containers = document.querySelectorAll('[data-annotation-container]');
    
    /**
     * <svg width="0" height="0" style="position: absolute;">
        <defs>
          <filter id="noise">
            <feTurbulence baseFrequency="0.015"/>
            <feDisplacementMap in="SourceGraphic" scale="10"/>
          </filter>
          <filter id="noise1">
            <feTurbulence baseFrequency="0.5"/>
            <feDisplacementMap in="SourceGraphic" scale="2"/>
           </filter>
        </defs>
    </svg>
     */

    containers.forEach(container => {
      // Apply CSS to container if not already present
      if (!document.getElementById('annotation-styles')) {
        const styleEl = document.createElement('style');
        styleEl.id = 'annotation-styles';
        styleEl.textContent = getAnnotationStyles();
        document.head.appendChild(styleEl);
      }
      
      // Make sure container has the article-container class
      container.classList.add('article-container');
      
      // Apply rough notation effects to any annotated spans
      applyRoughNotation(container);
    });
  }
  

  /**
   * Apply rough notation effects to annotated spans
   */
  function applyRoughNotation(container) {
    setTimeout(() => {
      // Check if RoughNotation is loaded
      if (typeof RoughNotation === 'undefined') {
        console.warn('RoughNotation library not loaded');
        return;
      }
      
      try {
        // Configure annotation styles
        const annotationConfigs = {
          highlight: {
            type: 'highlight',
            color: '#ffea86',
            multiline: true
          },
          underline: {
            type: 'underline',
            color: '#bf232e',
            strokeWidth: 2.5,
            iterations: 1,
            multiline: true
          },
          box: {
            type: 'box',
            color: '#bf232e',
            strokeWidth: 2.5,
            iterations: 1,
          },
          bracket: {
            type: 'bracket',
            color: '#bf232e',
            strokeWidth: 2.5,
            padding: 10,
            iterations: 1, // reduces sketchy look
          },
          circle: {
            type: 'circle',
            color: '#bf232e',
            strokeWidth: 2.5,
            iterations: 1,
          },
          cross: {
            type: 'crossed-off',
            color: '#bf232e',
            strokeWidth: 2.5,
            iterations: 1,
          },
          strike: {
            type: 'strike-through',
            color: '#bf232e',
            strokeWidth: 2.5,
          }
        };
        
        // Find and apply annotations based on selectors
        Object.entries(annotationConfigs).forEach(([key, config]) => {
          const selector = `.${key}, [data-annotation='${key}']`;
          const elements = container.querySelectorAll(selector);
          
          elements.forEach(el => {
            if (el) {
              const annotation = RoughNotation.annotate(el, config);
              annotation.show();
            }
          });
        });
      } catch (e) {
        console.error('Annotation error:', e);
      }
    }, 100);
  }
  
  /**
   * Initialize the annotation tool interface
   * Only runs if tool elements are present on the page
   */
  function initAnnotationTool() {
    const editor = document.getElementById('editor');
    if (!editor) return; // Exit if not in annotation tool
    
    const note = document.getElementById('note');
    const attribution = document.getElementById('attribution');
    const preview = document.getElementById('preview');
    const collection = document.getElementById('collection');
    
    // Initialize annotation tool buttons
    const toolbarButtons = document.querySelectorAll('.toolbar button');
    toolbarButtons.forEach(button => {
      button.addEventListener('click', function() {
        const style = this.getAttribute('data-style');
        wrapSelectedTextWithAnnotation(style);
      });
    });
    
    // Editor handlers
    editor.addEventListener('input', updatePreview);
    
    // Add to collection
    document.getElementById('add-button').addEventListener('click', function() {
      if (editor.value.trim() === '') return;
      
      let entry = '';
      if (collection.value !== '') {
        entry += '\n\n';
      }
      
      // Structure for new content row
      if (collection.value === '') {
        // First entry - add container
        entry += '<main data-annotation-container>\n\n';
      }
      
      // Add content row
      entry += '<section class="content-row">\n';
      
      // Add annotated text section
      entry += '  <article class="article-section">\n';
      entry += '    <p>' + editor.value + '</p>\n';
      entry += '  </article>\n';
      
      // Add annotation note with attribution if provided
      if (note.value.trim() !== '') {
        // Desktop annotation
        entry += '  <aside class="annotation">\n';
        entry += '    <p>' + note.value.trim() + '</p>\n';
        if (attribution.value.trim() !== '') {
          entry += '    <p class="annotation-attribution">— ' + attribution.value.trim() + '</p>\n';
        }
        entry += '  </aside>\n';
        
        // Mobile annotation (hidden on desktop, shown on mobile)
        entry += '  <aside class="mobile-annotation">\n';
        entry += '    <p>' + note.value.trim() + '</p>\n';
        if (attribution.value.trim() !== '') {
          entry += '    <p class="annotation-attribution">— ' + attribution.value.trim() + '</p>\n';
        }
        entry += '  </aside>\n';
      } else {
        // Empty annotation placeholder (for layout)
        entry += '  <aside class="annotation-placeholder"></aside>\n';
      }
      
      entry += '</section>\n';
      
      collection.value += entry;
      
      // Close container tag if this is the first entry
      if (collection.value.trim() === entry.trim()) {
        collection.value += '\n</main>';
      }
      
      // Clear fields
      editor.value = '';
      note.value = '';
      attribution.value = '';
      updatePreview();
    });
    
    // Copy collection
    document.getElementById('copy-button').addEventListener('click', function() {
      collection.select();
      document.execCommand('copy');
      this.textContent = 'Copied!';
      setTimeout(() => {
        this.textContent = 'Copy Collection';
      }, 2000);
    });
    
    // Clear buttons
    document.getElementById('clear-editor-button').addEventListener('click', function() {
      editor.value = '';
      note.value = '';
      attribution.value = '';
      updatePreview();
    });
    
    document.getElementById('clear-collection-button').addEventListener('click', function() {
      collection.value = '';
    });
    
    // Update preview
    function updatePreview() {
      preview.innerHTML = editor.value;
      applyRoughNotation(preview);
    }
    
    // Wrap selected text with annotation
    function wrapSelectedTextWithAnnotation(style) {
      const start = editor.selectionStart;
      const end = editor.selectionEnd;
      
      if (start === end) return; // No selection
      
      const selectedText = editor.value.substring(start, end);
      const newText = `<span data-annotation="${style}">${selectedText}</span>`;
      
      editor.value = editor.value.substring(0, start) + newText + editor.value.substring(end);
      updatePreview();
      
      // Position cursor after insertion
      editor.focus();
      editor.selectionStart = start + newText.length;
      editor.selectionEnd = start + newText.length;
    }
    
    // Initialize
    updatePreview();
  }
  
  /**
   * Get CSS styles for annotation layout
   */
  function getAnnotationStyles() {
    return `
      /* Two-column annotation layout */
      [data-annotation-container] {
        display: grid;
        grid-template-columns: 2fr 1fr; /* Content takes 2/3, annotations take 1/3 */
        gap: 30px;
        margin-bottom: 30px;
      }
      
      .content-row {
        display: contents; /* Makes children direct children of the grid */
      }
      
      .article-section {
        margin-bottom: 1.5rem;
        position: relative;
      }
      
      .article-section p {
        margin-top: 0;
      }
      
      .annotation {
        background-color: #f8f8f8;
        border-left: 3px solid #0066cc;
        padding: 15px;
        border-radius: 0 4px 4px 0;
        margin-bottom: 1.5rem;
        font-size: 0.9rem;
      }
      
      .annotation p {
        margin-top: 0;
      }
      
      .annotation-title {
        font-weight: bold;
        margin-bottom: 8px;
        color: #0066cc;
      }
      
      .annotation-attribution {
        text-align: right;
        font-style: italic;
        margin-top: 8px;
        color: #666;
      }
      
      .annotation-placeholder {
        margin-bottom: 1.5rem;
      }
      
      /* Hide mobile annotations by default */
      .mobile-annotation {
        display: none;
      }
      
      /* Mobile responsive layout */
      @media (max-width: 768px) {
        [data-annotation-container] {
          grid-template-columns: 1fr;
          gap: 0;
        }
        
        .annotation {
          display: none; /* Hide desktop annotations */
        }
        
        .mobile-annotation {
          display: block; /* Show mobile annotations */
          background-color: #f8f8f8;
          border-left: 3px solid #0066cc;
          padding: 15px;
          border-radius: 0 4px 4px 0;
          margin-top: 1rem;
          margin-bottom: 1.5rem;
          font-size: 0.9rem;
        }
      }
      
      /* Classes for rough-notation */
      .highlight, .underline, .box, .bracket, .circle, .cross, .strike,
      [data-annotation="highlight"], [data-annotation="underline"], 
      [data-annotation="box"], [data-annotation="bracket"], 
      [data-annotation="circle"], [data-annotation="cross"], 
      [data-annotation="strike"] {
        position: relative;
        z-index: 1;
  
      }

      .rough-annotation {
            mix-blend-mode: hue;
  }
    `;
  }
})();