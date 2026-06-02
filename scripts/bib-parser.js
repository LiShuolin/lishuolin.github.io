/**
 * Fetches and parses a .bib file, then renders publications into the page.
 */
async function loadPublications(bibPath) {
  try {
    const response = await fetch(bibPath);
    if (!response.ok) throw new Error(`Failed to load bib file: ${response.status}`);
    const text = await response.text();
    const entries = parseBib(text);
    renderPublications(entries);
  } catch (err) {
    console.error(err);
    document.querySelectorAll('.pub-list').forEach(el => {
      el.innerHTML = '<li>Failed to load publications.</li>';
    });
  }
}

/**
 * Parses BibTeX text into an array of entry objects.
 */
function parseBib(text) {
  const entries = [];
  // Remove comments
  text = text.replace(/%.*/g, '');
  const entryRegex = /@(\w+)\s*\{\s*([^,]+),([^@]*)\}/gs;
  let match;

  while ((match = entryRegex.exec(text)) !== null) {
    const type = match[1].toLowerCase();
    const key = match[2].trim();
    const body = match[3];
    const fields = { type, key };

    const fieldRegex = /(\w+)\s*=\s*\{((?:[^{}]|\{[^{}]*\})*)\}/g;
    let fieldMatch;
    while ((fieldMatch = fieldRegex.exec(body)) !== null) {
      fields[fieldMatch[1].toLowerCase()] = fieldMatch[2].trim();
    }

    entries.push(fields);
  }

  // Sort by year descending
  entries.sort((a, b) => (parseInt(b.year) || 0) - (parseInt(a.year) || 0));
  return entries;
}

/**
 * Renders entries into the appropriate <ul> elements.
 */
/**
 * Converts a BibTeX author string to "First Last, First Last, ..." format.
 * Handles both "Last, First" and "First Last" forms.
 */
function formatAuthors(authorStr) {
  return authorStr
    .split(/ and /i)
    .map(a => {
      a = a.trim();
      if (a.includes(',')) {
        // "Last, First" → "First Last"
        const [last, first] = a.split(',').map(s => s.trim());
        return first ? `${first} ${last}` : last;
      }
      return a; // already "First Last"
    })
    .join(', ');
}

function renderPublications(entries) {
  const allList = document.getElementById('all-papers');

  const renderItem = (e) => {
    const authors = e.author ? formatAuthors(e.author) : '';
    const title = e.title || 'Untitled';
    const venue = e.booktitle || e.journal || '';
    const year = e.year || '';
    const titleText = e.url
      ? `<a href="${e.url}" target="_blank" rel="noopener">${title}</a>`
      : title;
    const venueStr = venue ? `In <em>${venue}</em>` : '';
    return `<li class="pub-item">${authors}. ${titleText}. ${venueStr}${year ? ', ' + year : ''}.</li>`;
  };

  if (allList) {
    allList.innerHTML = entries.length
      ? entries.map(renderItem).join('')
      : '<li>No publications found.</li>';
  }
}

// Resolve relative path from pages/ to data/
loadPublications('../data/publications.bib');
