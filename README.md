# Full Stack Project - NASA's Rover Image Gallery

Author: **David Schmidt**
Date: **2021-09-02**

## Getting Started
You will need Node >= 10.16 and npm >= 5.6 installed on your machine.
From the root of the project directory in the command line:
`npm install` to download install the necessary node modules
`npm start` to run the project

## Frameworks Used

* Front End: React
* Back End: Node (not implemented as it seemed unnecessary save for protecting the API key)
* Styles: Bootstrap 4

## What I Liked About this Project

* Very flexible, chance to be creative
* Not too difficult, didn't take forever
* Real world application and using API calls
## What Would I Do If I Had More Time

* Modal Carousel of selected photo
* Move NASA API calls to Node server side to protect API KEY in secret .env file and create server side end points for the front end to hit to mirror the API functionality.
* Get the Camera data dynamically from the Rover Manifest data rather than hard coding it from the API documentation.
* Make the Camera filter smarter, check the data first to get the number of images on each camera and display that are in the camera filter drop down (remove any cameras with 0 images)
* Use Bootstrap navbar or make my menubar have a mobile menu (overflows on phones)
* Fix the filters async load and filter issues; only call the API when all the filters have been set.
## What I Didn't Like About This Project

* Naming convention "images" or "photos"?
* Dates, dates, and more dates. (Everyone hates dealing with dates, don't they?)
* Confusion about the filter by date in the instructions. There are earth dates and mars solor dates, can only really filter by one.
* Confusion about the "timestamp" and "other metadata" in the instructions. There is no "timestamp" in the API photo data, only earth date (without time). What other "metadata" would be useful to an end user besides the rover, camera, and date?
* I wish there were source urls for thumbnail or smaller sized images in the API photo data so we could display thumbs at lower payload rather than very large image source files. Also wish there were file dimmension sizes available, and/or aspect ratio in the photo data so one could properly layout different sized/ratio images.
