/* ==========================================
   GENTLE WARRIOR DEALS
   SCRIPT.JS
========================================== */

// ==========================================
// BACK TO TOP BUTTON
// ==========================================

const backToTop = document.getElementById("backToTop");

window.addEventListener("scroll", () => {

    if (window.scrollY > 300) {

        backToTop.style.opacity = "1";
        backToTop.style.visibility = "visible";

    } else {

        backToTop.style.opacity = "0";
        backToTop.style.visibility = "hidden";

    }

});

backToTop.addEventListener("click", () => {

    window.scrollTo({

        top: 0,
        behavior: "smooth"

    });

});

// Hide button on page load
backToTop.style.opacity = "0";
backToTop.style.visibility = "hidden";


// ==========================================
// SMOOTH SCROLL FOR INTERNAL LINKS
// ==========================================

document.querySelectorAll('a[href^="#"]').forEach(anchor => {

    anchor.addEventListener("click", function (e) {

        e.preventDefault();

        const target = document.querySelector(this.getAttribute("href"));

        if (target) {

            target.scrollIntoView({

                behavior: "smooth"

            });

        }

    });

});


// ==========================================
// SIMPLE FADE-IN ANIMATION
// ==========================================

const cards = document.querySelectorAll(".brand-card");

const observer = new IntersectionObserver((entries) => {

    entries.forEach(entry => {

        if (entry.isIntersecting) {

            entry.target.style.opacity = "1";
            entry.target.style.transform = "translateY(0)";

        }

    });

}, {
    threshold: 0.15
});

cards.forEach(card => {

    card.style.opacity = "0";
    card.style.transform = "translateY(30px)";
    card.style.transition = "all .6s ease";

    observer.observe(card);

});


// ==========================================
// BUTTON CLICK EFFECT
// ==========================================

document.querySelectorAll(".visit-btn").forEach(button => {

    button.addEventListener("click", function () {

        this.style.transform = "scale(.96)";

        setTimeout(() => {

            this.style.transform = "";

        }, 120);

    });

});


// ==========================================
// CURRENT YEAR (Future use)
// ==========================================

const year = new Date().getFullYear();

document.querySelectorAll(".currentYear").forEach(el => {

    el.textContent = year;

});


// ==========================================
// PAGE LOADED
// ==========================================

window.addEventListener("load", () => {

    document.body.classList.add("loaded");

    console.log("Gentle Warrior Deals loaded successfully.");

});
