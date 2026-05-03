import { useEffect, useState } from 'react';
import './Browse.css';

export default function WishCraftTemplateBrowser() {

  const [currentPage, setCurrentPage] = useState(1);

  const [categorySections, setCategorySections] =
    useState([]);

  // LOAD JSON

  useEffect(() => {

    fetch('/templateMap.json')

      .then((response) => response.json())

      .then((data) => {
        setCategorySections(data);
      })

      .catch((error) => {
        console.error(
          'Failed to load template map:',
          error
        );
      });

  }, []);

  // PAGINATION

  const paginatedSections =
    currentPage === 1
      ? categorySections.slice(0, 2)
      : categorySections.slice(2, 4);

  return (
    <>

      {/* HEADER */}

      <div className="browse-header">

        <h1 className="browse-title">
          Search Category wise from 800+
          Images
        </h1>

      </div>

      {/* PAGE */}

      <div className="browse-page">

        <div className="browse-wrapper">

          {paginatedSections.map(
            (section, sectionIndex) => (

              <div
                key={section.title}
                className="category-section"
              >

                {/* TITLE */}

                <h2 className="category-title">
                  {section.title}
                </h2>

                {/* CAROUSEL */}

                <div className="carousel-wrapper">

                  {/* IMAGES */}

                  <div className="scrollmenu">

                {section.images.map((image, index) => {
                  const imageSrc = image.src;
                  const isPremium = image.premium;
                  return (
                  <div className="template-card" key={index}>
                  
                  {/* PREMIUM CROWN */}
                  {isPremium && (
                  <div className="premium-crown">
                  <img src="/images/crown.png" 
                  alt="Premium"
                  />
                  </div>
                )}

                 {/* IMAGE */}

                 <img src={imageSrc} alt="" className="template-image"
                 />

                 {/* OVERLAY */}
                 <div className="overlay">

                 <button className="import-btn" onClick={() => {
                 // PREMIUM IMAGE

                 if (isPremium) {
                 window.location.href ='/premium';
                 return;
                }
               // FREE IMAGE
               localStorage.setItem(
                'selectedTemplate', imageSrc
               );
               window.location.href ='/edit';
              }}
               >
                Import Template
              </button>
             </div>
            </div>
          );
     })}

                  </div>

                </div>

              </div>
            )
          )}

          {/* PAGINATION */}

          <div className="pagination">

            <button
              className={
                currentPage === 1
                  ? 'page-btn active'
                  : 'page-btn'
              }

              onClick={() =>
                setCurrentPage(1)
              }
            >
              1
            </button>

            <button
              className={
                currentPage === 2
                  ? 'page-btn active'
                  : 'page-btn'
              }

              onClick={() =>
                setCurrentPage(2)
              }
            >
              2
            </button>

          </div>

        </div>

      </div>

    </>
  );
}
