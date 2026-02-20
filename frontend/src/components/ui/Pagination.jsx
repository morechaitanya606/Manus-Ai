const Pagination = ({ page, pages, onChange }) => {
  if (!pages || pages <= 1) return null;

  const pageItems = Array.from({ length: pages }, (_, idx) => idx + 1);

  return (
    <div className="pagination">
      <button type="button" disabled={page <= 1} onClick={() => onChange(page - 1)}>
        Prev
      </button>
      {pageItems.map((item) => (
        <button
          type="button"
          key={item}
          className={item === page ? 'active' : ''}
          onClick={() => onChange(item)}
        >
          {item}
        </button>
      ))}
      <button type="button" disabled={page >= pages} onClick={() => onChange(page + 1)}>
        Next
      </button>
    </div>
  );
};

export default Pagination;
