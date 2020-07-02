console.log('Woof! JS Connected');

window.addEventListener('load', () => {
  const section = document.querySelector('section');
  if(section.classList.contains('user-profile')){
    let tabs = document.querySelectorAll('.user-profile .fake-link');
    let activeTab = tabs[sessionStorage.getItem('activeTab')];
    if(!activeTab){
      activeTab = tabs[0];
    }
    activeTab.classList.add('active');

    tabs.forEach((el, index) => el.addEventListener('click', () => {
      activeTab.classList.remove('active');
      el.classList.add('active');
      sessionStorage.setItem('activeTab', index);
    }));
  }
})

