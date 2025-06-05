// filepath: c:\Users\zackweb\Desktop\Dailly\src\renderer\src\components\CategoryDisplay.jsx
import React, { useState, useRef, useEffect } from "react";
import { ModernTag } from "./EnhancedCardEffects";

/**
 * Smart category display component that shows limited categories with "+n more" indicator
 * and reveals all categories on hover over the counter only
 */
const CategoryDisplay = ({ categories, maxVisible = 2 }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const counterRef = useRef(null);
  
  // Handle mouseenter/mouseleave events
  const handleMouseEnter = () => {
    setShowTooltip(true);
  };
  
  const handleMouseLeave = () => {
    setShowTooltip(false);
  };
  
  // If no categories or just a few, display them directly
  if (!categories || categories.length <= maxVisible) {
    return (
      <div className="entry-categories">
        {categories && categories.map((cat) => (
          <ModernTag key={cat}>{cat}</ModernTag>
        ))}
      </div>
    );
  }

  // For more categories, show limited number + counter
  const visibleCategories = categories.slice(0, maxVisible);
  const remainingCount = categories.length - maxVisible;
  const hiddenCategories = categories.slice(maxVisible);

  return (
    <div className="entry-categories category-overflow">
      {visibleCategories.map((cat) => (
        <ModernTag key={cat}>{cat}</ModernTag>
      ))}
      
      <div 
        className="counter-container"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <span 
          ref={counterRef}
          className="categories-counter"
          title={`${remainingCount} more ${remainingCount === 1 ? "category" : "categories"}`}
        >
          +{remainingCount}
        </span>
        
        {showTooltip && (
          <div className="categories-tooltip">
            {hiddenCategories.map((cat) => (
              <ModernTag key={cat}>{cat}</ModernTag>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryDisplay;
