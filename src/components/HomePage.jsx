import React from "react";
import { Link } from "react-router-dom";
import "./HomePage.css";
import { Heart } from "lucide-react";
import {
  ShieldCheck,
  Zap,
  Bot,
  MessageCircle,
  Phone,
  Video,
  Mail,
  MessageSquare,
  Users,
  Bell,
  Globe,
} from "lucide-react";

const HomePage = () => {

  const iconComponents = [
    MessageCircle,
    Phone,
    Video,
    Mail,
    MessageSquare,
    Users,
    Bell,
    Globe,
    ShieldCheck,
    Bot,
    Zap,
    Heart
  ];

  /* BACKGROUND ICONS */

 const bgIcons = Array.from({ length: 22 }, (_, i) => {

  const Icon = iconComponents[i % iconComponents.length];

  const size = Math.floor(Math.random() * 20 + 26);

  const left = `${Math.random() * 92}%`;

  const duration = `${Math.random() * 20 + 35}s`;

  const delay = `-${Math.random() * 40}s`;   // KEY FIX

  const opacity = Math.random() * 0.12 + 0.08;

  return {
    Icon,
    size,
    key: i,
    style: {
      left,
      animationDuration: duration,
      animationDelay: delay,
      opacity
    }
  };

});

  return (
    <main className="home-page">

      {/* BACKGROUND ANIMATION */}
      <div className="bg-animation">
        {bgIcons.map(({ Icon, size, style, key }) => (
          <Icon
            key={key}
            size={size}
            style={style}
            className="bg-icon"
            strokeWidth={1.2}
          />
        ))}
      </div>

      {/* HERO */}
      <section className="hero">
        <div className="container hero-inner">

          <div className="hero-content">

            <h1 className="chat-title">
              <img
                src="/logo.png"
                alt="EmoConnect Logo"
                className="hero-logo"
              />
              EmoConnect
            </h1>

            <p className="lead">
              Private, secure and real-time conversations with AI-powered moderation.
            </p>

            <div className="hero-actions">

              <Link to="/signup" className="btn primary">
                Get Started
              </Link>

              <Link to="/readmore" className="btn outline">
                Read More
              </Link>

            </div>

          </div>

        </div>
      </section>

      {/* PROJECT AT A GLANCE */}
   {/* PROJECT AT A GLANCE */}
<section className="points">
  <div className="container">

    <h2 className="section-title">
      Project At A Glance
    </h2>

    <div className="points-grid">

      {/* 1️⃣ RANDOM CHAT */}
      <div className="point">
        <div className="icon">
          <Zap size={42} strokeWidth={1.6} />
        </div>
        <h3>Random Anonymous Chat</h3>
        <p>
          Connect instantly with strangers based on emotions and experiences.
        </p>
      </div>

      {/* 2️⃣ NORMAL CHAT */}
      <div className="point">
        <div className="icon">
          <MessageCircle size={42} strokeWidth={1.6} />
        </div>
        <h3>Normal Chat</h3>
        <p>
          Search users, send requests and chat like modern social platforms.
        </p>
      </div>

      {/* 3️⃣ PEACE HUB */}
      <div className="point">
        <div className="icon">
          <Heart size={42} strokeWidth={1.6} />
        </div>
        <h3>Peace Hub</h3>
        <p>
          Relax your mind with meditation, breathing and wellness tools.
        </p>
      </div>

      {/* 4️⃣ AI */}
      <div className="point">
        <div className="icon">
          <Bot size={42} strokeWidth={1.6} />
        </div>
        <h3>AI Assistance</h3>
        <p>
          Get emotional support and smart responses with AI assistance.
        </p>
      </div>

    </div>

  </div>
</section>

      {/* FOOTER */}
      <footer className="site-footer">

        <div className="container footer-inner">

          <div>
            <p>© {new Date().getFullYear()} EmoConnect</p>
            <p className="muted">
              Built with privacy and speed in mind.
            </p>
          </div>

          <div>
            <p>
              Contact:
              <a href="mailto:hello@emoconnect.app">
                hello@emoconnect.app
              </a>
            </p>

            <p>
              Phone:
              <a href="tel:+911234567890">
                +91 12345 67890
              </a>
            </p>
          </div>

        </div>

      </footer>

    </main>
  );
};

export default HomePage;