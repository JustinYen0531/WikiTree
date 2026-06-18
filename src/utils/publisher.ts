import {
  getDirectoryHandleByPath,
  createFile,
  writeFileContent,
  readFileContent,
  FileNode
} from './fileSystem';
import { getFlatFileState } from './versionControl';

// We'll import marked. Since typescript might warn about it before install completes,
// we can use a dynamic import or cast marked. We'll use marked.parse for compilation.
import { marked } from 'marked';

export interface PublishConfig {
  siteTitle: string;
  selectedPaths: string[];
  theme: 'light' | 'dark' | 'auto';
}

/**
 * Gets or creates the .notes_published directory in the root.
 */
async function getPublishDir(rootHandle: FileSystemDirectoryHandle): Promise<FileSystemDirectoryHandle> {
  return await rootHandle.getDirectoryHandle('.notes_published', { create: true });
}

/**
 * Generates the compiled static site in the local folder.
 */
export async function publishSite(
  rootHandle: FileSystemDirectoryHandle | string,
  currentFiles: FileNode[],
  config: PublishConfig
): Promise<void> {
  const flatState = await getFlatFileState(rootHandle, currentFiles);
  
  // 1. Gather all published files and compile markdown to HTML
  const publishedNotes: Record<string, { title: string; html: string }> = {};
  
  // Configure marked for custom rendering (e.g. callouts, tasks)
  const renderer = new marked.Renderer();
  
  // Customize marked rendering if needed
  marked.setOptions({
    renderer,
    gfm: true,
    breaks: true,
  });

  for (const path of config.selectedPaths) {
    const markdown = flatState.get(path);
    if (markdown !== undefined) {
      const title = path.split('/').pop()?.replace(/\.md$/i, '') || path;
      const htmlContent = await marked.parse(markdown);
      publishedNotes[path] = {
        title,
        html: htmlContent
      };
    }
  }

  // 2. Build the navigation tree structure for the published site
  const navTree = buildNavTree(config.selectedPaths);

  // 3. Write data.js containing the notes payload
  const dataJsContent = `// Auto-generated data file for published notes.
window.PUBLISHED_DATA = {
  siteTitle: ${JSON.stringify(config.siteTitle)},
  defaultTheme: ${JSON.stringify(config.theme)},
  navTree: ${JSON.stringify(navTree)},
  notes: ${JSON.stringify(publishedNotes)}
};`;
  
  // 4. Write index.html containing the beautiful reader application
  const indexHtmlContent = getIndexHtmlTemplate();

  if (typeof rootHandle === 'string') {
    const getCliUrl = () => localStorage.getItem('antigravity_cli_url') || 'http://localhost:18080';
    const response = await fetch(`${getCliUrl()}/api/workspace/publish`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        files: {
          'data.js': dataJsContent,
          'index.html': indexHtmlContent
        }
      })
    });
    if (!response.ok) {
      throw new Error('Failed to publish static site to CLI server');
    }
    return;
  }

  const publishDir = await getPublishDir(rootHandle);
  const dataFileHandle = await publishDir.getFileHandle('data.js', { create: true });
  await writeFileContent(dataFileHandle, dataJsContent);

  const indexFileHandle = await publishDir.getFileHandle('index.html', { create: true });
  await writeFileContent(indexFileHandle, indexHtmlContent);
}

/**
 * Builds a simple hierarchical navigation tree from the selected paths.
 */
function buildNavTree(paths: string[]): any[] {
  const root: any[] = [];

  for (const path of paths) {
    const parts = path.split('/');
    let currentLevel = root;

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      const isFile = i === parts.length - 1;
      const currentPath = parts.slice(0, i + 1).join('/');

      let existing = currentLevel.find(item => item.name === part);

      if (!existing) {
        existing = {
          name: part,
          path: currentPath,
          kind: isFile ? 'file' : 'directory',
          children: isFile ? undefined : []
        };
        currentLevel.push(existing);
      }

      if (!isFile) {
        currentLevel = existing.children;
      }
    }
  }

  // Sort helper: directories first, then alphabetical
  function sortNodes(nodes: any[]) {
    nodes.sort((a, b) => {
      if (a.kind !== b.kind) {
        return a.kind === 'directory' ? -1 : 1;
      }
      return a.name.localeCompare(b.name);
    });
    for (const node of nodes) {
      if (node.children) {
        sortNodes(node.children);
      }
    }
  }

  sortNodes(root);
  return root;
}

