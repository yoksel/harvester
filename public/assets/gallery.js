(function (window) {
  const fullview = document.querySelector('.fullview');
  const fullviewFader = document.querySelector('.fullview__fader');
  const fullviewSizes = document.querySelector('.fullview__img-sizes');
  const fullviewImgOrig = document.querySelector('.fullview__img--orig');
  const fullviewImgCompare = document.querySelector('.fullview__img--compare');
  const fullviewControls = document.querySelectorAll('.fullview__control');
  const fullviewLink = document.querySelector('.fullview__link');
  let pageScreensLinks = null;
  let currentIndex = null;
  let pageScreensList = [];

  // ------------------------------

  fullviewFader.addEventListener('click', () => {
    fullview.hidden = true;
  });

  document.addEventListener('keyup',(ev) => {
    if(ev.keyCode === 27) {
      fullview.hidden = true;
    }
  })

  // ------------------------------

  const initGallery = () => {
    pageScreensLinks = document.querySelectorAll('.page-screen__link--img');

    pageScreensLinks.forEach((item, index) => {
      const urls = getImageUrls(item);
      const sizes = getImageSizes(item);
      const pageUrl = getPageUrl(item);
      const data = {
        urls,
        sizes,
        pageUrl
      };

      pageScreensList.push(data);

      item.addEventListener('click', (ev) => {
        ev.preventDefault();
        currentIndex = index;
        setImages();
      })
    })
  };

  // ------------------------------

  const setImages = () => {
    const data = pageScreensList[currentIndex];
    fullviewSizes.innerHTML = data.sizes;
    fullviewImgOrig.src = data.urls.orig;
    fullviewLink.href = data.pageUrl;

    if(data.urls.compare) {
      fullviewImgCompare.src = data.urls.compare;
      fullviewImgCompare.hidden = false;
    }
    else {
      fullviewImgCompare.hidden = true;
    }

    fullview.hidden = false;
  };

  // ------------------------------

  const getImageUrls = (elem) => {
    const images = elem.parentNode.querySelectorAll('img');
    images.reduce = [].reduce;
    const imageUrls = images.reduce((prev, item) => {
      if(item.classList.contains('page-screen__img--compare')) {
        prev.compare = item.src;
      }
      else {
        prev.orig = item.src;
      }
      return prev;
    }, {});

    return imageUrls;
  };

  // ------------------------------

  const getImageSizes = (elem) => {
    const sizesElem = elem.parentNode.querySelector('.page-screen__img-sizes');
    return sizesElem.innerHTML;
  }

  // ------------------------------

  const getPageUrl = (elem) => {
    const linkElem = elem.parentNode.querySelector('.page-screen__link--url');
    return linkElem.href;
  }

  // ------------------------------

  fullviewControls.forEach(control => {
    control.addEventListener('click', () => {
      console.log(control.dataset.direction);

      if(control.dataset.direction === 'prev'){
        currentIndex -= 1;

        if(currentIndex < 0) {
          currentIndex = pageScreensList.length - 1;
        }
      }
      else {
        currentIndex += 1;

        if(currentIndex > pageScreensList.length - 1) {
          currentIndex = 0;
        }
      }

      console.log(currentIndex);
      setImages();
    })
  });

  window.initGallery = initGallery;

}(window));
