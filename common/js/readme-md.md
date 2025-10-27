# Responsive Two-Column Annotation System

This is a lightweight web-based annotation system that creates a responsive two-column layout for annotated content. The main content appears in the left column (2/3 width) and annotation notes appear in the right column (1/3 width) on desktop screens. On mobile devices, the layout stacks to a single column with annotations appearing below their respective content sections.

## Features

- Simple annotation tool interface for marking up text
- Multiple annotation styles using the rough-notation library (highlight, underline, box, etc.)
- Responsive two-column layout that adapts to different screen sizes
- Easy integration with any CMS or website
- No custom elements - uses standard HTML with data attributes
- Includes both the annotation tool and renderer in a single JavaScript file

## How to Use

### 1. Include Required Files

```html
<!-- Include the rough-notation library -->
<script src="https://unpkg.com/rough-notation/lib/rough-notation.iife.js"></script>

<!-- Include the annotation script -->
<script src="annotate.js"></script>
```

### 2. Create Annotated Content

You can either:

a) Use the annotation tool (annotate.html) to create and preview annotations, then copy the generated code to your page.

b) Manually create annotated content using the following structure:

```html
<div data-annotation-container>
  <div class="content-row">
    <div class="article-section">
      <p>Here is some content with <span data-annotation="highlight">highlighted text</span>.</p>
    </div>
    <div class="annotation">
      <p>This is an annotation note that appears in the right column.</p>
      <div class="annotation-attribution">— Attribution Name</div>
    </div>
    <div class="mobile-annotation">
      <p>This is an annotation note that appears below the content on mobile.</p>
      <div class="annotation-attribution">— Attribution Name</div>
    </div>
  </div>
</div>
```

### 3. Annotation Styles

The following annotation styles are available:

- `data-annotation="highlight"` - Yellow highlight
- `data-annotation="underline"` - Red underline
- `data-annotation="box"` - Red box around the text
- `data-annotation="bracket"` - Red brackets around the text
- `data-annotation="circle"` - Red circle around the text
- `data-annotation="cross"` - Red cross through the text
- `data-annotation="strike"` - Red strikethrough

## Customization

The annotation styles can be customized by modifying the `annotate.js` file. Look for the `applyRoughNotation` function to change colors and other properties of the annotations.

## Browser Compatibility

This annotation system works in all modern browsers that support CSS Grid and ES6 JavaScript.

## License

This project is available under the MIT License.