/**
 * Returns the HTML/CSS/JS template for the standalone reader app.
 * This features Notion-like minimalist aesthetics, dark/light themes, search, and collapsible sidebar.
 */
function getIndexHtmlTemplate(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Published Notes</title>
  <style>
    :root {
      --bg-primary: #ffffff;
      --bg-sidebar: #f7f7f5;
      --border-color: #edece9;
      --text-primary: #37352f;
      --text-secondary: #7c7b77;
      --accent-color: #111111;
      --accent-hover: #000000;
      --bg-hover: #efeee8;
      --font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji";
      --line-height: 1.65;
    }

    [data-theme="dark"] {
      --bg-primary: #191919;
      --bg-sidebar: #202020;
      --border-color: #2a2a2a;
      --text-primary: #e3e3e3;
      --text-secondary: #8a8a8a;
      --accent-color: #f1f1f1;
      --accent-hover: #ffffff;
      --bg-hover: #2d2d2d;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: var(--font-family);
      background-color: var(--bg-primary);
      color: var(--text-primary);
      display: flex;
      height: 100vh;
      overflow: hidden;
      -webkit-font-smoothing: antialiased;
    }

    /* Sidebar Styles */
    .sidebar {
      width: 260px;
      background-color: var(--bg-sidebar);
      border-right: 1px solid var(--border-color);
      display: flex;
      flex-direction: column;
      height: 100%;
      user-select: none;
      flex-shrink: 0;
      transition: transform 0.3s ease;
    }

    .sidebar-header {
      padding: 16px;
      border-bottom: 1px solid var(--border-color);
      font-weight: 600;
      font-size: 15px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .theme-toggle {
      background: none;
      border: none;
      color: var(--text-secondary);
      cursor: pointer;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 13px;
      transition: background-color 0.2s;
    }

    .theme-toggle:hover {
      background-color: var(--bg-hover);
      color: var(--text-primary);
    }

    .search-container {
      padding: 12px;
      position: relative;
    }

    .search-input {
      width: 100%;
      padding: 8px 12px;
      border-radius: 6px;
      border: 1px solid var(--border-color);
      background-color: var(--bg-primary);
      color: var(--text-primary);
      font-size: 13px;
      outline: none;
    }

    .search-input:focus {
      border-color: var(--accent-color);
    }

    .nav-tree {
      flex: 1;
      overflow-y: auto;
      padding: 12px;
    }

    .nav-item {
      display: flex;
      align-items: center;
      padding: 6px 8px;
      border-radius: 4px;
      font-size: 14px;
      cursor: pointer;
      margin-bottom: 2px;
      color: var(--text-primary);
      text-decoration: none;
      transition: background-color 0.15s;
    }

    .nav-item:hover {
      background-color: var(--bg-hover);
    }

    .nav-item.active {
      background-color: var(--bg-hover);
      font-weight: 500;
      color: var(--accent-color);
    }

    .nav-item.directory {
      font-weight: 600;
      color: var(--text-secondary);
      margin-top: 8px;
      padding-left: 2px;
      cursor: default;
    }

    .nav-item.directory:hover {
      background-color: transparent;
    }

    .nav-file-indent {
      padding-left: 16px;
    }

    /* Content Area */
    .content-container {
      flex: 1;
      display: flex;
      flex-direction: column;
      height: 100%;
      overflow: hidden;
      background-color: var(--bg-primary);
    }

    .top-bar {
      height: 48px;
      border-bottom: 1px solid var(--border-color);
      display: flex;
      align-items: center;
      padding: 0 24px;
      font-size: 14px;
      color: var(--text-secondary);
    }

    .mobile-menu-toggle {
      display: none;
      background: none;
      border: none;
      color: var(--text-primary);
      font-size: 20px;
      margin-right: 12px;
      cursor: pointer;
    }

    .main-content {
      flex: 1;
      overflow-y: auto;
      padding: 40px 60px 80px 60px;
      display: flex;
      justify-content: center;
    }

    .article-container {
      max-width: 700px;
      width: 100%;
    }

    /* Notion-like Markdown Rendering Styles */
    .note-content {
      font-size: 16px;
      line-height: var(--line-height);
    }

    .note-title {
      font-size: 40px;
      font-weight: 700;
      margin-bottom: 30px;
      letter-spacing: -0.02em;
    }

    .note-content h1 {
      font-size: 30px;
      margin-top: 36px;
      margin-bottom: 12px;
      font-weight: 600;
      border-bottom: 1px solid var(--border-color);
      padding-bottom: 6px;
    }

    .note-content h2 {
      font-size: 24px;
      margin-top: 28px;
      margin-bottom: 10px;
      font-weight: 600;
    }

    .note-content h3 {
      font-size: 20px;
      margin-top: 24px;
      margin-bottom: 8px;
      font-weight: 600;
    }

    .note-content p {
      margin-bottom: 16px;
    }

    .note-content a {
      color: var(--accent-color);
      text-decoration: none;
      border-bottom: 1px solid transparent;
    }

    .note-content a:hover {
      border-bottom-color: var(--accent-color);
    }

    .note-content ul, .note-content ol {
      margin-left: 24px;
      margin-bottom: 16px;
    }

    .note-content li {
      margin-bottom: 6px;
    }

    .note-content blockquote {
      border-left: 3px solid var(--text-primary);
      padding-left: 16px;
      margin-left: 0;
      margin-bottom: 16px;
      color: var(--text-secondary);
      font-style: italic;
    }

    .note-content code {
      font-family: Consolas, Monaco, "Andale Mono", monospace;
      background-color: var(--bg-sidebar);
      padding: 2px 4px;
      border-radius: 4px;
      font-size: 14px;
    }

    .note-content pre {
      background-color: var(--bg-sidebar);
      border: 1px solid var(--border-color);
      padding: 16px;
      border-radius: 6px;
      overflow-x: auto;
      margin-bottom: 16px;
    }

    .note-content pre code {
      background: none;
      padding: 0;
      font-size: 13.5px;
    }

    .note-content img {
      max-width: 100%;
      border-radius: 6px;
      margin-bottom: 16px;
    }

    .note-content hr {
      border: 0;
      border-top: 1px solid var(--border-color);
      margin: 24px 0;
    }

    .note-content table {
      border-collapse: collapse;
      width: 100%;
      margin-bottom: 24px;
      font-size: 14px;
    }

    .note-content th, .note-content td {
      border: 1px solid var(--border-color);
      padding: 8px 12px;
      text-align: left;
    }

    .note-content th {
      background-color: var(--bg-sidebar);
      font-weight: 600;
    }

    /* Callouts styling (Notion like) */
    .note-content div.callout {
      background-color: var(--bg-sidebar);
      border: 1px solid var(--border-color);
      border-radius: 6px;
      padding: 16px;
      margin-bottom: 16px;
      display: flex;
      gap: 12px;
    }

    /* Empty state */
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      color: var(--text-secondary);
      text-align: center;
    }

    .empty-state svg {
      width: 64px;
      height: 64px;
      margin-bottom: 16px;
      stroke: var(--text-secondary);
    }

    /* Responsive */
    @media (max-width: 768px) {
      .sidebar {
        position: absolute;
        z-index: 10;
        transform: translateX(-100%);
      }

      .sidebar.open {
        transform: translateX(0);
      }

      .mobile-menu-toggle {
        display: block;
      }

      .main-content {
        padding: 24px 20px 60px 20px;
      }
    }
  </style>
</head>
<body>

  <!-- Sidebar -->
  <aside id="sidebar" class="sidebar">
    <div class="sidebar-header">
      <span id="site-title">My Hub</span>
      <button id="theme-btn" class="theme-toggle">Light</button>
    </div>
    <div class="search-container">
      <input type="text" id="search-input" class="search-input" placeholder="Search notes...">
    </div>
    <nav id="nav-tree" class="nav-tree"></nav>
  </aside>

  <!-- Main Content Container -->
  <div class="content-container">
    <header class="top-bar">
      <button id="menu-btn" class="mobile-menu-toggle">☰</button>
      <span id="breadcrumbs">Home</span>
    </header>
    <main class="main-content">
      <div class="article-container">
        <!-- Rendered Note -->
        <article id="note-view" style="display: none;">
          <h1 id="note-title-header" class="note-title"></h1>
          <section id="note-body-content" class="note-content"></section>
        </article>
        <!-- Empty/Home State -->
        <div id="home-view" class="empty-state">
          <svg fill="none" viewBox="0 0 24 24" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
          </svg>
          <h2>Welcome to your Published Hub</h2>
          <p style="margin-top: 8px;">Select a note from the sidebar to start reading.</p>
        </div>
      </div>
    </main>
  </div>

  <!-- Load Data -->
  <script src="data.js"></script>

  <script>
    // Runtime JavaScript for the Viewer App
    document.addEventListener('DOMContentLoaded', () => {
      const data = window.PUBLISHED_DATA || { siteTitle: 'Notes', navTree: [], notes: {}, defaultTheme: 'dark' };
      
      // Update Site Title
      document.title = data.siteTitle;
      document.getElementById('site-title').textContent = data.siteTitle;

      // Theme logic
      let theme = localStorage.getItem('theme') || data.defaultTheme || 'dark';
      if (theme === 'auto') {
        theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      }
      setTheme(theme);

      document.getElementById('theme-btn').addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
      });

      function setTheme(newTheme) {
        document.documentElement.setAttribute('data-theme', newTheme);
        document.getElementById('theme-btn').textContent = newTheme === 'dark' ? 'Light Mode' : 'Dark Mode';
        localStorage.setItem('theme', newTheme);
      }

      // Mobile menu toggle
      const sidebar = document.getElementById('sidebar');
      document.getElementById('menu-btn').addEventListener('click', () => {
        sidebar.classList.toggle('open');
      });

      // Render navigation tree
      const navContainer = document.getElementById('nav-tree');
      function renderTree(nodes, container, isSubLevel = false) {
        nodes.forEach(node => {
          if (node.kind === 'file') {
            const el = document.createElement('a');
            el.className = 'nav-item file' + (isSubLevel ? ' nav-file-indent' : '');
            el.href = '#/' + encodeURIComponent(node.path);
            el.textContent = node.name.replace(/\\.md$/i, '');
            el.dataset.path = node.path;
            
            el.addEventListener('click', () => {
              sidebar.classList.remove('open');
            });
            container.appendChild(el);
          } else {
            const dirHeader = document.createElement('div');
            dirHeader.className = 'nav-item directory';
            dirHeader.textContent = node.name;
            container.appendChild(dirHeader);
            
            if (node.children && node.children.length > 0) {
              renderTree(node.children, container, true);
            }
          }
        });
      }
      renderTree(data.navTree, navContainer);

      // Search functionality
      const searchInput = document.getElementById('search-input');
      searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        const navItems = navContainer.querySelectorAll('.nav-item.file');
        
        navItems.forEach(item => {
          const path = item.dataset.path;
          const note = data.notes[path];
          const matchesTitle = note?.title.toLowerCase().includes(query);
          const matchesContent = note?.html.toLowerCase().includes(query);
          
          if (!query || matchesTitle || matchesContent) {
            item.style.display = 'flex';
          } else {
            item.style.display = 'none';
          }
        });
      });

      // Simple Hash Routing
      function handleRoute() {
        const hash = window.location.hash;
        const noteView = document.getElementById('note-view');
        const homeView = document.getElementById('home-view');
        const breadcrumbs = document.getElementById('breadcrumbs');

        // De-highlight previous active item
        document.querySelectorAll('.nav-item.file').forEach(item => item.classList.remove('active'));

        if (hash.startsWith('#/')) {
          const path = decodeURIComponent(hash.slice(2));
          const note = data.notes[path];

          if (note) {
            noteView.style.display = 'block';
            homeView.style.display = 'none';
            document.getElementById('note-title-header').textContent = note.title;
            document.getElementById('note-body-content').innerHTML = note.html;
            breadcrumbs.textContent = path.split('/').join(' / ');

            // Highlight in sidebar
            const activeItem = navContainer.querySelector(\`[data-path="\${path}"]\`);
            if (activeItem) activeItem.classList.add('active');
            return;
          }
        }
        
        // Show home view
        noteView.style.display = 'none';
        homeView.style.display = 'flex';
        breadcrumbs.textContent = 'Home';
      }

      window.addEventListener('hashchange', handleRoute);
      handleRoute();
    });
  </script>
</body>
</html>
`;
}
