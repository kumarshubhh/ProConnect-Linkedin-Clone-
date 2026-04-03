import { getAllUsers } from '@/config/redux/action/authAction';
import {  createPost, deleteComment, deletePost, getAllComments, getAllPosts, postComment, togglePostLike } from '@/config/redux/action/postAction';
import DashbordLayout from '@/layout/DashboardLayout';
import UserLayout from '@/layout/userLayout';
import { useRouter } from 'next/router'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import style from "./style.module.css"
import { mediaUrl } from '@/config';
import { reset } from '@/config/redux/reducer/postReducers';
import { toast } from "react-toastify";

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

/** LinkedIn-style reaction summary (single “Like” type). */
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
  if (!iso) return '';
  return formatPostTime(iso);
}

function closeCommentModal(dispatch) {
  dispatch(reset());
  dispatch(getAllPosts());
}

function dashboard() {

    const router = useRouter();

const authState = useSelector((state) => state.auth)
const postState = useSelector((state) => state.posts)



   
    const dispatch = useDispatch();



  useEffect(() =>{

    if(authState.isTokenThere){
        dispatch(getAllPosts());
    }

    if(!authState.all_profiles_fetched){
            dispatch(getAllUsers());
    
        }

  }, [authState.isTokenThere])


 const [postContent, setPostContent] = useState("")
 const [fileContent, setFileContent] = useState(undefined);
 const [imagePreview, setImagePreview] = useState(null);
 const [isPosting, setIsPosting] = useState(false);
 const fileInputRef = useRef(null);
 const [shareModalOpen, setShareModalOpen] = useState(false);
const [selectedPost, setSelectedPost] = useState(null);
const [commentText, setCommentText] = useState("");
const [commentPosting, setCommentPosting] = useState(false);
const [likingPostId, setLikingPostId] = useState(null);

  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  const clearFileSelection = useCallback(() => {
    setImagePreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    setFileContent(undefined);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  const onFileChange = (e) => {
    const file = e.target.files?.[0];
    setImagePreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return file ? URL.createObjectURL(file) : null;
    });
    setFileContent(file || undefined);
  };

 const handleUpload = async () => {
  const text = postContent.trim();
  if (!text && !fileContent) {
    toast.info('Write something or add a photo.');
    return;
  }
  setIsPosting(true);
  try {
    await dispatch(createPost({ file: fileContent, body: text })).unwrap();
    toast.success('Post published');
    setPostContent('');
    clearFileSelection();
    await dispatch(getAllPosts());
  } catch (err) {
    const msg =
      typeof err === 'string'
        ? err
        : err?.message || err?.error || 'Could not publish post';
    toast.error(typeof msg === 'string' ? msg : 'Could not publish post');
  } finally {
    setIsPosting(false);
  }
 };

 const canPost = postContent.trim().length > 0 || Boolean(fileContent);

 const openModal = (post) => {
  setSelectedPost(post);
  setShareModalOpen(true);
};

  const submitDashboardComment = useCallback(async () => {
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

  if(authState.user){

  return (
    <UserLayout>
   <DashbordLayout>
<div  className= {style.scrollComponenet}> 

  <div className={style.wrapper}>
  <div className="mainContent">
  <section className={style.composerCard} aria-label="Create a post">
    <div className={style.composerTop}>
      <img
        className={style.userProfile}
        src={
          authState?.user?.userId?.profilePicture
            ? mediaUrl(authState.user.userId.profilePicture)
            : '/defaultProfilePicture.jpg'
        }
        alt=""
      />
      <div className={style.composerMain}>
        <textarea
          value={postContent}
          onChange={(e) => setPostContent(e.target.value)}
          className={style.composerTextarea}
          rows={2}
          placeholder="What do you want to talk about?"
        />
        {imagePreview ? (
          <div className={style.previewWrap}>
            <img src={imagePreview} alt="" className={style.previewImg} />
            <button
              type="button"
              className={style.previewRemove}
              onClick={clearFileSelection}
              aria-label="Remove image"
            >
              ×
            </button>
          </div>
        ) : null}
      </div>
    </div>
    <div className={style.composerDivider} />
    <div className={style.composerToolbar}>
      <label htmlFor="dashboard-post-media" className={style.mediaBtn}>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3A1.5 1.5 0 0 0 1.5 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
        </svg>
        <span>Media</span>
      </label>
      <input
        ref={fileInputRef}
        id="dashboard-post-media"
        className={style.hiddenFile}
        type="file"
        accept="image/*"
        onChange={onFileChange}
      />
      <button
        type="button"
        className={style.postBtnPrimary}
        disabled={!canPost || isPosting}
        onClick={handleUpload}
      >
        {isPosting ? 'Posting…' : 'Post'}
      </button>
    </div>
  </section>







<div className={style.postContainer}>
  {postState.posts?.map((post) => {
    const uid = authState.user?.userId?._id;
    const hasLiked =
      uid &&
      Array.isArray(post.likedByUsers) &&
      post.likedByUsers.some((id) => String(id) === String(uid));
    const summaryText = formatReactionSummary(post, uid);
    const isLiking = likingPostId === post._id;

    return (
      <article key={post._id} className={style.feedPost}>
        <header className={style.postHeader}>
          <img
            className={style.postAvatar}
            src={post?.userId?.profilePicture ? mediaUrl(post.userId.profilePicture) : '/defaultProfilePicture.jpg'}
            alt=""
          />
          <div className={style.postHeaderText}>
            <div className={style.postAuthorLine}>
              <h3 className={style.postAuthorName}>{post.userId.name}</h3>
              <span className={style.postMetaDot}>•</span>
              <span className={style.postTime}>{formatPostTime(post.createdAt)}</span>
            </div>
            <p className={style.postHeadline}>@{post.userId.username}</p>
          </div>
          {authState.user?.userId?._id && String(post.userId._id) === String(authState.user.userId._id) && (
            <details className={style.postMenu}>
              <summary className={style.postMenuTrigger} aria-label="Post options">⋯</summary>
              <div className={style.postMenuDropdown}>
                <button
                  type="button"
                  className={style.postMenuItem}
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

        {post.body ? <p className={style.postText}>{post.body}</p> : null}

        {post.media ? (
          <div className={style.postMedia}>
            <img src={mediaUrl(post.media)} alt="" className={style.postMediaImg} />
          </div>
        ) : null}

        <div className={style.postEngagement}>
        {(post.likes > 0 && summaryText) || post.commentCount > 0 ? (
          <div className={style.postEngagementStats}>
            <div className={style.postEngagementLeft}>
              {post.likes > 0 && summaryText ? (
                <div className={style.postReactionsLeft}>
                  <span className={style.reactionIconStack} aria-hidden>
                    <span className={style.reactionBubbleLike}>
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="8" cy="8" r="8" fill="#378FE9" />
                        <path
                          fill="#fff"
                          d="M8.65 4.9c-.32 0-.58.22-.65.52l-.18.78H6.4c-.33 0-.6.27-.6.6v3.55c0 .33.27.6.6.6h4.65c.28 0 .52-.18.6-.45l.75-2.65a.6.6 0 0 0-.58-.75H9.55l.22-.95c.06-.25-.14-.5-.4-.5H8.65zm-3.5 1.1a.5.5 0 0 0-.5.5v3.55c0 .28.22.5.5.5h.85a.5.5 0 0 0 .5-.5V6.5a.5.5 0 0 0-.5-.5h-.85z"
                        />
                      </svg>
                    </span>
                  </span>
                  <span className={style.postReactionSummaryText}>{summaryText}</span>
                </div>
              ) : null}
            </div>
            {post.commentCount > 0 ? (
              <button
                type="button"
                className={style.postStatsCommentsLink}
                onClick={() => dispatch(getAllComments({ post_id: post._id }))}
              >
                {post.commentCount} {post.commentCount === 1 ? 'comment' : 'comments'}
              </button>
            ) : null}
          </div>
        ) : null}

        <div
          className={`${style.postActionsRow} ${
            post.likes > 0 || (post.commentCount > 0)
              ? style.postActionsRowAfterStats
              : style.postActionsRowSolo
          }`}
        >
          <button
            type="button"
            className={`${style.postActionBtn} ${hasLiked ? style.postActionBtnActive : ''} ${
              isLiking ? style.postActionBtnBusy : ''
            }`}
            disabled={isLiking || !uid}
            aria-pressed={hasLiked}
            aria-label={hasLiked ? 'Unlike' : 'Like'}
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
              <span className={style.postLikeSpinner} aria-hidden />
            ) : (
              <svg viewBox="0 0 24 24" fill={hasLiked ? 'currentColor' : 'none'} strokeWidth={1.5} stroke="currentColor" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.633 10.25c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 0 1 2.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 0 0 .322-1.672V2.75a.75.75 0 0 1 .75-.75 2.25 2.25 0 0 1 2.25 2.25c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282m0 0h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 0 1-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 0 0-1.423-.23H5.904m10.598-9.75H14.25M5.904 18.5c.083.205.173.405.27.602.197.4-.078.898-.523.898h-.908c-.889 0-1.713-.518-1.972-1.368a12 12 0 0 1-.521-3.507c0-1.553.295-3.036.831-4.398C3.387 9.953 4.167 9.5 5 9.5h1.053c.472 0 .745.556.5.96a8.958 8.958 0 0 0-1.302 4.665c0 1.194.232 2.333.654 3.375Z" />
              </svg>
            )}
            <span>Like</span>
          </button>

          <button
            type="button"
            className={style.postActionBtn}
            onClick={() => dispatch(getAllComments({ post_id: post._id }))}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.488.432.447.74 1.04.586 1.641a4.043 4.043 0 0 1-.597 1.129c-.179.186-.357.37-.551.548-.299.265-.588.557-.887.855a19.3 19.3 0 0 1-5.547-4.048A17.07 17.07 0 0 1 3 12" />
            </svg>
            <span>Comment</span>
          </button>

          <button type="button" className={style.postActionBtn} onClick={() => openModal(post)}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 0 0-3.632-3.632 48.39 48.39 0 0 0-7.66 0c-1.859.21-3.32 1.671-3.53 3.53a48.39 48.39 0 0 0 0 7.66c.21 1.859 1.671 3.32 3.53 3.53a48.39 48.39 0 0 0 7.66 0c1.859-.21 3.32-1.671 3.53-3.53.092-1.209.138-2.43.138-3.662Z" />
            </svg>
            <span>Repost</span>
          </button>

          <button type="button" className={style.postActionBtn} onClick={() => openModal(post)}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
            </svg>
            <span>Send</span>
          </button>
        </div>
        </div>
      </article>
    );
  })}
</div>

{shareModalOpen && selectedPost && (
  <div className={style.modalOverlay}>
    <div className={style.modalContent}>
      <h3>Share this post</h3>
      <a href={`https://api.whatsapp.com/send?text=${encodeURIComponent(selectedPost.body || '')}`} target="_blank" rel="noopener noreferrer">
        Share on WhatsApp
      </a>
      <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(selectedPost.body || '')}&url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.origin : '')}`} target="_blank" rel="noopener noreferrer">
        Share on Twitter
      </a>
      <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`} target="_blank" rel="noopener noreferrer">
        Share on LinkedIn
      </a>
      <button type="button" onClick={() => setShareModalOpen(false)}>Close</button>
    </div>
  </div>
)}
</div>



  </div>


</div>


{postState.postId !== '' && (
  <div
    className={style.commentModalOverlay}
    role="presentation"
    onClick={() => closeCommentModal(dispatch)}
  >
    <div
      className={style.commentModalPanel}
      role="dialog"
      aria-modal="true"
      aria-labelledby="comment-modal-title"
      onClick={(e) => e.stopPropagation()}
    >
      <header className={style.commentModalHeader}>
        <h2 id="comment-modal-title" className={style.commentModalTitle}>
          Comments
          {postState.comments.length > 0 ? (
            <span className={style.commentModalCount}>{postState.comments.length}</span>
          ) : null}
        </h2>
        <button
          type="button"
          className={style.commentModalClose}
          aria-label="Close comments"
          onClick={() => closeCommentModal(dispatch)}
        >
          <svg viewBox="0 0 24 24" fill="none" strokeWidth={1.75} stroke="currentColor" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
          </svg>
        </button>
      </header>

      <div className={style.commentModalBody}>
        {postState.comments.length === 0 ? (
          <div className={style.commentEmpty}>
            <div className={style.commentEmptyIcon} aria-hidden>
              <svg viewBox="0 0 24 24" fill="none" strokeWidth={1.25} stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.765 9.765 0 0 1-2.348-.298m-7.518 0A9.887 9.887 0 0 1 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z"
                />
              </svg>
            </div>
            <p className={style.commentEmptyTitle}>No comments yet</p>
            <p className={style.commentEmptyHint}>Be the first to share what you think.</p>
          </div>
        ) : (
          <ul className={style.commentThread}>
            {postState.comments.map((comment) => {
              const isAuthor =
                authState.user?.userId?._id &&
                String(comment.userId?._id) === String(authState.user.userId._id);
              const pic = comment.userId?.profilePicture
                ? mediaUrl(comment.userId.profilePicture)
                : '/defaultProfilePicture.jpg';
              return (
                <li key={comment._id} className={style.commentRow}>
                  <img className={style.commentAvatar} src={pic} alt="" />
                  <div className={style.commentBubbleWrap}>
                    <div className={style.commentBubble}>
                      <div className={style.commentBubbleTop}>
                        <div className={style.commentBubbleMeta}>
                          <span className={style.commentAuthor}>{comment.userId?.name || 'Member'}</span>
                          <span className={style.commentMetaSep}>·</span>
                          <span className={style.commentTime}>
                            {formatCommentTime(comment.createdAt)}
                          </span>
                        </div>
                        {isAuthor ? (
                          <details className={style.commentItemMenu}>
                            <summary className={style.commentItemMenuBtn} aria-label="Comment options">
                              ⋯
                            </summary>
                            <div className={style.commentItemMenuDrop}>
                              <button
                                type="button"
                                className={style.commentItemMenuDelete}
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
                                  toast.success('Comment removed');
                                }}
                              >
                                Delete
                              </button>
                            </div>
                          </details>
                        ) : null}
                      </div>
                      <p className={style.commentSubline}>@{comment.userId?.username || 'user'}</p>
                      <p className={style.commentBody}>{comment.body}</p>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <footer className={style.commentComposer}>
        <img
          className={style.commentComposerAvatar}
          src={
            authState.user?.userId?.profilePicture
              ? mediaUrl(authState.user.userId.profilePicture)
              : '/defaultProfilePicture.jpg'
          }
          alt=""
        />
        <div className={style.commentComposerInner}>
          <label htmlFor="dashboard-comment-input" className={style.srOnly}>
            Write a comment
          </label>
          <textarea
            id="dashboard-comment-input"
            className={style.commentComposerInput}
            rows={1}
            placeholder="Add a comment…"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                submitDashboardComment();
              }
            }}
          />
          <div className={style.commentComposerBar}>
            <button
              id="dashboard-comment-post"
              type="button"
              className={style.commentComposerSubmit}
              disabled={commentPosting || !commentText.trim()}
              onClick={() => submitDashboardComment()}
            >
              {commentPosting ? (
                <span className={style.commentComposerSpinner} aria-hidden />
              ) : null}
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
  )
}else{

return(
  <UserLayout>
  <DashbordLayout>

<h2>...Loading</h2>

  </DashbordLayout>



   </UserLayout>
)

}
}

export default dashboard
