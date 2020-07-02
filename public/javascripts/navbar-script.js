// Nav Bar Elements
const navSlide = () => {
  // Getting the elements with DOM
  const burger = document.querySelector('.burger');
  const nav = document.querySelector('.nav-links');
  const navLinks = document.querySelectorAll('.nav-links li');
  // Burger menu logic
  burger.addEventListener('click', () => {
    // Toggle the animation style to animate the side menu
    const toggleLinkAnimation = (link, index) => {
      const hasAnimation = link.style.animation
      const animation = `navLinkFade 0.5s ease forwards ${index / 5 + 0.3}s`
      link.style.animation = hasAnimation ? "" : animation
    }
    navLinks.forEach(toggleLinkAnimation)
    // Toggle the class "active" to make the side menu appear/disapear
    nav.classList.toggle('nav-active');
    const main = document.querySelector('main')
    nav.style.display = 'flex';
    main.classList.toggle('main-transition');
  });
}

navSlide();