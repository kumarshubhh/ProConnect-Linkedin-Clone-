import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useSelector } from 'react-redux';
import styles from './Navbar.module.css';
import { mediaUrl } from '@/config';

export default function Navbar() {
  const router = useRouter();
  const authState = useSelector((state) => state.auth);
  const [showDropdown, setShowDropdown] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  const handleProfileClick = () => {
    router.push('/profile');
    setShowDropdown(false);
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.navbarContainer}>
        {/* Logo */}
        <div className={styles.navbarLogo} onClick={() => router.push('/dashboard')}>
          <svg width="36" height="36" viewBox="0 0 40 40" fill="none">
            <rect width="40" height="40" rx="8" fill="#0A66C2"/>
            <path d="M12 28V16M12 12V12.01M20 28V20M20 16V12M28 28V24M28 20V12" stroke="white" strokeWidth="3" strokeLinecap="round"/>
          </svg>
          <span>ProConnect</span>
        </div>

        {/* Right Side */}
        <div className={styles.navbarRight}>
          {authState.user && (
            <div className={styles.profileDropdown}>
              <div 
                className={styles.profileTrigger}
                onClick={() => setShowDropdown(!showDropdown)}
              >
                <img 
                  src={authState.user.userId?.profilePicture 
                    ? mediaUrl(authState.user.userId.profilePicture) 
                    : '/defaultProfilePicture.jpg'
                  }
                  alt="Profile"
                  className={styles.profileImage}
                />
                <span className={styles.profileName}>
                  {authState.user.userId?.name || 'User'}
                </span>
                <svg 
                  className={`${styles.dropdownIcon} ${showDropdown ? styles.dropdownIconOpen : ''}`}
                  width="16" 
                  height="16" 
                  viewBox="0 0 16 16" 
                  fill="none"
                >
                  <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>

              {showDropdown && (
                <div className={styles.dropdownMenu}>
                  <div className={styles.dropdownItem} onClick={handleProfileClick}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span>View Profile</span>
                  </div>
                  <div className={styles.dropdownDivider}></div>
                  <div className={styles.dropdownItem} onClick={handleLogout}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span>Logout</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
