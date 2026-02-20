import { useEffect, useRef, useState } from 'react';
import { buildImageUrl } from '../../utils/format';

const LazyImage = ({ src, alt, className = '' }) => {
  const [isVisible, setIsVisible] = useState(false);
  const imgRef = useRef(null);

  useEffect(() => {
    const node = imgRef.current;
    if (!node) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '100px' }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={imgRef} className={`lazy-image-wrap ${className}`}>
      {isVisible ? <img src={buildImageUrl(src)} alt={alt} loading="lazy" className="lazy-image" /> : <div className="image-skeleton" />}
    </div>
  );
};

export default LazyImage;
