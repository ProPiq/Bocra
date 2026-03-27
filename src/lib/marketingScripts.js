const scriptUrls = [
  "/vendor/jquery/jquery.min.js",
  "/vendor/jquery/jquery-migrate.min.js",
  "/vendor/bootstrap/js/bootstrap.bundle.min.js",
  "/vendor/easing/easing.min.js",
  "/vendor/superfish/hoverIntent.js",
  "/vendor/superfish/superfish.min.js",
  "/vendor/waypoints/waypoints.min.js",
  "/vendor/touchSwipe/jquery.touchSwipe.min.js",
  "/vendor/counterup/counterup.min.js",
  "/vendor/owlcarousel/owl.carousel.min.js",
  "/vendor/isotope/isotope.pkgd.min.js",
  "/vendor/lightbox/js/lightbox.min.js",
];

let loadPromise;

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[data-src="${src}"]`);
    if (existing) {
      if (existing.dataset.loaded === "true") {
        resolve();
        return;
      }

      existing.addEventListener("load", resolve, { once: true });
      existing.addEventListener("error", reject, { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = src;
    script.dataset.src = src;
    script.onload = () => {
      script.dataset.loaded = "true";
      resolve();
    };
    script.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.body.appendChild(script);
  });
}

export function ensureMarketingScripts() {
  if (!loadPromise) {
    loadPromise = scriptUrls.reduce(
      (promise, url) => promise.then(() => loadScript(url)),
      Promise.resolve(),
    );
  }

  return loadPromise;
}

export function initMarketingPage() {
  const { jQuery } = window;
  if (!jQuery) {
    return;
  }

  const $ = jQuery;

  $("#mobile-nav, #mobile-nav-toggle, #mobile-body-overly").remove();

  if ($(".nav-menu").length && $.fn.superfish) {
    $(".nav-menu").superfish({
      animation: {
        opacity: "show",
      },
      speed: 400,
    });
  }

  if ($("#nav-menu-container").length) {
    const $mobileNav = $("#nav-menu-container").clone().prop({
      id: "mobile-nav",
    });
    $mobileNav.find("> ul").attr({
      class: "",
      id: "",
    });

    $("body").append($mobileNav);
    $("body").prepend(
      '<button type="button" id="mobile-nav-toggle"><i class="ion-md-menu"></i></button>',
    );
    $("body").append('<div id="mobile-body-overly"></div>');
    $("#mobile-nav")
      .find(".menu-has-children")
      .prepend('<i class="ion-md-arrow-dropdown"></i>');

    $(document)
      .off("click.marketing-nav", ".menu-has-children i")
      .on("click.marketing-nav", ".menu-has-children i", function onMenuClick() {
        $(this).next().toggleClass("menu-item-active");
        $(this).nextAll("ul").eq(0).slideToggle();
        $(this).toggleClass("ion-md-arrow-dropup ion-md-arrow-dropdown");
      });

    $(document)
      .off("click.marketing-toggle", "#mobile-nav-toggle")
      .on("click.marketing-toggle", "#mobile-nav-toggle", () => {
        $("body").toggleClass("mobile-nav-active");
        $("#mobile-nav-toggle i").toggleClass("ion-md-close ion-md-menu");
        $("#mobile-body-overly").toggle();
      });

    $(document)
      .off("click.marketing-outside")
      .on("click.marketing-outside", (event) => {
        const container = $("#mobile-nav, #mobile-nav-toggle");
        if (
          !container.is(event.target) &&
          container.has(event.target).length === 0 &&
          $("body").hasClass("mobile-nav-active")
        ) {
          $("body").removeClass("mobile-nav-active");
          $("#mobile-nav-toggle i").toggleClass("ion-md-close ion-md-menu");
          $("#mobile-body-overly").fadeOut();
        }
      });
  }

  const updateHeader = () => {
    if ($(window).scrollTop() > 100) {
      $(".header").addClass("header-scrolled");
    } else {
      $(".header").removeClass("header-scrolled");
    }

    if ($(window).scrollTop() > 100) {
      $(".back-to-top").fadeIn("slow");
    } else {
      $(".back-to-top").fadeOut("slow");
    }
  };

  $(window).off("scroll.marketing").on("scroll.marketing", updateHeader);
  updateHeader();

  const carousel = $(".carousel");
  const carouselIndicators = $(".carousel-indicators");

  if (carousel.length && carouselIndicators.length) {
    carouselIndicators.empty();
    carousel
      .find(".carousel-inner")
      .children(".carousel-item")
      .each(function renderIndicator(index) {
        carouselIndicators.append(
          `<li data-target="#carousel" data-slide-to="${index}"${
            index === 0 ? ' class="active"' : ""
          }></li>`,
        );

        $(this).css(
          "background-image",
          `url('${$(this)
            .children(".carousel-background")
            .children("img")
            .attr("src")}')`,
        );
        $(this).children(".carousel-background").remove();
      });
  }

  if ($.fn.swipe) {
    carousel.swipe({
      swipe(event, direction) {
        if (direction === "left") {
          $(this).carousel("next");
        }

        if (direction === "right") {
          $(this).carousel("prev");
        }
      },
      allowPageScroll: "vertical",
    });
  }

  if ($.fn.waypoint) {
    $(".skills").waypoint(
      () => {
        $(".progress .progress-bar").each(function setBarWidth() {
          $(this).css("width", `${$(this).attr("aria-valuenow")}%`);
        });
      },
      { offset: "80%" },
    );
  }

  if ($.fn.counterUp) {
    $('[data-toggle="counter-up"]').counterUp({
      delay: 10,
      time: 1000,
    });
  }

  const portfolioContainer = $(".portfolio-container");
  if (portfolioContainer.length && $.fn.isotope) {
    const portfolioIsotope = portfolioContainer.isotope({
      itemSelector: ".portfolio-item",
      layoutMode: "fitRows",
    });

    $("#portfolio-flters li")
      .off("click.marketing-filter")
      .on("click.marketing-filter", function onFilterClick() {
        $("#portfolio-flters li").removeClass("filter-active");
        $(this).addClass("filter-active");
        portfolioIsotope.isotope({ filter: $(this).data("filter") });
      });
  }

  if ($.fn.owlCarousel) {
    $(".clients-carousel").owlCarousel({
      autoplay: true,
      dots: true,
      loop: true,
      responsive: {
        0: { items: 2 },
        768: { items: 4 },
        900: { items: 6 },
      },
    });

    $(".testimonials-carousel").owlCarousel({
      autoplay: true,
      dots: true,
      loop: true,
      items: 1,
    });
  }

  $(".back-to-top")
    .off("click.marketing-backtotop")
    .on("click.marketing-backtotop", (event) => {
      event.preventDefault();
      $("html, body").animate({ scrollTop: 0 }, 1500, "easeInOutExpo");
    });
}
