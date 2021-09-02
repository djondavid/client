import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import MenuBar from "./components/menu-bar/menu-bar";
import ImageGallery from "./components/img-gallery/img-gallery";

import "./styles/app.scss";

function App() {
  // ---------- GLOBAL CONSTANTS ----------
  // API stuff
  const API_BASE_URL = "https://api.nasa.gov/mars-photos/api/v1/rovers";
  const API_KEY = "YQv888J9gVeBN6TPQJqZ78ox127KhPQriWjNbYKa";
  const axiosConfig = {
    headers: {
      Accept: "application/json",
    },
  };
  // Rover naming map
  const ROVERS = {
    curiosity: "Curiosity Rover",
    opportunity: "Opportunity Rover",
    spirit: "Spirit Rover",
  };
  // Rover camera data (from NASA's API)
  const CAMERAS = [
    { abbrev: "ALL", name: "All Cameras", curiosity: true, opportunity: true, spirit: true },
    { abbrev: "FHAZ", name: "Font Hazard Avoidance Camera", curiosity: true, opportunity: true, spirit: true },
    { abbrev: "RHAZ", name: "Rear Hazard Avoidance Camera", curiosity: true, opportunity: true, spirit: true },
    { abbrev: "MAST", name: "Mast Camera", curiosity: true, opportunity: false, spirit: false },
    { abbrev: "CHEMCAM", name: "Chemistry and Camera Complex", curiosity: true, opportunity: false, spirit: false },
    { abbrev: "MAHLI", name: "Mars Hand Lens Imager", curiosity: true, opportunity: false, spirit: false },
    { abbrev: "MARDI", name: "Mars Descent Imager", curiosity: true, opportunity: false, spirit: false },
    { abbrev: "NAVCAM", name: "Navigation Camera", curiosity: true, opportunity: true, spirit: true },
    { abbrev: "PANCAM", name: "Panoramic Camera", curiosity: false, opportunity: true, spirit: true },
    { abbrev: "MINITES", name: "Miniature Thermal Emission Spectrometer (Mini-TES)", curiosity: false, opportunity: true, spirit: true },
  ];
  // Menus
  const menuData = [
    { id: 1, title: "Curiosity Rover", url: "/#" },
    { id: 2, title: "Opportunity Rover", url: "/#" },
    { id: 3, title: "Spirit Rover", url: "/#" },
  ];

  // ---------- STATE VARIABLES ----------
  const [loaded, setLoaded] = useState(false); 
  const [rover, setRover] = useState("curiosity"); // "curiosity", "opportunity", or "spirit"
  const [dateFilter, setDateFilter] = useState("earth"); // "earth" (earthDate) or "mars" (sol)
  const [minEarthDate, setMinEarthDate] = useState(null); // init from Rover Manifest data "min_date"
  const [maxEarthDate, setMaxEarthDate] = useState(null); // init from Rover Manifest data "max_date"
  const [earthDate, setEarthDate] = useState(null); // init from Rover Manifest data "max_date"
  const [maxSol, setMaxSol] = useState(null); // init from Rover Manifest data "max_sol"
  const solRangeRef = useRef(null); // reference to the range input
  const [solRange, setSolRange] = useState(1000); // 0-maxSol (default to 1000);
  const [sol, setSol] = useState(null); // "none" or 0-maxSol;
  const [camera, setCamera] = useState("ALL"); // use CAMERAS.abbrev
  //const [apiPage, setApiPage] = useState(null); // 25 per page (currently handling pagination in the Image Gallery component)
  const [apiImageData, setApiImageData] = useState([]); // array to hold data from Rover Photo API
  const [error, setError] = useState(null); // any API errors

  useEffect(() => {
    getApiManifestData();
  }, [rover]);
  
  useEffect(() => {
    setLoaded(false);
    getApiPhotoData().then(setLoaded(true));
  }, [rover, camera, sol, earthDate]);
  
  // ---------- GET ROVER MANIFEST DATA FROM API ----------
  const getApiManifestData = async () => {
    // NOTE: the "manifest" URL in NASA's API documentation does not work, but this URL does.
    const apiManifestURL = `${API_BASE_URL}/${rover}?api_key=${API_KEY}`;
    
    try {
      //console.log(`calling Rover Manifest API with "${apiManifestURL}"`);
      const response = await axios.get(apiManifestURL, axiosConfig);
      //console.log("axios response: ", response);
      if (response.data.rover) {
        const minEarthDateStr = response.data.rover.landing_date;
        const maxEarthDateStr = response.data.rover.max_date;
        const maxSolValue = response.data.rover.max_sol;
        /* NOTE:
        * Creating a new UTC Date() using a date string "YYYY-MM-DD" without a timestamp is a problem.
        * Your local time *may* be off a few hours resulting in the previous day (depending on your
        * local timezone, and daylight savings).
        * Adding a time of zulu hours "T00:00:00" -OR- reformatting the date using "YYYY/MM/DD"
         * *may* to fix the problem, but using both results in an "invalid date"!?!?!?
         * I am still getting one day off on some dates but not others. So I am going to fix in the formatter.
         */
        setMinEarthDate(formatDateStrToUTC(minEarthDateStr));
        setMaxEarthDate(formatDateStrToUTC(maxEarthDateStr));
        setEarthDate(formatDateStrToUTC(maxEarthDateStr));
        // Ahhh "sol", how I love thee (compared to date)
        setMaxSol(maxSolValue);
        setSol(maxSolValue);
        setSolRange(maxSolValue);

      } else {
        throw new Error("No rover manifest data returned");
      }
    } catch (err) {
      console.error(err);
      setError(err);
    }
  }

  // ---------- GET ROVER PHOTO DATA FROM API ----------
  const getApiPhotoData = async () => {
    // build the query string
    let queryStr = `${API_BASE_URL}/${rover}/photos?api_key=${API_KEY}`;
    if (dateFilter === "earth" && earthDate) {
      const apiEarthDate = formatDateForAPI(earthDate);
      queryStr += `&earth_date=${apiEarthDate}`;
    }
    if (dateFilter === "mars" && sol) queryStr += `&sol=${sol}`;
    if (camera && camera !== "ALL") queryStr += `&camera=${camera}`;
    //if (apiPage) queryStr += `&page=${apiPage}`;

    try {
      //console.log(`calling API with "${queryStr}"`);
      const response = await axios.get(queryStr, axiosConfig);
      //console.log("axios response: ", response);
      if (response.data?.photos) {
        console.log("setting photos: ", response.data.photos);
        setApiImageData(response.data.photos);
      } else {
        throw new Error("No rover photo data returned");
      }
    } catch (err) {
      console.error(err);
      setError(err);
    }
  }

  // ---------- STATE CHANGE HANDLERS ----------

  // Rover
  function handleRoverChange(roverStr) {
    //console.log("handleRoverChange: ", roverStr);
    for (const key in ROVERS) {
      if (ROVERS[key] === roverStr) {
        //console.log("setting rover to: ", key);
        setRover(key);
      }
    }
  }

  // Camera
  function handleCameraChange(e) {
    setCamera(e.target.value);
  }

  // Date Select
  const handleDateFilterChange = (e) => {
    const dateFilterStr = e.target.value.toString();
    setDateFilter(dateFilterStr);
    if (dateFilterStr === "mars") {
      setEarthDate(null);
      setSol(maxSol);
    } else {
      // dateFilterStr === "earth"
      setSol(null);
      //console.log("maxEarthDate: "+ maxEarthDate);
      setEarthDate(formatDateForAPI(maxEarthDate));
    }
  };

  // Sol
  function handleSolRangeChange() {
    //console.log("solRange: ", solRangeRef.current);
    setSolRange(solRangeRef.current.value);
  }
  function handleSolRangeApplyChange() {
    //console.log("solRange: ", solRangeRef.current);
    setSol(solRangeRef.current.value);
  }

  // ---------- HELPER FUNCTIONS ----------

  // converts date string "YYYY-MM-DD" to a proper UTC date that for use by the Datepicker
  function formatDateStrToUTC(dateStr) {
    const date = new Date(dateStr);
    const utcDate = new Date(
      date.getTime() + Math.abs(date.getTimezoneOffset() * 60000)
    );
    //console.log(`dateStr "${dateStr}" --> utcDate: "${utcDate}"`);
    return utcDate;
  }

  // converts dates to the date string "YYYY-MM-DD" for NASA's API
  function formatDateForAPI(date) {
    const utcDate = new Date(date);
    const apiDate = utcDate.toISOString().substring(0, 10);
    //console.log(`date "${date}" --> utcDate: "${utcDate}" --> apiDate "${apiDate}"`);
    return apiDate;
  }

  // ---------- RENDER MAIN MARKUP ----------
  return (
    <>
      <MenuBar menus={menuData} handleClick={handleRoverChange} />
      <div className="container" id="top">
        {/* PAGE HEADING */}
        <h1 className="text-center text-info">
          NASA's Mars Rover Photo Gallery
        </h1>

        <div className="visually-hidden">
          <h3>TODOs:</h3>
          <ul>
            <li>Server Side API</li>
            <li>Pagination?</li>
            <li>Slide Show???</li>
            <li>Reflections</li>
          </ul>
        </div>

        <div className="row">
          {/* CAMERA FILTER */}
          <div className="col-md-6 col-lg-4">
            <div className="form-group mb-3">
              <label htmlFor="camera-select">Filter by Camera</label>
              <select
                id="camera-select"
                className="form-control"
                onChange={handleCameraChange}
                value={camera}
              >
                {CAMERAS.map((item, index) => {
                  return item[rover] ? (
                    <option key={`camera-${index}`} value={item.abbrev}>
                      {item.name} ({item.abbrev})
                    </option>
                  ) : (
                    <></>
                  );
                })}
              </select>
            </div>
          </div>
          {/* FILTER BY EARTH OR MARS DATE */}
          <div className="col-md-6 col-lg-4">
            <div className="form-group mb-3">
              <label htmlFor="date-filter-select">
                Select Date Filter Type
              </label>
              <select
                id="date-filter-select"
                className="form-control"
                onChange={handleDateFilterChange}
                value={dateFilter}
              >
                <option value="earth">By Earth Date</option>
                <option value="mars">By Mars Solar Date</option>
              </select>
            </div>
          </div>
          {/* MARS SOLAR DAYS FILTER */}
          {dateFilter === "mars" && (
            <div className="col-md-6 col-lg-4">
              <div className="form-group">
                <label htmlFor="sol-range" className="">
                  Filter by Mars Solar Days
                </label>
                <input
                  type="range"
                  id="sol-range"
                  className="mx-2"
                  ref={solRangeRef}
                  value={solRange}
                  min={0}
                  max={maxSol}
                  step={30}
                  onChange={handleSolRangeChange}
                />
              </div>
              <div className="form-group mb-3">
                <button
                  className="btn btn-secondary py-1"
                  onClick={handleSolRangeApplyChange}
                >
                  Apply Filter
                </button>
                <input type="text" value={solRange} className="mx-2" readOnly />
              </div>
            </div>
          )}
          {/* EARTH DATE FILTER */}
          {dateFilter === "earth" && (
            <div className="col-md-6 col-lg-4">
              <div className="form-group mb-3">
                <label htmlFor="earth-date-select">Filter by Earth Date</label>
                <div style={{ position: "relative", zIndex: "100" }}>
                  <DatePicker
                    minDate={new Date(minEarthDate)}
                    maxDate={new Date(maxEarthDate)}
                    selected={new Date(earthDate)}
                    onChange={(date) => {
                      //console.log(`datepicker setting earthDate to "${date}"`)
                      setEarthDate(date);
                    }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
        {/* IMAGE GALLERY */}
        {loaded &&
          <> 
            {apiImageData?.length > 0 ? (
              <ImageGallery
                title={`Photos from ${ROVERS[rover]}`}
                imageData={apiImageData}
              />
            ) : (
              <div className="alert alert-warning">
                <strong>No Images Found!</strong> Try using a different filter.
              </div>
            )}
          </>
        }
        {/* ERRORS */}
        {error && (
          <div className="alert alert-warning">
            <p>
              <strong>Oops!</strong> Something went wrong. Please try again.
            </p>
            <code>{error}</code>
          </div>
        )}
      </div>
    </>
  );
}

export default App;
