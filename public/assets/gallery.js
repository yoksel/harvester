(function (window) {
  const body = document.body;
  const fullview = document.querySelector('.fullview');
  const fullviewFader = document.querySelector('.fullview__fader');
  const fullviewSizes = document.querySelector('.fullview__img-sizes');
  const fullviewImgSWrapper = document.querySelector('.fullview__imgs-wrapper');
  const fullviewImgsScrollbox = document.querySelector('.fullview__imgs-scrollbox');
  const fullviewImgWrapper = document.querySelector('.fullview__img-wrapper');
  const fullviewImgWrapperCompare = document.querySelector('.fullview__img-wrapper--compare');
  const fullviewImgOrig = document.querySelector('.fullview__img--orig');
  const fullviewImgCompare = document.querySelector('.fullview__img--compare');
  const fullviewControls = document.querySelectorAll('.fullview__control');
  const fullviewLink = document.querySelector('.fullview__link');
  const inputsShowCompare = document.querySelectorAll('.options__input--show-compare');
  const inputsOpacity = document.querySelectorAll('.options__input--opacity');
  let pageScreensLinks = null;
  let currentIndex = null;
  let pageScreensList = [];
  const storageData = getStorageData();

  // ------------------------------

  fullviewFader.addEventListener('click', () => {
    fullview.hidden = true;
    body.classList.remove('page--show-fullview');
  });

  document.addEventListener('keyup', (ev) => {
    if(ev.keyCode === 27) {
      fullview.hidden = true;
    }
  });

  // ------------------------------

  const initGallery = () => {
    pageScreensLinks = document.querySelectorAll('.page-screen__link--img');
    pageScreensList = [];

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
        fullview.hidden = false;
        currentIndex = index;
        setImages();
        body.classList.add('page--show-fullview');
      })
    })
  };

  // ------------------------------

  const setImages = () => {
    const data = pageScreensList[currentIndex];
    if(!data) {
      return;
    }
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

    // Drop height to measure real size
    fullviewImgsScrollbox.style.height = null;

    const scrollBoxHeight = fullviewImgsScrollbox.clientHeight;
    const imgHeight = fullviewImgOrig.clientHeight;

    if(imgHeight < scrollBoxHeight) {
      fullviewImgsScrollbox.style.height = `${imgHeight}px`;
    }
    else {
      fullviewImgsScrollbox.style.height = null;
    }
  };

  // ------------------------------

  const getImageUrls = (elem) => {
    const images = elem.parentNode.querySelectorAll('img, .page-screen__img-placeholder');
    images.reduce = [].reduce;
    let imageUrls = {};

    imageUrls = images.reduce((prev, item) => {
      if(item.classList.contains('page-screen__img--compare')) {
        prev.compare = item.src;
      }
      else {
        prev.orig = item.src || item.dataset.src;
      }
      return prev;
    }, {});


    return imageUrls;
  };

  // ------------------------------

  const getImageSizes = (elem) => {
    const sizesElem = elem.parentNode.querySelector('.page-screen__img-sizes');
    return sizesElem ? sizesElem.innerHTML : '';
  }

  // ------------------------------

  const getPageUrl = (elem) => {
    const linkElem = elem.parentNode.querySelector('.page-screen__link--url');
    return linkElem.href;
  }

  // ------------------------------

  function getStorageData () {
    const storageHarvyData = localStorage.getItem('harvester');
    return storageHarvyData ? JSON.parse(storageHarvyData) : {
      isShowCompare: true,
      opacity: .6
    }
  }

  // ------------------------------

  fullviewControls.forEach(control => {
    control.addEventListener('click', () => {

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

      setImages();
    })
  });

  // ------------------------------

  body.classList.toggle('page--show-compare', storageData.isShowCompare);

  inputsShowCompare.forEach(input => {
    input.checked = storageData.isShowCompare;

    input.addEventListener('click', () => {
      storageData.isShowCompare = !storageData.isShowCompare;

      localStorage.setItem('harvester', JSON.stringify(storageData));
      body.classList.toggle('page--show-compare', storageData.isShowCompare);

      inputsShowCompare.forEach(input => {
        input.checked = storageData.isShowCompare;
      });
    })
  });

  // ------------------------------

  body.dataset['compareOpacity'] = storageData.opacity;


  inputsOpacity.forEach(input => {
    input.value = storageData.opacity;

    input.addEventListener('change', () => {
      storageData.opacity = input.value;

      localStorage.setItem('harvester', JSON.stringify(storageData));
      body.dataset['compareOpacity'] = storageData.opacity;

      inputsOpacity.forEach(input => {
        input.value = storageData.opacity;
      });
    })
  })

  // ------------------------------

  window.initGallery = initGallery;

}(window));
