import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navigation: React.FC = () => {
  const location = useLocation();
  
  const isActive = (path: string) => location.pathname === path;

  const navLinkStyle = (path: string): React.CSSProperties => ({
    display: 'block',
    padding: '15px 20px',
    color: '#fff',
    textDecoration: 'none',
    transition: 'background-color 0.3s',
    backgroundColor: isActive(path) ? '#007bff' : 'transparent'
  });

  return (
    <nav style={styles.navMenu}>
      <ul style={styles.navList}>
        <li><Link to="/" style={navLinkStyle('/')}>Basic Q&A</Link></li>
        <li><Link to="/advanced" style={navLinkStyle('/advanced')}>Advanced Q&A</Link></li>
        <li><Link to="/norwegian" style={navLinkStyle('/norwegian')}>Norwegian Legal</Link></li>
        <li><Link to="/test-assets" style={navLinkStyle('/test-assets')}>Test Assets</Link></li>
        <li><Link to="/editor" style={navLinkStyle('/editor')}>Document Editor</Link></li>
      </ul>
    </nav>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  navMenu: {
    background: '#343a40',
    padding: 0,
    margin: '-20px -20px 20px -20px',
    borderRadius: '8px 8px 0 0',
    overflow: 'hidden'
  },
  navList: {
    listStyle: 'none',
    margin: 0,
    padding: 0,
    display: 'flex',
    flexWrap: 'wrap'
  }
};

export default Navigation;
