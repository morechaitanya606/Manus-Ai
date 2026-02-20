import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <section className="section container empty-state">
      <h1>404</h1>
      <p>The page you requested does not exist.</p>
      <Link to="/" className="primary-btn">
        Back to Home
      </Link>
    </section>
  );
};

export default NotFoundPage;
