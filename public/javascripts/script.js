document.addEventListener('DOMContentLoaded', () => {

  console.log('IronGenerator JS imported successfully!');

}, false);


let tabs = document.querySelectorAll('.user-profile .fake-link');
let activeTab = tabs[localStorage.getItem('activeTab')];
activeTab.classList.add('active');

tabs.forEach((el, index) => el.addEventListener('click', () => {
  activeTab.classList.remove('active');
  el.classList.add('active');
  localStorage.setItem('activeTab', index);
}));