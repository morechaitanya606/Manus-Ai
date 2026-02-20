const Footer = () => {
  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div>
          <h4>Atelier Thread</h4>
          <p>Customized fashion for men and women. Built for comfort, crafted for expression.</p>
        </div>
        <div>
          <h5>Collections</h5>
          <p>Men</p>
          <p>Women</p>
          <p>New Arrivals</p>
        </div>
        <div>
          <h5>Support</h5>
          <p>Orders & Returns</p>
          <p>Customization Guide</p>
          <p>Contact</p>
        </div>
      </div>
      <p className="copyright">© {new Date().getFullYear()} Atelier Thread. All rights reserved.</p>
    </footer>
  );
};

export default Footer;
