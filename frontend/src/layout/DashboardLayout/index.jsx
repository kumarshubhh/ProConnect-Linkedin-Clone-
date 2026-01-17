import React, { useEffect } from 'react'
import styles from "./index.module.css"
import { useRouter } from 'next/router'
import { setTokenIsThere } from '@/config/redux/reducer/authReducer';
import { useDispatch, useSelector } from 'react-redux';
import { getAllUsers, sendConnectionRequest } from '@/config/redux/action/authAction';
import { BASE_URL } from '@/config';

export default function DashboardLayout({children}) {
  const router = useRouter();
  const dispatch = useDispatch()
  const authState = useSelector((state) => state.auth)

  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
      } else {
        dispatch(setTokenIsThere());
        dispatch(getAllUsers());
      }
    }
  }, []);

  const handleConnect = async (userId) => {
    try {
      await dispatch(sendConnectionRequest({
        receiver_id: userId,
        token: localStorage.getItem("token")
      }));
    } catch (error) {
      console.error("Connection request failed:", error);
    }
  };

  return (
    <div>
      <div className='container'>
        <div className={styles.homeContainer}>
          
          {/* Left Sidebar - Navigation */}
          <div className={styles.homeContainer_leftBar}>
            <div 
              onClick={() => router.push("/dashboard")}
              className={`${styles.sideBArOptions} ${router.pathname === '/dashboard' ? styles.active : ''}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
              </svg>
              <p>Home</p>
            </div>

            <div 
              onClick={() => router.push("/Discover")}
              className={`${styles.sideBArOptions} ${router.pathname === '/Discover' ? styles.active : ''}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
              </svg>
              <p>Discover</p>
            </div>

            <div 
              onClick={() => router.push("/my_connections")}
              className={`${styles.sideBArOptions} ${router.pathname === '/my_connections' ? styles.active : ''}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM3 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 9.374 21c-2.331 0-4.512-.645-6.374-1.766Z" />
              </svg>
              <p>My Network</p>
            </div>

            <div 
              onClick={() => router.push("/profile")}
              className={`${styles.sideBArOptions} ${router.pathname === '/profile' ? styles.active : ''}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
              </svg>
              <p>Profile</p>
            </div>
          </div>

          {/* Center Feed Container */}
          <div className={styles.homeContainer_feedContainer}>
            {children}
          </div>

          {/* Right Sidebar - Top Profiles */}
          <div className={styles.homeContainer_extraContainer}>
            <h3>People you may know</h3>

            {!authState.all_profiles_fetched ? (
              <div style={{ textAlign: 'center', padding: '20px', color: '#5F5F5F' }}>
                <p>Loading profiles...</p>
              </div>
            ) : (
              Array.isArray(authState.all_users) && authState.all_users.length > 0 ? (
                authState.all_users.slice(0, 5).map((profile) => (
                  <div key={profile._id} className={styles.profileCard}>
                    <div className={styles.profileDetails}>
                      <img 
                        src={profile.userId?.profilePicture 
                          ? `${BASE_URL}/${profile.userId.profilePicture}` 
                          : '/defaultProfilePicture.jpg'
                        }
                        alt={profile.userId?.name || 'User'}
                        className={styles.profileAvatar}
                      />
                      <div className={styles.profileInfo}>
                        <h4>{profile.userId?.name || 'Unknown User'}</h4>
                        <p>@{profile.userId?.username || 'username'}</p>
                      </div>
                    </div>
                    <button 
                      className={styles.connectButton}
                      onClick={() => handleConnect(profile.userId?._id)}
                    >
                      Connect
                    </button>
                  </div>
                ))
              ) : (
                <div style={{ textAlign: 'center', padding: '20px', color: '#5F5F5F' }}>
                  <p>No profiles found</p>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
