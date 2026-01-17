import Head from "next/head";
import { Inter } from "next/font/google";
import styles from "../styles/Home.module.css";
import { useRouter } from "next/router";
import UserLayout from "@/layout/userLayout";
import { useEffect, useState } from "react";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <UserLayout>
      <Head>
        <title>ProConnect - Professional Networking Platform</title>
        <meta name="description" content="Connect with professionals, build your network, and advance your career with ProConnect" />
      </Head>

      <div className={`${styles.container} ${isVisible ? styles.fadeIn : ''}`}>
        <div className={styles.heroSection}>
          
          {/* Left Content */}
          <div className={styles.heroContent}>
            <h1 className={styles.heroTitle}>
              Welcome to your professional community
            </h1>
            <p className={styles.heroSubtitle}>
              Connect with professionals, discover opportunities, and grow your career with ProConnect
            </p>
            
            <div className={styles.ctaGroup}>
              <button 
                className={styles.primaryButton}
                onClick={() => router.push("/login")}
              >
                Join Now
              </button>
              <button 
                className={styles.secondaryButton}
                onClick={() => router.push("/login")}
              >
                Sign In
              </button>
            </div>

            {/* Trust Indicators */}
            <div className={styles.trustIndicators}>
              <div className={styles.trustItem}>
                <span className={styles.trustNumber}>10K+</span>
                <span className={styles.trustLabel}>Professionals</span>
              </div>
              <div className={styles.trustItem}>
                <span className={styles.trustNumber}>500+</span>
                <span className={styles.trustLabel}>Companies</span>
              </div>
              <div className={styles.trustItem}>
                <span className={styles.trustNumber}>1K+</span>
                <span className={styles.trustLabel}>Jobs Posted</span>
              </div>
            </div>
          </div>

          {/* Right Illustration */}
          <div className={styles.heroIllustration}>
            <div className={styles.illustrationCard}>
              <div className={styles.cardHeader}>
                <div className={styles.cardAvatar}></div>
                <div className={styles.cardInfo}>
                  <div className={styles.cardLine}></div>
                  <div className={styles.cardLineSmall}></div>
                </div>
              </div>
              <div className={styles.cardBody}>
                <div className={styles.cardBodyLine}></div>
                <div className={styles.cardBodyLine}></div>
                <div className={styles.cardBodyLineShort}></div>
              </div>
              <div className={styles.cardFooter}>
                <div className={styles.cardAction}></div>
                <div className={styles.cardAction}></div>
                <div className={styles.cardAction}></div>
              </div>
            </div>

            {/* Floating Elements */}
            <div className={styles.floatingElement1}></div>
            <div className={styles.floatingElement2}></div>
          </div>
        </div>

        {/* Features Section */}
        <div className={styles.featuresSection}>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="#0A66C2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="9" cy="7" r="4" stroke="#0A66C2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke="#0A66C2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h3 className={styles.featureTitle}>Build Your Network</h3>
            <p className={styles.featureDescription}>Connect with professionals in your industry</p>
          </div>

          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                <rect x="2" y="7" width="20" height="14" rx="2" stroke="#0A66C2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" stroke="#0A66C2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h3 className={styles.featureTitle}>Discover Opportunities</h3>
            <p className={styles.featureDescription}>Find jobs that match your skills and interests</p>
          </div>

          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L2 7l10 5 10-5-10-5z" stroke="#0A66C2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 17l10 5 10-5M2 12l10 5 10-5" stroke="#0A66C2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h3 className={styles.featureTitle}>Grow Your Career</h3>
            <p className={styles.featureDescription}>Access resources to advance professionally</p>
          </div>
        </div>
      </div>
    </UserLayout>
  );
}
