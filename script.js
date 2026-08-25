document.addEventListener('DOMContentLoaded', function() {
    const generateBtn = document.getElementById('generate-btn');
    const clearBtn = document.getElementById('clear-btn');
    const copyBtn = document.getElementById('copy-btn');
    const channelInput = document.getElementById('channel-name');
    const contentInput = document.getElementById('post-content');
    const themeInput = document.getElementById('theme');
    const previewsContainer = document.getElementById('previews-container');
    
    // Initialize preview
    updatePreview();
    
    // Theme handler
    themeInput.addEventListener('change', function() {
        document.body.className = this.value + '-mode';
        updatePreview();
    });
    
    // Update preview when inputs change
    channelInput.addEventListener('input', updatePreview);
    contentInput.addEventListener('input', updatePreview);
    
    generateBtn.addEventListener('click', function() {
        updatePreview();
    });
    
    clearBtn.addEventListener('click', function() {
        if(confirm('Are you sure you want to clear all content?')) {
            contentInput.value = '';
            channelInput.value = '';
            updatePreview();
        }
    });
    
    copyBtn.addEventListener('click', function() {
        const script = generateScript();
        navigator.clipboard.writeText(script)
            .then(() => {
                alert('Illustrator script copied to clipboard!');
            })
            .catch(err => {
                console.error('Failed to copy: ', err);
                alert('Could not copy script. Please try again.');
            });
    });
    
    function updatePreview() {
        const channelName = channelInput.value || 'Your Channel Name';
        const content = contentInput.value;
        const theme = themeInput.value;
        
        // Split content into pages
        const pages = splitContent(content);
        
        // Clear previous previews
        previewsContainer.innerHTML = '';
        
        // Add pagination controls if multiple pages
        if (pages.length > 1) {
            const pagination = createPagination(pages.length);
            previewsContainer.appendChild(pagination);
        }
        
        // Create preview for each page
        pages.forEach((pageContent, index) => {
            const preview = createPreview(channelName, pageContent, theme, index + 1, pages.length);
            previewsContainer.appendChild(preview);
        });
    }
    
    function splitContent(text, maxChars = 1000) {
        if (!text.trim()) return [""];
        
        const paragraphs = text.split('\n\n');
        const pages = [];
        let currentPage = "";
        
        paragraphs.forEach(para => {
            // If the paragraph is too big, split it into lines
            if (para.length > maxChars) {
                const lines = para.split('\n');
                
                lines.forEach(line => {
                    if (line.length > maxChars) {
                        // Split long lines into chunks
                        let start = 0;
                        while (start < line.length) {
                            const chunk = line.substring(start, start + maxChars);
                            currentPage += chunk + "\n";
                            
                            if (currentPage.length >= maxChars) {
                                pages.push(currentPage.trim());
                                currentPage = "";
                            }
                            
                            start += maxChars;
                        }
                    } else {
                        if (currentPage.length + line.length > maxChars) {
                            pages.push(currentPage.trim());
                            currentPage = "";
                        }
                        currentPage += line + "\n";
                    }
                });
                
                currentPage += "\n";
            } else {
                if (currentPage.length + para.length > maxChars) {
                    pages.push(currentPage.trim());
                    currentPage = "";
                }
                currentPage += para + "\n\n";
            }
            
            // Check page length after adding paragraph
            if (currentPage.length >= maxChars) {
                pages.push(currentPage.trim());
                currentPage = "";
            }
        });
        
        // Add the last page
        if (currentPage.trim().length > 0) {
            pages.push(currentPage.trim());
        }
        
        return pages;
    }
    
    function createPreview(channelName, content, theme, currentPage, totalPages) {
        const preview = document.createElement('div');
        preview.className = 'telegram-preview';
        
        // Add title if multiple pages
        let titleHTML = '';
        if (totalPages > 1) {
            titleHTML = `<div class="preview-title">Preview ${currentPage} of ${totalPages}</div>`;
        }
        
        preview.innerHTML = `
            ${titleHTML}
            <div class="preview-content">
                <div class="preview-header">
                    <div class="avatar">${getChannelInitials(channelName)}</div>
                    <div class="channel-info">
                        <h3>${channelName}</h3>
                        <p>Today at ${getCurrentTime()} • ${formatNumber(Math.floor(Math.random() * 10000))} subscribers</p>
                    </div>
                </div>
                
                <div class="divider"></div>
                
                <div class="post-content">
                    ${formatContent(content)}
                </div>
                
                <div class="footer-stats">
                    <div>👍 ${formatNumber(Math.floor(Math.random() * 1000))}</div>
                    <div>💬 ${formatNumber(Math.floor(Math.random() * 100))} comments</div>
                    <div>🔗 ${formatNumber(Math.floor(Math.random() * 500))} shares</div>
                </div>
            </div>
        `;
        
        return preview;
    }
    
    function createPagination(totalPages) {
        const pagination = document.createElement('div');
        pagination.className = 'pagination-controls';
        pagination.innerHTML = `
            <button class="page-btn" id="prev-btn" disabled>Previous</button>
            <div class="page-indicator">Page <span id="current-page">1</span> of ${totalPages}</div>
            <button class="page-btn" id="next-btn">Next</button>
        `;
        
        const prevBtn = pagination.querySelector('#prev-btn');
        const nextBtn = pagination.querySelector('#next-btn');
        const currentPageSpan = pagination.querySelector('#current-page');
        
        let currentPage = 1;
        
        function updatePagination() {
            previewsContainer.scrollTop = 0;
            document.querySelectorAll('.telegram-preview').forEach((preview, index) => {
                preview.style.display = index === currentPage - 1 ? 'block' : 'none';
            });
            
            currentPageSpan.textContent = currentPage;
            prevBtn.disabled = currentPage === 1;
            nextBtn.disabled = currentPage === totalPages;
        }
        
        prevBtn.addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                updatePagination();
            }
        });
        
        nextBtn.addEventListener('click', () => {
            if (currentPage < totalPages) {
                currentPage++;
                updatePagination();
            }
        });
        
        // Initially show only the first preview
        updatePagination();
        
        return pagination;
    }
    
    function formatContent(text) {
        // Format markdown
        let formatted = text
            .replace(/\*\*(.*?)\*\*/g, '<span class="bold">$1</span>')
            .replace(/\*(.*?)\*/g, '<span class="italic">$1</span>')
            .replace(/`([^`]+)`/g, '<span class="code">$1</span>')
            .replace(/```([^`]+)```/gs, '<div class="code-block">$1</div>')
            .replace(/^> (.*)$/gm, '<blockquote>$1</blockquote>')
            .replace(/#(\w+)/g, '<span style="color: #2A5B8C;">#$1</span>')
            .replace(/\n/g, '<br>');
            
        // Process code blocks separately
        formatted = formatted.replace(/<div class="code-block">([\s\S]*?)<\/div>/g, (match, code) => {
            // Preserve line breaks and indentation
            const formattedCode = code.replace(/<br>/g, '\n').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
            return `<div class="code-block">${formattedCode}</div>`;
        });
        
        return formatted;
    }
    
    function generateScript() {
        return `// Illustrator Telegram Post Generator Script
// Generated at ${new Date().toLocaleString()}

function createTelegramPost() {
    var doc = app.activeDocument;
    var channelName = "${channelInput.value || 'Your Channel'}";
    var postContent = \`${contentInput.value.replace(/`/g, '\\`').trim()}\`;
    var theme = "${themeInput.value}";
    
    // Create new document
    var doc = app.documents.add(DocumentColorSpace.RGB, 1024, 1024);
    
    // Set theme colors
    var bgColor, textColor;
    switch(theme) {
        case 'dark':
            bgColor = createColor(30, 30, 40);
            textColor = createColor(240, 240, 245);
            break;
        case 'gradient':
            bgColor = createGradient([
                [97, 175, 239],
                [58, 128, 215],
                [34, 87, 165]
            ]);
            textColor = createColor(255, 255, 255);
            break;
        default: // light theme
            bgColor = createColor(250, 250, 255);
            textColor = createColor(40, 40, 50);
    }
    
    // Create background
    var background = doc.pathItems.rectangle(0, 0, 1024, 1024);
    background.fillColor = bgColor;
    background.stroked = false;
    
    // Create header with channel name
    var header = doc.textFrames.pointText([50, 950]);
    header.contents = channelName;
    header.textRange.characterAttributes.size = 42;
    header.textRange.characterAttributes.textFont = getFont('Arial-BoldMT');
    header.textRange.characterAttributes.fillColor = textColor;
    
    // Parse and format content
    parseMarkdownContent(postContent, doc, textColor);
    
    // Add footer
    var footer = doc.textFrames.pointText([50, 50]);
    footer.contents = "Posted via Telegram Post Generator";
    footer.textRange.characterAttributes.size = 18;
    footer.textRange.characterAttributes.textFont = getFont('Arial');
    footer.textRange.characterAttributes.fillColor = createColor(180, 180, 190);
    
    alert('Telegram post template created successfully!');
}

function parseMarkdownContent(content, doc, textColor) {
    var lines = content.split('\\n');
    var yPos = 850;
    
    for (var i = 0; i < lines.length; i++) {
        var line = lines[i];
        var frame = doc.textFrames.pointText([50, yPos]);
        frame.textRange.characterAttributes.size = 32;
        frame.textRange.characterAttributes.textFont = getFont('Arial');
        frame.textRange.characterAttributes.fillColor = textColor;
        
        if (line.startsWith('**') && line.endsWith('**')) {
            frame.contents = line.slice(2, -2);
            frame.textRange.characterAttributes.textFont = getFont('Arial-BoldMT');
        }
        else if (line.startsWith('*') && line.endsWith('*')) {
            frame.contents = line.slice(1, -1);
            frame.textRange.characterAttributes.textFont = getFont('Arial-ItalicMT');
        }
        else if (line.startsWith('`') && line.endsWith('`')) {
            frame.contents = line.slice(1, -1);
            frame.textRange.characterAttributes.textFont = getFont('CourierNewPSMT');
        }
        else if (line.startsWith('> ')) {
            frame.contents = line.slice(2);
            frame.textRange.characterAttributes.fillColor = createColor(100, 150, 230);
        }
        else if (line.startsWith('#')) {
            frame.contents = line;
            frame.textRange.characterAttributes.fillColor = createColor(65, 135, 230);
        }
        else {
            frame.contents = line;
        }
        
        // Adjust position for next line
        var lineHeight = frame.textRange.characterAttributes.leading || 40;
        yPos -= lineHeight + 10;
    }
}

function getFont(fontName) {
    try {
        return app.textFonts.getByName(fontName);
    } catch(e) {
        return app.textFonts[0]; // Fallback to first available font
    }
}

function createColor(r, g, b) {
    var color = new RGBColor();
    color.red = r;
    color.green = g;
    color.blue = b;
    return color;
}

function createGradient(stops) {
    var gradient = new Gradient();
    gradient.type = GradientType.LINEAR;
    
    for (var i = 0; i < stops.length; i++) {
        var stop = gradient.gradientStops.add();
        stop.rampPoint = i / (stops.length - 1) * 100;
        stop.color = createColor(stops[i][0], stops[i][1], stops[i][2]);
    }
    
    return gradient;
}

// Start script execution
createTelegramPost();`;
    }
    
    function getChannelInitials(name) {
        return name.split(' ')
            .map(word => word.charAt(0).toUpperCase())
            .join('')
            .substring(0, 2);
    }
    
    function getCurrentTime() {
        const now = new Date();
        return now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    }
    
    function formatNumber(num) {
        return num.toLocaleString();
    }
});
D:\Ierarchy\ELI_LAB STUDIO\8. Coding\The Previewer\eli_lab logo_small.png