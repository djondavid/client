import React, { useState, useEffect } from "react";
import styles from "./img-gallery.module.scss";
function ImageGallery(props) {
  console.log("props: ", props);

  // GLOBAL CONSTANTS
  const CHUNK = 25;

  // STATE VARIABLES
  const [pages, setPages] = useState([]);
  const [currPage, setCurrPage] = useState(0); // zero indexed
  const [numPages, setNumPages] = useState(0);

  useEffect(() => {
    // chunk out the results into managable pages
    const tempPages = [];
    for (let i=0; i < props.imageData.length; i++) {
      tempPages.push(props.imageData.splice(i, i + CHUNK));
    }
    //console.log(tempPages)
    setPages([ ...tempPages ]);
    setNumPages(tempPages.length);
    setCurrPage(0);
  }, []); // on component did mount

  // Gallery Nav Handlers
  function prev() {
    //console.log("prev")
    setCurrPage((prevPage) => { 
      // wrap from page 0 to last page if needed
      return prevPage > 0 ? prevPage - 1 : numPages - 1; 
    });
  }  
  function next() {
    //console.log("next")
    setCurrPage((prevPage) => { 
      // wrap from last page to page 0 if needed
      return prevPage < numPages - 1 ? prevPage + 1 : 0; 
    });
  }

  return (
    <div className={styles.gallery}>
      <div className="text-center">
        <h3>{props.title}</h3>
        {numPages > 1 && 
          <>
            <button className="btn btn-primary mr-1" onClick={prev}>Prev</button>
            <span className="d-inline-block mx-3 my-auto">
              Page {currPage +1} of {numPages}
            </span>
            <button className="btn btn-primary ml-1" onClick={next}>Next</button>
          </>
        }
      </div>
      <div className="row">
        {pages.length > 0 && pages[currPage].map((image) => {
          const date = new Date(image.earth_date);
          const title = `${image.rover.name} - ${
            image.camera.full_name
          } - ${date.toDateString()}`;
          return (
            <div className="col-md-6 col-lg-4 col-xl-3" key={image.id}>
              <div className="card text-black w-100">
                <img
                  className="card-img-top"
                  id={`image-${image.id}`}
                  src={image.img_src}
                  title={title}
                  alt={title}
                />
                <div className="card-body">
                  <h5 className="card-title">{image.rover.name} - {image.camera.name}</h5>
                  <h6 className="card-subtitle mb-2 text-muted">{date.toDateString()}</h6>
                  <a href={image.img_src} className="stretched-link"><span className="visually-hidden">View full Resolution</span></a>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <p className="text-center">
        <a href="/#top">Back to Top</a>
      </p>
    </div>
  );
}
export default ImageGallery;

ImageGallery.defaultProps = {
  title: "Image Gallery",
  imageData: {
    photos: []
  }
}