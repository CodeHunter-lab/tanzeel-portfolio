
/* ==========================================
   TANZEEL / LAB — INTERACTION ENGINE
   ========================================== */

"use strict";

document.addEventListener("DOMContentLoaded", () => {
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) =>
    Array.from(root.querySelectorAll(selector));

  /* HEADER */

  const header = $(".site-header");

  function updateHeader() {
    if (header) {
      header.classList.toggle("scrolled", window.scrollY > 20);
    }
  }

  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });

  /* MOBILE NAVIGATION */

  const menuToggle = $("#menu-toggle");
  const navigation = $("#primary-navigation");

  function closeMenu() {
    if (!menuToggle || !navigation) return;

    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Open navigation");
    navigation.classList.remove("is-open");
    document.body.classList.remove("menu-open");
  }

  if (menuToggle && navigation) {
    menuToggle.addEventListener("click", () => {
      const isOpen = menuToggle.getAttribute("aria-expanded") === "true";

      menuToggle.setAttribute("aria-expanded", String(!isOpen));
      menuToggle.setAttribute(
        "aria-label",
        isOpen ? "Open navigation" : "Close navigation"
      );

      navigation.classList.toggle("is-open", !isOpen);
      document.body.classList.toggle("menu-open", !isOpen);
    });

    $$("a", navigation).forEach((link) => {
      link.addEventListener("click", closeMenu);
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeMenu();
    });

    document.addEventListener("click", (event) => {
      if (
        navigation.classList.contains("is-open") &&
        !navigation.contains(event.target) &&
        !menuToggle.contains(event.target)
      ) {
        closeMenu();
      }
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth > 700) closeMenu();
    });
  }

  /* SCROLL REVEALS */

  const revealElements = $$("[data-reveal]");
  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  if ("IntersectionObserver" in window && !reducedMotion) {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.12,
        rootMargin: "0px 0px -35px 0px"
      }
    );

    revealElements.forEach((element) => {
      revealObserver.observe(element);
    });
  } else {
    revealElements.forEach((element) => {
      element.classList.add("is-visible");
    });
  }

  /* PROJECT FILTERS */

  const filterButtons = $$(".filter-button");
  const projectCards = $$(".project-card");
  const projectCount = $("#project-count");

  function updateProjectCount(visibleCount) {
    if (!projectCount) return;

    projectCount.textContent =
      String(visibleCount).padStart(2, "0") +
      (visibleCount === 1 ? " PROJECT" : " PROJECTS");
  }

  function filterProjects(category) {
    let visibleCount = 0;

    projectCards.forEach((card) => {
      const categories = (card.dataset.category || "").split(/\s+/);
      const show =
        category === "all" || categories.includes(category);

      card.classList.toggle("is-filtered-out", !show);
      card.setAttribute("aria-hidden", String(!show));

      if (show) visibleCount++;
    });

    filterButtons.forEach((button) => {
      const active = button.dataset.filter === category;

      button.classList.toggle("active", active);
      button.setAttribute("aria-pressed", String(active));
    });

    updateProjectCount(visibleCount);
  }

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      filterProjects(button.dataset.filter || "all");
    });
  });

  filterProjects("all");

  /* EXPANDABLE PROJECT DETAILS */

  $$(".project-details-toggle").forEach((button) => {
    const card = button.closest(".project-body");
    const details = card ? $(".project-details", card) : null;

    if (!details) return;

    button.addEventListener("click", () => {
      const currentlyExpanded =
        button.getAttribute("aria-expanded") === "true";

      button.setAttribute("aria-expanded", String(!currentlyExpanded));
      details.hidden = currentlyExpanded;

      const label = button.childNodes[0];

      if (label && label.nodeType === Node.TEXT_NODE) {
        label.textContent = currentlyExpanded
          ? "More details "
          : "Less details ";
      }

      const icon = $("span", button);
      if (icon) icon.textContent = currentlyExpanded ? "+" : "−";
    });
  });

  /* IMAGE LIGHTBOX */

  const lightbox = $("#lightbox");
  const lightboxImage = $("#lightbox-image");
  const lightboxCaption = $("#lightbox-caption");
  const lightboxClose = $("#lightbox-close");
  const lightboxBackdrop = $("#lightbox-backdrop");

  let previousFocus = null;

  function openLightbox(image) {
    if (!lightbox || !lightboxImage) return;
    if (!image.complete || !image.naturalWidth) return;

    previousFocus = document.activeElement;

    lightboxImage.src = image.currentSrc || image.src;
    lightboxImage.alt = image.alt || "Portfolio image preview";

    if (lightboxCaption) {
      lightboxCaption.textContent =
        image.alt || "Portfolio image";
    }

    lightbox.hidden = false;
    lightbox.setAttribute("aria-hidden", "false");
    document.body.classList.add("lightbox-open");

    if (lightboxClose) lightboxClose.focus();
  }

  function closeLightbox() {
    if (!lightbox || lightbox.hidden) return;

    lightbox.hidden = true;
    lightbox.setAttribute("aria-hidden", "true");
    document.body.classList.remove("lightbox-open");

    if (lightboxImage) lightboxImage.removeAttribute("src");

    if (previousFocus && typeof previousFocus.focus === "function") {
      previousFocus.focus();
    }
  }

  $$("img[data-lightbox]").forEach((image) => {
    image.addEventListener("click", () => openLightbox(image));

    image.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openLightbox(image);
      }
    });

    image.setAttribute("tabindex", "0");
    image.setAttribute("role", "button");
    image.setAttribute(
      "aria-label",
      "Open image: " + (image.alt || "Portfolio screenshot")
    );
  });

  $$(".gallery-image").forEach((button) => {
    button.addEventListener("click", () => {
      const image = $("img", button);
      if (image) openLightbox(image);
    });
  });

  if (lightboxClose) {
    lightboxClose.addEventListener("click", closeLightbox);
  }

  if (lightboxBackdrop) {
    lightboxBackdrop.addEventListener("click", closeLightbox);
  }

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeLightbox();

    if (
      event.key === "Tab" &&
      lightbox &&
      !lightbox.hidden
    ) {
      const focusable = $$(
        "button:not([disabled])",
        lightbox
      );

      if (!focusable.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (
        !event.shiftKey &&
        document.activeElement === last
      ) {
        event.preventDefault();
        first.focus();
      }
    }
  });

  /* LIVE PAKISTAN CLOCK */

  const liveClock = $("#live-clock");
  const liveDate = $("#live-date");

  function updateClock() {
    const now = new Date();

    if (liveClock) {
      liveClock.textContent = new Intl.DateTimeFormat("en-GB", {
        timeZone: "Asia/Karachi",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false
      }).format(now);

      liveClock.dateTime = now.toISOString();
    }

    if (liveDate) {
      liveDate.textContent = new Intl.DateTimeFormat("en-GB", {
        timeZone: "Asia/Karachi",
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric"
      }).format(now);
    }
  }

  updateClock();
  window.setInterval(updateClock, 1000);

  /* COPY EMAIL */

  const copyEmailButton = $("#copy-email");
  const copyFeedback = $("#copy-feedback");

  if (copyEmailButton) {
    copyEmailButton.addEventListener("click", async () => {
      const email = copyEmailButton.dataset.email;
      if (!email) return;

      try {
        if (!navigator.clipboard || !window.isSecureContext) {
          throw new Error("Clipboard API unavailable");
        }

        await navigator.clipboard.writeText(email);

        if (copyFeedback) {
          copyFeedback.textContent = "Email copied to clipboard.";
        }

        copyEmailButton.innerHTML = "Copied! <span>✓</span>";
      } catch {
        if (copyFeedback) {
          copyFeedback.textContent =
            "Copy unavailable. Email me at " + email;
        }
      }

      window.setTimeout(() => {
        copyEmailButton.innerHTML = "Copy email <span>▣</span>";
      }, 2200);
    });
  }

  /* CURRENT YEAR */

  const currentYear = $("#current-year");

  if (currentYear) {
    currentYear.textContent = String(new Date().getFullYear());
  }

  /* PREVENT DEAD IMAGE LINKS FROM FAILING SILENTLY */

  $$("img").forEach((image) => {
    image.addEventListener("error", () => {
      image.classList.add("image-unavailable");
      image.setAttribute("data-image-error", "true");
    });
  });
});
