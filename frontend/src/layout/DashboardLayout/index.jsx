import React, { useEffect, useMemo, useState } from 'react'
import styles from "./index.module.css"
import { useRouter } from 'next/router'
import { setTokenIsThere } from '@/config/redux/reducer/authReducer';
import { useDispatch, useSelector } from 'react-redux';
import { getAboutUser, getAllUsers, sendConnectionRequest } from '@/config/redux/action/authAction';
import { mediaUrl } from '@/config';
import { toast } from 'react-toastify';

function suggestionHeadline(profile) {
  const cp = typeof profile.currentPost === 'string' ? profile.currentPost.trim() : '';
  if (cp) return cp;
  const bio = typeof profile.bio === 'string' ? profile.bio.trim() : '';
  if (bio && bio !== '') {
    return bio.length > 72 ? `${bio.slice(0, 69)}…` : bio;
  }
  const u = profile.userId?.username;
  return u ? `@${u}` : 'Member';
}

export default function DashboardLayout({children}) {
  const router = useRouter();
  const dispatch = useDispatch()
  const authState = useSelector((state) => state.auth)
  const [connectingUserId, setConnectingUserId] = useState(null);
  const [pendingByUserId, setPendingByUserId] = useState({});

  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
      } else {
        dispatch(setTokenIsThere());
        dispatch(getAboutUser({ token }));
        dispatch(getAllUsers());
      }
    }
  }, []);

  const handleConnect = async (userId, displayName) => {
    if (!userId) return;
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please log in again.");
      return;
    }
    const idKey = String(userId);
    setConnectingUserId(idKey);
    try {
      await dispatch(
        sendConnectionRequest({ user_id: userId, token })
      ).unwrap();
      setPendingByUserId((prev) => ({ ...prev, [idKey]: true }));
      toast.success(
        displayName
          ? `Invitation sent to ${displayName}`
          : "Connection request sent"
      );
    } catch (err) {
      const msg =
        (err && typeof err === "object" && err.message) ||
        (typeof err === "string" ? err : null) ||
        "Could not send connection request";
      if (/already/i.test(msg)) {
        toast.info(msg);
        setPendingByUserId((prev) => ({ ...prev, [idKey]: true }));
      } else {
        toast.error(msg);
      }
    } finally {
      setConnectingUserId(null);
    }
  };

  const myUserId = authState.user?.userId?._id;

  const peopleSuggestions = useMemo(() => {
    const list = Array.isArray(authState.all_users) ? authState.all_users : [];
    return list
      .filter((p) => p.userId && (!myUserId || String(p.userId._id) !== String(myUserId)))
      .slice(0, 5);
  }, [authState.all_users, myUserId]);

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

          {/* Right Sidebar — People you may know (LinkedIn-style) */}
          <div className={styles.homeContainer_extraContainer}>
          <aside className={styles.pymkCard} aria-label="People you may know">
            <div className={styles.pymkHeader}>
              <div className={styles.pymkTitleRow}>
                <h3 className={styles.pymkTitle}>People you may know</h3>
                <span className={styles.pymkTitleHint} title="Suggestions based on your profile">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
                    <path fillRule="evenodd" d="M8 15A7 7 0 1 0 8 1a7 7 0 0 0 0 14Zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16Z" />
                    <path d="M8.93 6.588l-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2.176-.492.246-.686.246-.275 0-.375-.193-.304-.533L8.93 6.588zM9 4.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0z" />
                  </svg>
                </span>
              </div>
              <button
                type="button"
                className={styles.pymkSeeAll}
                onClick={() => router.push('/Discover')}
              >
                See all
              </button>
            </div>

            {!authState.all_profiles_fetched ? (
              <div className={styles.pymkSkeleton}>
                {[1, 2, 3].map((i) => (
                  <div key={i} className={styles.pymkSkeletonRow}>
                    <div className={styles.pymkSkeletonAvatar} />
                    <div className={styles.pymkSkeletonLines}>
                      <div className={styles.pymkSkeletonLine} />
                      <div className={styles.pymkSkeletonLineShort} />
                      <div className={styles.pymkSkeletonBtn} />
                    </div>
                  </div>
                ))}
              </div>
            ) : peopleSuggestions.length > 0 ? (
              <ul className={styles.pymkList}>
                {peopleSuggestions.map((profile) => {
                  const username = profile.userId?.username;
                  const name = profile.userId?.name || 'Member';
                  return (
                    <li key={profile._id} className={styles.pymkItem}>
                      <div
                        className={styles.pymkItemMain}
                        role="button"
                        tabIndex={0}
                        onClick={() => username && router.push(`/view_profile/${username}`)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            if (username) router.push(`/view_profile/${username}`);
                          }
                        }}
                      >
                        <img
                          src={
                            profile.userId?.profilePicture
                              ? mediaUrl(profile.userId.profilePicture)
                              : '/defaultProfilePicture.jpg'
                          }
                          alt=""
                          className={styles.pymkAvatar}
                        />
                        <div className={styles.pymkText}>
                          <p className={styles.pymkName}>{name}</p>
                          <p className={styles.pymkHeadline}>{suggestionHeadline(profile)}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        className={`${styles.pymkConnectBtn} ${
                          connectingUserId === String(profile.userId?._id)
                            ? styles.pymkConnectBtnLoading
                            : ''
                        } ${
                          pendingByUserId[String(profile.userId?._id)]
                            ? styles.pymkConnectBtnPending
                            : ''
                        }`}
                        disabled={
                          connectingUserId === String(profile.userId?._id) ||
                          pendingByUserId[String(profile.userId?._id)]
                        }
                        onClick={(e) => {
                          e.stopPropagation();
                          handleConnect(profile.userId?._id, name);
                        }}
                      >
                        {connectingUserId === String(profile.userId?._id) ? (
                          <>
                            <span className={styles.pymkBtnSpinner} aria-hidden />
                            <span>Sending…</span>
                          </>
                        ) : pendingByUserId[String(profile.userId?._id)] ? (
                          'Pending'
                        ) : (
                          'Connect'
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className={styles.pymkEmpty}>No suggestions right now. Try Discover to find people.</p>
            )}
          </aside>
          </div>
        </div>
      </div>
    </div>
  )
}
