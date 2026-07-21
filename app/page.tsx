export default function Home() {
  return (
    <div className="page">
      <header className="site-header">
        <div className="brand">
          <span className="brand-name">Arsenii</span>
          <span className="brand-role">, Software Engineer</span>
        </div>
        <nav className="site-nav">
          <a href="#currently">Currently</a>
          <a href="#contact">Contact</a>
        </nav>
      </header>

      <div className="row">
        <section className="card hero">
          <div className="hero-top">
            <div className="hero-who">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="avatar" src="/avatar.jpg" alt="Portrait of Arsenii" />
              <div className="hero-who-text">
                <div className="hero-name">Hi, I&rsquo;m Arsenii.</div>
                <div className="hero-title">Senior software engineer</div>
              </div>
            </div>
            <div className="social-links">
              <a className="social-icon" href="https://github.com/arseniypom" aria-label="GitHub">
                <svg width="19" height="19" viewBox="0 0 24 24" fill="#e9e4e6">
                  <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56 0-.28-.01-1.02-.02-2-3.2.7-3.88-1.54-3.88-1.54-.52-1.33-1.28-1.68-1.28-1.68-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.03 1.75 2.69 1.25 3.34.95.1-.74.4-1.25.72-1.54-2.55-.29-5.24-1.28-5.24-5.68 0-1.26.45-2.28 1.18-3.09-.12-.29-.51-1.46.11-3.05 0 0 .96-.31 3.15 1.18a10.9 10.9 0 0 1 5.74 0c2.19-1.49 3.15-1.18 3.15-1.18.62 1.59.23 2.76.11 3.05.73.81 1.18 1.83 1.18 3.09 0 4.41-2.69 5.38-5.26 5.66.41.35.77 1.05.77 2.12 0 1.53-.01 2.76-.01 3.14 0 .31.21.67.8.55A11.51 11.51 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z"></path>
                </svg>
              </a>
            </div>
          </div>
          <h1 className="hero-heading">
            Software engineer in London, building products and writing about engineering and AI.
          </h1>
          <p className="hero-copy">
            I build software by day, work on my own products on the side, and share my experience.
          </p>
        </section>

        <section className="card portrait">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="portrait-photo" src="/portrait.png" alt="Arsenii" />
        </section>
      </div>

      <div className="row">
        <section id="currently" className="card currently">
          <div className="currently-blob currently-blob-1"></div>
          <div className="currently-blob currently-blob-2"></div>
          <h2 className="currently-heading">Currently</h2>
          <ul className="currently-list">
            <li>Senior Software Engineer at Wise</li>
            <li>Building a few independent products on the side.</li>
          </ul>
        </section>

        <section id="contact" className="card contact">
          <h2 className="contact-heading">Contact me</h2>
          <a className="contact-link" href="mailto:arseniy.pomazkov@gmail.com">
            arsenii@pomazkov.com
          </a>
        </section>
      </div>

      <footer className="site-footer">
        <div className="footer-line">Made by me &copy;2026</div>
        <div className="footer-tagline">Let&rsquo;s talk!</div>
      </footer>
    </div>
  );
}
