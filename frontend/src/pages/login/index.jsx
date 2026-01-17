import UserLayout from '@/layout/userLayout'
import { useRouter } from 'next/router'
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import styles from "./style.module.css"
import { getAboutUser, loginUser, registerUser } from '@/config/redux/action/authAction'
import { emptyMessage } from '@/config/redux/reducer/authReducer'
import Head from 'next/head'

function LoginComponent() {
  const authState = useSelector((state) => state.auth)
  const router = useRouter();
  const dispatch = useDispatch();
  const [isLoginMethod, setIsLoginMethod] = useState(true)
  const [isVisible, setIsVisible] = useState(false)
  const [showNotification, setShowNotification] = useState(false)

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [username, setUsername] = useState("")
  const [name, setName] = useState("")

  useEffect(() => {
    setIsVisible(true)
  }, [])

  useEffect(() => {
    if (authState.loggedIn && authState.profileFetched) {
      router.push("/dashboard");
    }
  }, [authState.loggedIn, authState.profileFetched]);

  useEffect(() => {
    dispatch(emptyMessage())
    setShowNotification(false)
  }, [isLoginMethod])

  useEffect(() => {
    if (localStorage.getItem("token")) {
      router.push("/dashboard")
    }
  }, )

  // Show notification when error occurs
  useEffect(() => {
    if (authState.isError && authState.message) {
      setShowNotification(true)
      
      // Auto-dismiss after 4 seconds
      const timer = setTimeout(() => {
        setShowNotification(false)
        dispatch(emptyMessage())
      }, 4000)

      return () => clearTimeout(timer)
    }
  }, [authState.isError, authState.message])

  // Clear error on input change
  const handleEmailChange = (e) => {
    setEmail(e.target.value)
    if (showNotification) {
      setShowNotification(false)
      dispatch(emptyMessage())
    }
  }

  const handlePasswordChange = (e) => {
    setPassword(e.target.value)
    if (showNotification) {
      setShowNotification(false)
      dispatch(emptyMessage())
    }
  }

  const handleRegister = async () => {
    try {
      await dispatch(registerUser({ username, email, password, name })).unwrap();
      const token = localStorage.getItem("token");
      if (token) {
        await dispatch(getAboutUser({ token })).unwrap();
      }
    } catch (error) {
      console.log("Register Error:", error);
    }
  };

  const handleLogin = async () => {
    try {
      await dispatch(loginUser({ email, password })).unwrap();
      const token = localStorage.getItem("token");
      if (token) {
        await dispatch(getAboutUser({ token })).unwrap();
      }
    } catch (error) {
      console.log("Login Error:", error);
    }
  };

  const closeNotification = () => {
    setShowNotification(false)
    dispatch(emptyMessage())
  };

  return (
    <UserLayout>
      <Head>
        <title>{isLoginMethod ? 'Sign In' : 'Sign Up'} - ProConnect</title>
      </Head>

      <div className={`${styles.container} ${isVisible ? styles.fadeIn : ''}`}>
        <div className={styles.authCard}>
          
          {/* Left Side - Form */}
          <div className={styles.formSection}>
            <div className={styles.formContent}>
              
              {/* Logo */}
              <div className={styles.logo}>
                <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                  <rect width="40" height="40" rx="8" fill="#0A66C2"/>
                  <path d="M12 28V16M12 12V12.01M20 28V20M20 16V12M28 28V24M28 20V12" stroke="white" strokeWidth="3" strokeLinecap="round"/>
                </svg>
                <span className={styles.logoText}>ProConnect</span>
              </div>

              {/* Title */}
              <div className={styles.titleSection}>
                <h1 className={styles.title}>
                  {isLoginMethod ? 'Welcome back' : 'Join ProConnect'}
                </h1>
                <p className={styles.subtitle}>
                  {isLoginMethod 
                    ? 'Sign in to continue to your account' 
                    : 'Create your professional profile'}
                </p>
              </div>

              {/* Error Notification */}
              {showNotification && authState.isError && (
                <div className={styles.errorNotification} role="alert" aria-live="assertive">
                  <div className={styles.errorContent}>
                    <div className={styles.errorIcon}>
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                        <circle cx="10" cy="10" r="9" stroke="#DC2626" strokeWidth="2"/>
                        <path d="M10 6v4M10 14h.01" stroke="#DC2626" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                    </div>
                    <div className={styles.errorText}>
                      <div className={styles.errorTitle}>
                        {isLoginMethod ? 'Invalid email or password' : 'Registration failed'}
                      </div>
                      <div className={styles.errorMessage}>
                        {typeof authState.message === "string" 
                          ? authState.message 
                          : authState.message.message}
                      </div>
                    </div>
                    <button 
                      className={styles.errorClose}
                      onClick={closeNotification}
                      aria-label="Close notification"
                    >
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M12 4L4 12M4 4l8 8" stroke="#DC2626" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                    </button>
                  </div>
                </div>
              )}

              {/* Success Message */}
              {authState.message && !authState.isError && (
                <div className={styles.successNotification} role="alert" aria-live="polite">
                  <div className={styles.successIcon}>
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <circle cx="10" cy="10" r="9" stroke="#16A34A" strokeWidth="2"/>
                      <path d="M6 10l2.5 2.5L14 7" stroke="#16A34A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div className={styles.successText}>
                    {typeof authState.message === "string" 
                      ? authState.message 
                      : authState.message.message}
                  </div>
                </div>
              )}

              {/* Form */}
              <form className={styles.form} onSubmit={(e) => e.preventDefault()}>
                
                {/* Name & Username (Sign Up only) */}
                {!isLoginMethod && (
                  <div className={styles.inputRow}>
                    <div className={styles.inputGroup}>
                      <label className={styles.label}>Full Name</label>
                      <input
                        type="text"
                        className={styles.input}
                        placeholder="John Doe"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                      />
                    </div>
                    <div className={styles.inputGroup}>
                      <label className={styles.label}>Username</label>
                      <input
                        type="text"
                        className={styles.input}
                        placeholder="johndoe"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                )}

                {/* Email */}
                <div className={styles.inputGroup}>
                  <label className={styles.label}>Email Address</label>
                  <input
                    type="email"
                    className={styles.input}
                    placeholder="name@company.com"
                    value={email}
                    onChange={handleEmailChange}
                    required
                  />
                </div>

                {/* Password */}
                <div className={styles.inputGroup}>
                  <label className={styles.label}>Password</label>
                  <input
                    type="password"
                    className={styles.input}
                    placeholder="••••••••"
                    value={password}
                    onChange={handlePasswordChange}
                    required
                  />
                </div>

                {/* Forgot Password (Login only) */}
                {isLoginMethod && (
                  <div className={styles.forgotPassword}>
                    <a href="#" className={styles.link}>Forgot password?</a>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  className={styles.submitButton}
                  onClick={isLoginMethod ? handleLogin : handleRegister}
                >
                  {isLoginMethod ? 'Sign In' : 'Create Account'}
                </button>

                {/* Divider */}
                <div className={styles.divider}>
                  <span>or</span>
                </div>

                {/* Toggle Auth Method */}
                <button
                  type="button"
                  className={styles.toggleButton}
                  onClick={() => setIsLoginMethod(!isLoginMethod)}
                >
                  {isLoginMethod 
                    ? "Don't have an account? Sign up" 
                    : 'Already have an account? Sign in'}
                </button>
              </form>
            </div>
          </div>

          {/* Right Side - Illustration */}
          <div className={styles.illustrationSection}>
            <div className={styles.illustrationContent}>
              <h2 className={styles.illustrationTitle}>
                {isLoginMethod 
                  ? 'Connect with professionals worldwide' 
                  : 'Start your professional journey'}
              </h2>
              <p className={styles.illustrationText}>
                {isLoginMethod
                  ? 'Access your network, discover opportunities, and grow your career'
                  : 'Join thousands of professionals building their careers on ProConnect'}
              </p>

              {/* Illustration Cards */}
              <div className={styles.illustrationCards}>
                <div className={styles.miniCard}>
                  <div className={styles.miniCardIcon}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                      <circle cx="9" cy="7" r="4" stroke="white" strokeWidth="2"/>
                    </svg>
                  </div>
                  <div className={styles.miniCardText}>
                    <div className={styles.miniCardTitle}>Build Network</div>
                    <div className={styles.miniCardDesc}>Connect with peers</div>
                  </div>
                </div>

                <div className={styles.miniCard}>
                  <div className={styles.miniCardIcon}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <rect x="2" y="7" width="20" height="14" rx="2" stroke="white" strokeWidth="2"/>
                      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" stroke="white" strokeWidth="2"/>
                    </svg>
                  </div>
                  <div className={styles.miniCardText}>
                    <div className={styles.miniCardTitle}>Find Jobs</div>
                    <div className={styles.miniCardDesc}>Discover opportunities</div>
                  </div>
                </div>

                <div className={styles.miniCard}>
                  <div className={styles.miniCardIcon}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path d="M12 2L2 7l10 5 10-5-10-5z" stroke="white" strokeWidth="2"/>
                      <path d="M2 17l10 5 10-5M2 12l10 5 10-5" stroke="white" strokeWidth="2"/>
                    </svg>
                  </div>
                  <div className={styles.miniCardText}>
                    <div className={styles.miniCardTitle}>Grow Career</div>
                    <div className={styles.miniCardDesc}>Advance professionally</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </UserLayout>
  )
}

export default LoginComponent