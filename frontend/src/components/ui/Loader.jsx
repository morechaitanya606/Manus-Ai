const Loader = ({ label = 'Loading...' }) => {
  return (
    <div className="loader-wrap">
      <span className="spinner" />
      <p>{label}</p>
    </div>
  );
};

export default Loader;
