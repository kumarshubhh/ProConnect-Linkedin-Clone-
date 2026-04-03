import { BASE_URL, clientServer, mediaUrl } from '@/config';
import DashbordLayout from '@/layout/DashboardLayout';
import UserLayout from '@/layout/userLayout';
import Link from 'next/link';
import React, { useCallback, useEffect, useState } from 'react';
import profileStyle from '../profile/style.module.css';
import feed from '../dashboard/style.module.css';
import localStyle from './style.module.css';
import { useDispatch, useSelector } from 'react-redux';
import {
  deleteComment,
  deletePost,
  getAllComments,
  getAllPosts,
  postComment,
  togglePostLike,
} from '@/config/redux/action/postAction';
import { getConnectionRequest, getMyConnectionRequest, sendConnectionRequest } from '@/config/redux/action/authAction';
import { reset } from '@/config/redux/reducer/postReducers';
import { toast } from 'react-toastify';

function formatPostTime(iso) {
  if (!iso) return '';
  try {
    const d = new Date(iso);
    const now = new Date();
    const diffMs = now - d;
    const mins = Math.floor(diffMs / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h`;
    const days = Math.floor(hrs / 24);
    if (days < 7) return `${days}d`;
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return '';
  }
}

function formatReactionSummary(post, myUserId) {
  const n = post.likes || 0;
  if (n === 0) return '';
  const preview = Array.isArray(post.likedByPreview) ? post.likedByPreview : [];
  const liked =
    myUserId &&
    Array.isArray(post.likedByUsers) &&
    post.likedByUsers.some((id) => String(id) === String(myUserId));

  if (liked) {
    if (n === 1) return 'You';
    const others = n - 1;
    return `You and ${others} ${others === 1 ? 'other' : 'others'}`;
  }

  if (n === 1) return preview[0] || '1 reaction';
  if (n === 2) {
    if (preview.length >= 2) return `${preview[0]} and ${preview[1]}`;
    if (preview.length === 1) return `${preview[0]} and 1 other`;
    return '2 reactions';
  }

  const a = preview[0];
  const b = preview[1];
  const rest = n - 2;
  if (a && b && rest > 0) {
    return `${a}, ${b} and ${rest} ${rest === 1 ? 'other' : 'others'}`;
  }
  if (a) {
    return `${a} and ${n - 1} ${n - 1 === 1 ? 'other' : 'others'}`;
  }
  return `${n} reactions`;
}

function formatCommentTime(iso) {
  return formatPostTime(iso);
}

function closeCommentModal(dispatch) {
  dispatch(reset());
  dispatch(getAllPosts());
}

const ViewProfile = ({ userProfile }) => {
  const postReducer = useSelector((state) => state.posts);
  const authState = useSelector((state) => state.auth);
  const postState = postReducer;
  const dispatch = useDispatch();

  const [userPosts, setUserPosts] = useState([]);
  const [isCurrentUserInConnections, setIsCurrentUserInConnections] = useState(false);
  const [isConnectionNull, setIsConnectionNull] = useState(true);
  const [likingPostId, setLikingPostId] = useState(null);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [commentPosting, setCommentPosting] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [resumeLoading, setResumeLoading] = useState(false);

  const loadData = useCallback(async () => {
    await dispatch(getAllPosts());
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (token) {
      await dispatch(getConnectionRequest({ token }));
      await dispatch(getMyConnectionRequest({ token }));
    }
  }, [dispatch]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (!userProfile?.userId?.username) return;
    const filtered = postReducer.posts.filter(
      (post) => post.userId.username === userProfile.userId.username
    );
    setUserPosts(filtered);
  }, [postReducer?.posts, userProfile?.userId?.username]);

  useEffect(() => {
    if (!userProfile?.userId?._id) return;
    const targetId = String(userProfile.userId._id);
    let inRel = false;
    let pending = true;

    const c = authState.connections?.find(
      (u) => u.connectionId?._id && String(u.connectionId._id) === targetId
    );
    if (c) {
      inRel = true;
      pending = c.status_accepted !== true;
    }
    const r = authState.connectionRequests?.find(
      (u) => u.userId?._id && String(u.userId._id) === targetId
    );
    if (r) {
      inRel = true;
      pending = r.status_accepted !== true;
    }

    setIsCurrentUserInConnections(inRel);
    setIsConnectionNull(pending);
  }, [authState.connections, authState.connectionRequests, userProfile?.userId?._id]);

  const submitViewComment = useCallback(async () => {
    const text = commentText.trim();
    if (!text || !postState.postId) return;
    setCommentPosting(true);
    try {
      await dispatch(postComment({ post_id: postState.postId, body: text })).unwrap();
      await dispatch(getAllComments({ post_id: postState.postId }));
      await dispatch(getAllPosts());
      setCommentText('');
      toast.success('Comment added');
    } catch {
      toast.error('Could not post comment');
    } finally {
      setCommentPosting(false);
    }
  }, [commentText, postState.postId, dispatch]);

  const openShareModal = (post) => {
    setSelectedPost(post);
    setShareModalOpen(true);
  };

  const handleConnect = async () => {
    if (!userProfile?.userId?._id || connecting) return;
    setConnecting(true);
    try {
      await dispatch(
        sendConnectionRequest({
          user_id: userProfile.userId._id,
          token: localStorage.getItem('token'),
        })
      ).unwrap();
      toast.success('Invitation sent');
      await dispatch(getConnectionRequest({ token: localStorage.getItem('token') }));
      await dispatch(getMyConnectionRequest({ token: localStorage.getItem('token') }));
    } catch (err) {
      const msg = err?.message || (typeof err === 'string' ? err : 'Could not send request');
      if (/already/i.test(String(msg))) {
        toast.info(String(msg));
      } else {
        toast.error(String(msg));
      }
    } finally {
      setConnecting(false);
    }
  };

  const downloadResume = async () => {
    if (!userProfile?.userId?._id || resumeLoading) return;
    setResumeLoading(true);
    try {
      const response = await clientServer.get(`/user/download_resume?id=${userProfile.userId._id}`);
      if (response.data?.message) {
        window.open(`${BASE_URL}/${response.data.message}`, '_blank', 'noopener,noreferrer');
      } else {
        toast.error('No resume available');
      }
    } catch {
      toast.error('Could not download resume');
    } finally {
      setResumeLoading(false);
    }
  };

  const isViewingSelf =
    authState.user?.userId?.username &&
    userProfile?.userId?.username &&
    authState.user.userId.username === userProfile.userId.username;

  const renderActivityPost = (post) => {
    const uid = authState.user?.userId?._id;
    const hasLiked =
      uid &&
      Array.isArray(post.likedByUsers) &&
      post.likedByUsers.some((id) => String(id) === String(uid));
    const summaryText = formatReactionSummary(post, uid);
    const isLiking = likingPostId === post._id;
    const commentCount = post.commentCount ?? 0;

    return (
      <article key={post._id} className={feed.feedPost}>
        <header className={feed.postHeader}>
          <img
            className={feed.postAvatar}
            src={
              post?.userId?.profilePicture
                ? mediaUrl(post.userId.profilePicture)
                : '/defaultProfilePicture.jpg'
            }
            alt=""
          />
          <div className={feed.postHeaderText}>
            <div className={feed.postAuthorLine}>
              <h3 className={feed.postAuthorName}>{post.userId.name}</h3>
              <span className={feed.postMetaDot}>•</span>
              <span className={feed.postTime}>{formatPostTime(post.createdAt)}</span>
            </div>
            <p className={feed.postHeadline}>@{post.userId.username}</p>
          </div>
          {authState.user?.userId?._id &&
            String(post.userId._id) === String(authState.user.userId._id) && (
              <details className={feed.postMenu}>
                <summary className={feed.postMenuTrigger} aria-label="Post options">
                  ⋯
                </summary>
                <div className={feed.postMenuDropdown}>
                  <button
                    type="button"
                    className={feed.postMenuItem}
                    onClick={async () => {
                      await dispatch(deletePost(post._id));
                      await dispatch(getAllPosts());
                      toast.success('Post removed');
                    }}
                  >
                    Delete post
                  </button>
                </div>
              </details>
            )}
        </header>

        {post.body ? <p className={feed.postText}>{post.body}</p> : null}

        {post.media ? (
          <div className={feed.postMedia}>
            <img src={mediaUrl(post.media)} alt="" className={feed.postMediaImg} />
          </div>
        ) : null}

        <div className={feed.postEngagement}>
          {(post.likes > 0 && summaryText) || commentCount > 0 ? (
            <div className={feed.postEngagementStats}>
              <div className={feed.postEngagementLeft}>
                {post.likes > 0 && summaryText ? (
                  <div className={feed.postReactionsLeft}>
                    <span className={feed.reactionIconStack} aria-hidden>
                      <span className={feed.reactionBubbleLike}>
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <circle cx="8" cy="8" r="8" fill="#378FE9" />
                          <path
                            fill="#fff"
                            d="M8.65 4.9c-.32 0-.58.22-.65.52l-.18.78H6.4c-.33 0-.6.27-.6.6v3.55c0 .33.27.6.6.6h4.65c.28 0 .52-.18.6-.45l.75-2.65a.6.6 0 0 0-.58-.75H9.55l.22-.95c.06-.25-.14-.5-.4-.5H8.65zm-3.5 1.1a.5.5 0 0 0-.5.5v3.55c0 .28.22.5.5.5h.85a.5.5 0 0 0 .5-.5V6.5a.5.5 0 0 0-.5-.5h-.85z"
                          />
                        </svg>
                      </span>
                    </span>
                    <span className={feed.postReactionSummaryText}>{summaryText}</span>
                  </div>
                ) : null}
              </div>
              {commentCount > 0 ? (
                <button
                  type="button"
                  className={feed.postStatsCommentsLink}
                  onClick={() => dispatch(getAllComments({ post_id: post._id }))}
                >
                  {commentCount} {commentCount === 1 ? 'comment' : 'comments'}
                </button>
              ) : null}
            </div>
          ) : null}

          <div
            className={`${feed.postActionsRow} ${
              post.likes > 0 || commentCount > 0 ? feed.postActionsRowAfterStats : feed.postActionsRowSolo
            }`}
          >
            <button
              type="button"
              className={`${feed.postActionBtn} ${hasLiked ? feed.postActionBtnActive : ''} ${
                isLiking ? feed.postActionBtnBusy : ''
              }`}
              disabled={isLiking || !uid}
              aria-pressed={hasLiked}
              onClick={async () => {
                if (!uid) return;
                setLikingPostId(post._id);
                try {
                  await dispatch(togglePostLike({ post_id: post._id })).unwrap();
                } catch {
                  toast.error('Could not update like. Try again.');
                } finally {
                  setLikingPostId(null);
                }
              }}
            >
              {isLiking ? (
                <span className={feed.postLikeSpinner} aria-hidden />
              ) : (
                <svg
                  viewBox="0 0 24 24"
                  fill={hasLiked ? 'currentColor' : 'none'}
                  strokeWidth={1.5}
                  stroke="currentColor"
                  aria-hidden
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6.633 10.25c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 0 1 2.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 0 0 .322-1.672V2.75a.75.75 0 0 1 .75-.75 2.25 2.25 0 0 1 2.25 2.25c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282m0 0h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 0 1-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 0 0-1.423-.23H5.904m10.598-9.75H14.25M5.904 18.5c.083.205.173.405.27.602.197.4-.078.898-.523.898h-.908c-.889 0-1.713-.518-1.972-1.368a12 12 0 0 1-.521-3.507c0-1.553.295-3.036.831-4.398C3.387 9.953 4.167 9.5 5 9.5h1.053c.472 0 .745.556.5.96a8.958 8.958 0 0 0-1.302 4.665c0 1.194.232 2.333.654 3.375Z"
                  />
                </svg>
              )}
              <span>Like</span>
            </button>

            <button
              type="button"
              className={feed.postActionBtn}
              onClick={() => dispatch(getAllComments({ post_id: post._id }))}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.488.432.447.74 1.04.586 1.641a4.043 4.043 0 0 1-.597 1.129c-.179.186-.357.37-.551.548-.299.265-.588.557-.887.855a19.3 19.3 0 0 1-5.547-4.048A17.07 17.07 0 0 1 3 12"
                />
              </svg>
              <span>Comment</span>
            </button>

            <button type="button" className={feed.postActionBtn} onClick={() => openShareModal(post)}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 0 0-3.632-3.632 48.39 48.39 0 0 0-7.66 0c-1.859.21-3.32 1.671-3.53 3.53a48.39 48.39 0 0 0 0 7.66c.21 1.859 1.671 3.32 3.53 3.53a48.39 48.39 0 0 0 7.66 0c1.859-.21 3.32-1.671 3.53-3.53.092-1.209.138-2.43.138-3.662Z"
                />
              </svg>
              <span>Repost</span>
            </button>

            <button type="button" className={feed.postActionBtn} onClick={() => openShareModal(post)}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5"
                />
              </svg>
              <span>Send</span>
            </button>
          </div>
        </div>
      </article>
    );
  };

  if (!userProfile?.userId) {
    return (
      <UserLayout>
        <DashbordLayout>
          <div className={profileStyle.profileLoading}>Profile not found.</div>
        </DashbordLayout>
      </UserLayout>
    );
  }

  return (
    <UserLayout>
      <DashbordLayout>
        <div className={profileStyle.profilePage}>
          <div className={profileStyle.profileShell}>
            <section className={profileStyle.heroCard} aria-label="Member profile">
              <div className={profileStyle.heroCover} />
              <div className={profileStyle.heroBody}>
                <div className={profileStyle.avatarBlock}>
                  <div className={profileStyle.avatarRing}>
                    <img
                      className={profileStyle.avatarImg}
                      src={mediaUrl(userProfile.userId.profilePicture)}
                      alt=""
                    />
                  </div>
                </div>

                <div className={profileStyle.heroText}>
                  <h1
                    style={{
                      margin: '0 0 6px',
                      fontSize: 24,
                      fontWeight: 600,
                      color: '#1d2226',
                      letterSpacing: '-0.02em',
                      maxWidth: 480,
                    }}
                  >
                    {userProfile.userId.name}
                  </h1>
                  {userProfile.currentPost ? (
                    <p
                      style={{
                        margin: '4px 0 8px',
                        fontSize: 15,
                        lineHeight: 1.35,
                        color: '#1d2226',
                        maxWidth: 560,
                      }}
                    >
                      {userProfile.currentPost}
                    </p>
                  ) : null}
                  <p className={profileStyle.usernameLine}>@{userProfile.userId.username}</p>

                  {isViewingSelf ? (
                    <p className={localStyle.selfNotice}>
                      You’re viewing your public profile.{' '}
                      <Link href="/profile">Edit profile</Link>
                    </p>
                  ) : null}

                  <div className={localStyle.connectRow}>
                    {!isViewingSelf && authState.user?.userId ? (
                      <>
                        {isCurrentUserInConnections ? (
                          <span
                            className={`${localStyle.statusPill} ${
                              isConnectionNull ? localStyle.statusPillPending : localStyle.statusPillConnected
                            }`}
                          >
                            {isConnectionNull ? 'Pending' : 'Connected'}
                          </span>
                        ) : (
                          <button
                            type="button"
                            className={profileStyle.btnPrimary}
                            disabled={connecting}
                            onClick={handleConnect}
                          >
                            {connecting ? (
                              <>
                                <span className={profileStyle.btnSpinner} aria-hidden />
                                Sending…
                              </>
                            ) : (
                              'Connect'
                            )}
                          </button>
                        )}
                        <button
                          type="button"
                          className={localStyle.btnResume}
                          onClick={downloadResume}
                          disabled={resumeLoading}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3"
                            />
                          </svg>
                          {resumeLoading ? 'Opening…' : 'Resume'}
                        </button>
                      </>
                    ) : null}
                  </div>
                </div>
              </div>
            </section>

            <div className={profileStyle.profileUpper}>
              <section className={profileStyle.sectionCard} aria-labelledby="view-about">
                <h2 id="view-about" className={profileStyle.sectionTitle}>
                  About
                </h2>
                <p
                  style={{
                    margin: 0,
                    fontSize: 14,
                    lineHeight: 1.55,
                    color: '#1d2226',
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  {userProfile.bio?.trim() ? userProfile.bio : 'No bio yet.'}
                </p>
              </section>

              <section className={profileStyle.sectionCard} aria-labelledby="view-exp">
                <h2 id="view-exp" className={profileStyle.sectionTitle}>
                  Experience
                </h2>
                {(userProfile.postWork || []).length > 0 ? (
                  <ul className={profileStyle.expList}>
                    {(userProfile.postWork || []).map((work, index) => (
                      <li key={`${work.company}-${index}`} className={profileStyle.expItem}>
                        <div className={profileStyle.expIcon} aria-hidden>
                          <svg viewBox="0 0 24 24" fill="none" strokeWidth={1.25} stroke="currentColor">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M3.75 21h16.5M4.5 3h15M5 3v16.5M19 21V6m-2.25 3.75h-9.5m9.5 0h-9.5m9.5 0v10.5m-13.5-10.5v10.5"
                            />
                          </svg>
                        </div>
                        <div className={profileStyle.expBody}>
                          <p className={profileStyle.expTitle}>{work.position}</p>
                          <p className={profileStyle.expCompany}>{work.company}</p>
                          {work.years ? <p className={profileStyle.expMeta}>{work.years}</p> : null}
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className={profileStyle.emptyHint}>No experience listed.</p>
                )}
              </section>

              {userProfile.education && userProfile.education.length > 0 ? (
                <section className={profileStyle.sectionCard} aria-labelledby="view-edu">
                  <h2 id="view-edu" className={profileStyle.sectionTitle}>
                    Education
                  </h2>
                  <ul className={profileStyle.eduList}>
                    {userProfile.education.map((ed, index) => (
                      <li key={index} className={profileStyle.eduItem}>
                        <p className={profileStyle.eduSchool}>{ed.school || 'School'}</p>
                        <p className={profileStyle.eduDetail}>
                          {[ed.degree, ed.fieldOfStudy].filter(Boolean).join(' · ')}
                        </p>
                      </li>
                    ))}
                  </ul>
                </section>
              ) : null}
            </div>

            <section className={profileStyle.activitySection} aria-labelledby="view-activity">
              <div className={profileStyle.activitySectionHeader}>
                <h2 id="view-activity" className={profileStyle.activitySectionTitle}>
                  Activity
                </h2>
                <p className={profileStyle.activitySectionSub}>{userPosts.length} posts</p>
              </div>
              <div className={feed.postContainer}>
                {userPosts.length === 0 ? (
                  <div className={profileStyle.activityEmpty}>
                    <p>No posts yet</p>
                    <p className={profileStyle.activityEmptyHint}>This member hasn’t shared anything.</p>
                  </div>
                ) : (
                  userPosts.map((post) => renderActivityPost(post))
                )}
              </div>
            </section>
          </div>
        </div>

        {shareModalOpen && selectedPost && (
          <div className={feed.modalOverlay}>
            <div className={feed.modalContent}>
              <h3>Share this post</h3>
              <a
                href={`https://api.whatsapp.com/send?text=${encodeURIComponent(selectedPost.body || '')}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Share on WhatsApp
              </a>
              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(selectedPost.body || '')}&url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.origin : '')}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Share on Twitter
              </a>
              <a
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Share on LinkedIn
              </a>
              <button type="button" onClick={() => setShareModalOpen(false)}>
                Close
              </button>
            </div>
          </div>
        )}

        {postState.postId !== '' && (
          <div
            className={feed.commentModalOverlay}
            role="presentation"
            onClick={() => closeCommentModal(dispatch)}
          >
            <div
              className={feed.commentModalPanel}
              role="dialog"
              aria-modal="true"
              aria-labelledby="view-comment-modal-title"
              onClick={(e) => e.stopPropagation()}
            >
              <header className={feed.commentModalHeader}>
                <h2 id="view-comment-modal-title" className={feed.commentModalTitle}>
                  Comments
                  {postState.comments.length > 0 ? (
                    <span className={feed.commentModalCount}>{postState.comments.length}</span>
                  ) : null}
                </h2>
                <button
                  type="button"
                  className={feed.commentModalClose}
                  aria-label="Close comments"
                  onClick={() => closeCommentModal(dispatch)}
                >
                  <svg viewBox="0 0 24 24" fill="none" strokeWidth={1.75} stroke="currentColor" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                  </svg>
                </button>
              </header>

              <div className={feed.commentModalBody}>
                {postState.comments.length === 0 ? (
                  <div className={feed.commentEmpty}>
                    <div className={feed.commentEmptyIcon} aria-hidden>
                      <svg viewBox="0 0 24 24" fill="none" strokeWidth={1.25} stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.765 9.765 0 0 1-2.348-.298m-7.518 0A9.887 9.887 0 0 1 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z"
                        />
                      </svg>
                    </div>
                    <p className={feed.commentEmptyTitle}>No comments yet</p>
                    <p className={feed.commentEmptyHint}>Be the first to share what you think.</p>
                  </div>
                ) : (
                  <ul className={feed.commentThread}>
                    {postState.comments.map((comment) => {
                      const isCommentAuthor =
                        authState.user?.userId?._id &&
                        String(comment.userId?._id) === String(authState.user.userId._id);
                      const pic = comment.userId?.profilePicture
                        ? mediaUrl(comment.userId.profilePicture)
                        : '/defaultProfilePicture.jpg';
                      return (
                        <li key={comment._id} className={feed.commentRow}>
                          <img className={feed.commentAvatar} src={pic} alt="" />
                          <div className={feed.commentBubbleWrap}>
                            <div className={feed.commentBubble}>
                              <div className={feed.commentBubbleTop}>
                                <div className={feed.commentBubbleMeta}>
                                  <span className={feed.commentAuthor}>{comment.userId?.name || 'Member'}</span>
                                  <span className={feed.commentMetaSep}>·</span>
                                  <span className={feed.commentTime}>{formatCommentTime(comment.createdAt)}</span>
                                </div>
                                {isCommentAuthor ? (
                                  <details className={feed.commentItemMenu}>
                                    <summary className={feed.commentItemMenuBtn} aria-label="Comment options">
                                      ⋯
                                    </summary>
                                    <div className={feed.commentItemMenuDrop}>
                                      <button
                                        type="button"
                                        className={feed.commentItemMenuDelete}
                                        onClick={async (ev) => {
                                          ev.preventDefault();
                                          const d = ev.currentTarget.closest('details');
                                          if (d) d.open = false;
                                          await dispatch(
                                            deleteComment({
                                              comment_id: comment._id,
                                              token: localStorage.getItem('token'),
                                            })
                                          );
                                          await dispatch(getAllComments({ post_id: postState.postId }));
                                          await dispatch(getAllPosts());
                                          toast.success('Comment removed');
                                        }}
                                      >
                                        Delete
                                      </button>
                                    </div>
                                  </details>
                                ) : null}
                              </div>
                              <p className={feed.commentSubline}>@{comment.userId?.username || 'user'}</p>
                              <p className={feed.commentBody}>{comment.body}</p>
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>

              <footer className={feed.commentComposer}>
                <img
                  className={feed.commentComposerAvatar}
                  src={
                    authState.user?.userId?.profilePicture
                      ? mediaUrl(authState.user.userId.profilePicture)
                      : '/defaultProfilePicture.jpg'
                  }
                  alt=""
                />
                <div className={feed.commentComposerInner}>
                  <label htmlFor="view-profile-comment-input" className={feed.srOnly}>
                    Write a comment
                  </label>
                  <textarea
                    id="view-profile-comment-input"
                    className={feed.commentComposerInput}
                    rows={1}
                    placeholder="Add a comment…"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        submitViewComment();
                      }
                    }}
                  />
                  <div className={feed.commentComposerBar}>
                    <button
                      type="button"
                      className={feed.commentComposerSubmit}
                      disabled={commentPosting || !commentText.trim()}
                      onClick={() => submitViewComment()}
                    >
                      {commentPosting ? <span className={feed.commentComposerSpinner} aria-hidden /> : null}
                      {commentPosting ? 'Posting…' : 'Post'}
                    </button>
                  </div>
                </div>
              </footer>
            </div>
          </div>
        )}
      </DashbordLayout>
    </UserLayout>
  );
};

export default ViewProfile;

export async function getServerSideProps(context) {
  try {
    const username = context.query.username?.trim();
    if (!username) {
      return { notFound: true };
    }

    const request = await clientServer.get('/user/get_profile_based_on_username', {
      params: { username },
    });

    return {
      props: {
        userProfile: request.data.profile,
      },
    };
  } catch (error) {
    console.error('Error fetching profile:', error.message);
    return {
      notFound: true,
    };
  }
}
