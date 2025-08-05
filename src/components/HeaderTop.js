import "./HeaderTop.css"

const HeaderTop = () => {
  return (
    <header className="app-header-top">
      <div className="header-section left-section">
        <img src="/images/LogoCtf.png" alt="CTF Logo" className="logo-ctf" />
      </div>
      <div className="header-section center-section">
        <img src="/images/MINISTERE.png" alt="Ministère" className="logo-ministere" />
      </div>
      <div className="header-section right-section social-icons-group">
        <a
          href="https://www.facebook.com/ctf.tunisie"
          target="_blank"
          rel="noopener noreferrer"
          className="social-link"
        >
          <img src="/images/facebook-icon.png" alt="Facebook" className="social-icon" />
        </a>
        <a href="https://twitter.com/ctf_tunisie" target="_blank" rel="noopener noreferrer" className="social-link">
          <img src="/images/twitter-icon.png" alt="Twitter" className="social-icon" />
        </a>
        <a
          href="https://www.youtube.com/@ctf-tunisie"
          target="_blank"
          rel="noopener noreferrer"
          className="social-link"
        >
          <img src="/images/youtube-icon.png" alt="YouTube" className="social-icon" />
        </a>
        <a href="http://www.ctf-drilling.com.tn/" target="_blank" rel="noopener noreferrer" className="social-link">
          <img src="/images/website.png" alt="Website" className="social-icon" />
        </a>
      </div>
    </header>
  )
}

export default HeaderTop
