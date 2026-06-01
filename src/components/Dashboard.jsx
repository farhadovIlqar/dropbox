import React, { useState, useEffect } from 'react';
import { uploadData, remove, list, getUrl } from 'aws-amplify/storage';
import './Dashboard.css';

export default function Dashboard({ user, signOut }) {
  const [currentPath, setCurrentPath] = useState('');
  const [files, setFiles] = useState([]);
  const [view, setView] = useState('files');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (view === 'files') {
      fetchFiles();
    }
  }, [currentPath, view]);

  const fetchFiles = async () => {
    try {
      setIsLoading(true);
      const result = await list({
        path: `public/${user.username}/${currentPath}`,
      });
      
      const formattedFiles = result.items.map(item => {
        // Extract filename from full path
        const fullPath = item.path;
        const name = fullPath.split('/').pop();
        return {
          id: fullPath,
          name: name,
          type: name.includes('.') ? 'file' : 'folder',
          size: item.size ? (item.size / 1024 / 1024).toFixed(2) + ' MB' : '-',
          date: item.lastModified ? new Date(item.lastModified).toLocaleDateString() : '-'
        };
      }).filter(f => f.name !== ''); // Remove root directory itself
      
      setFiles(formattedFiles);
    } catch (error) {
      console.error("Error fetching files: ", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setIsLoading(true);
      const filePath = `public/${user.username}/${currentPath}${file.name}`;
      await uploadData({
        path: filePath,
        data: file,
      });
      alert('File uploaded successfully! Version history is saved in S3 automatically.');
      fetchFiles();
    } catch (error) {
      console.error('Error uploading file: ', error);
      alert('Error uploading file');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (path) => {
    if(!window.confirm("Are you sure you want to delete this file?")) return;
    try {
      await remove({ path });
      fetchFiles();
    } catch (error) {
      console.error('Error deleting file: ', error);
    }
  };

  const handleShare = async (path) => {
    try {
      const urlResult = await getUrl({ 
        path,
        options: {
          expiresIn: 3600 // 1 hour expiry
        }
      });
      // Fallback depending on Amplify version response structure
      const urlStr = urlResult.url.toString();
      navigator.clipboard.writeText(urlStr);
      alert('Shareable expiring link (1 Hour) copied to clipboard!\n\n' + urlStr);
    } catch (error) {
      console.error('Error sharing file: ', error);
    }
  };

  const handleCreateFolder = async () => {
    const folderName = prompt("Enter folder name:");
    if (!folderName) return;
    try {
      // S3 doesn't have real folders, so we create an empty file with trailing slash
      const folderPath = `public/${user.username}/${currentPath}${folderName}/.keep`;
      await uploadData({
        path: folderPath,
        data: new Blob(['']),
      });
      fetchFiles();
    } catch (error) {
      console.error('Error creating folder: ', error);
    }
  };

  const navigateTo = (folderName) => {
    setCurrentPath(prev => prev + folderName + '/');
  };

  const navigateUp = (idx) => {
    const parts = currentPath.split('/').filter(Boolean);
    const newPath = parts.slice(0, idx).join('/');
    setCurrentPath(newPath ? newPath + '/' : '');
  };

  const breadcrumbs = currentPath.split('/').filter(Boolean);

  return (
    <div className="dashboard-layout">
      <aside className="sidebar">
        <div className="brand">
          <svg className="brand-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
          PeerBox
        </div>
        <nav className="nav-menu">
          <button className={`nav-item ${view === 'files' ? 'active' : ''}`} onClick={() => setView('files')}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
            My Files
          </button>
          <button className={`nav-item ${view === 'profile' ? 'active' : ''}`} onClick={() => setView('profile')}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
            Profile
          </button>
        </nav>
        
        <div className="storage-meter">
          <div className="meter-info">
            <span>Storage</span>
            <span>2.9 MB / 5 GB</span>
          </div>
          <div className="meter-bar"><div className="meter-fill" style={{width: '2%'}}></div></div>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div className="search-bar">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            <input type="text" placeholder="Search files..." />
          </div>
          <div className="user-menu">
            <span className="welcome-text">Hi, {user?.username}</span>
            <button onClick={signOut} className="btn-logout">Sign Out</button>
          </div>
        </header>

        {view === 'files' ? (
          <div className="content-area">
            <div className="content-header">
              <div className="breadcrumbs">
                <span className="crumb" onClick={() => navigateUp(0)} style={{cursor: 'pointer'}}>Home</span>
                {breadcrumbs.length > 0 && <span className="separator">/</span>}
                {breadcrumbs.map((crumb, idx) => (
                  <React.Fragment key={idx}>
                    <span className="crumb" onClick={() => navigateUp(idx + 1)} style={{cursor: 'pointer'}}>{crumb}</span>
                    {idx < breadcrumbs.length - 1 && <span className="separator">/</span>}
                  </React.Fragment>
                ))}
              </div>
              <div className="action-buttons">
                <button className="btn-secondary" onClick={handleCreateFolder}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path><line x1="12" y1="11" x2="12" y2="17"></line><line x1="9" y1="14" x2="15" y2="14"></line></svg>
                  New Folder
                </button>
                <label className="btn-primary" style={{cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px'}}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                  Upload File
                  <input type="file" style={{display: 'none'}} onChange={handleFileUpload} />
                </label>
              </div>
            </div>

            <div className="file-grid">
              <div className="file-header">
                <span>Name</span>
                <span>Date Modified</span>
                <span>Size</span>
                <span></span>
              </div>
              
              {isLoading && <div style={{padding: '20px', textAlign: 'center'}}>Loading files...</div>}
              {!isLoading && files.length === 0 && <div style={{padding: '40px', textAlign: 'center', color: '#666'}}>No files found in this folder.</div>}
              
              {!isLoading && files.map(file => (
                <div key={file.id} className="file-row">
                  <div className="file-name" style={{cursor: file.type === 'folder' ? 'pointer' : 'default'}} onClick={() => file.type === 'folder' && navigateTo(file.name)}>
                    {file.type === 'folder' ? (
                      <svg className="icon-folder" viewBox="0 0 24 24" fill="currentColor"><path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"></path></svg>
                    ) : (
                      <svg className="icon-file" viewBox="0 0 24 24" fill="currentColor"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"></path></svg>
                    )}
                    <span>{file.name}</span>
                  </div>
                  <div className="file-date">{file.date}</div>
                  <div className="file-size">{file.size}</div>
                  <div className="file-actions">
                    {file.type !== 'folder' && <button className="action-btn" title="Share" onClick={() => handleShare(file.id)}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg></button>}
                    <button className="action-btn" title="Delete" onClick={() => handleDelete(file.id)}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="content-area">
            <h2>Profile Settings</h2>
            <div className="profile-card">
              <div className="form-group">
                <label>Username</label>
                <input type="text" value={user?.username} disabled />
              </div>
              <div className="form-group">
                <label>Display Name</label>
                <input type="text" placeholder="Enter your name" />
              </div>
              <button className="btn-primary">Save Changes</button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
