import base64
import os
from pathlib import Path

def create_font_face_css(input_dir, output_file):
    # Create or clear output file
    with open(output_file, 'w') as f:
        f.write('')
    
    # Process each woff file
    for file_path in Path(input_dir).glob('*.woff'):
        # Read binary file
        with open(file_path, 'rb') as font_file:
            font_data = font_file.read()
        
        # Convert to base64
        base64_font = base64.b64encode(font_data).decode('utf-8')
        
        # Create font-face rule
        font_name = file_path.stem
        css_template = f"""@font-face {{
    font-family: '{font_name}';
    src: url(data:font/woff;charset=utf-8;base64,{base64_font}) format('woff');
    font-weight: normal;
    font-style: normal;
}}
"""
        # Append to output file
        with open(output_file, 'a') as f:
            f.write(css_template + '\n')

# Usage
input_directory = 'fonts'  # Directory containing your woff files
output_css = 'cfr-fonts.css'   # Output CSS file
create_font_face_css(input_directory, output_css)
