/* eslint-disable react/prop-types */
// components/ui/testimonial-carousel.jsx
import React from 'react';

const TestimonialCarousel = ({ 
  data,  
  className,
  imageClassName = "",
  imageWrapperClassName = "",
  imageContainerClassName = ""
}) => {
  // Your existing carousel logic here...
  
  return (
    <div className={className}>
      {/* Your carousel structure */}
      {data.map((item, index) => (
        <div key={index} className="testimonial-card">
          <div className={imageContainerClassName}>
            <div className={imageWrapperClassName}>
              <img 
                src={item.image} 
                alt={item.name}
                className={imageClassName}
              />
              {/* Neon line element */}
              <div className="neon-line"></div>
            </div>
          </div>
          {/* Rest of your testimonial content */}
          <p>{item.description}</p>
          <h4>{item.name}</h4>
          <span>{item.handle}</span>
        </div>
      ))}
    </div>
  );
};

export default TestimonialCarousel;