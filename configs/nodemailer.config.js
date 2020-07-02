const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_ACCOUNT,
    pass: process.env.GMAIL_PASSWORD
  },
  tls: {
    rejectUnauthorized: false
  }
})

const deleteMail = (user) => {
  return contentHTML = `<div style="background: #4D716D; height: 100px; background-size: cover;
  background-repeat: no-repeat; text-align: center; padding: 35px; font-size:1.5em; color:#cce0dd;">
  <h1>We are sorry to see yo go <strong>${user}</strong></h1>
</div>
<section
  style="padding: 20px; margin: 50px; border: 2px solid #4D716D; border-radius:40px; text-align: center;">
  <h2>ACCOUNT CANCELLATION</h2>
  <p>This is a confirmation that your <strong>Rehome Me</strong> account has been cancelled.<br>
    We are sorry to see you go, and if there is anything that you didn't like of our service, please let us now so
    that
    we can improve it.
  </p>
  <div>
    <img
      src="https://s3.amazonaws.com/cdn-origin-etr.akc.org/wp-content/uploads/2019/07/15092404/do-dogs-grieve-other-dogs.jpg"
      alt="sad-dog">
  </div>
  <p><b>If you want to use our services again, we'll be at <a href="http://rehome-me.herokuapp.com/">Rehome Me</a>
      for
      you!
      :)</b</p> </section>`
}

const adoptionPetition = (animal, owner, host) => {
  return contentHTML = `<div style="background: #4D716D; height: 100px; background-size: cover;
  background-repeat: no-repeat; text-align: center; padding: 35px; font-size:1.3em; color:#cce0dd;">
  <h1>Someone is interested in <strong> ${animal}, ${owner}!</strong></h1>
</div>
<section style="padding: 20px; margin: 50px; border: 2px solid #4D716D; border-radius:40px; text-align: center;">
  <h2>ADOPTION PETITION</h2>
  <p>The user ${host} in the <strong>Rehome Me</strong> webpage is interested in rehoming
    ${animal} and being it's forever home!
  </p>
  <p>Please, log in at <a href="http://rehome-me.herokuapp.com/">Rehome Me</a> as soon as you can to accept or reject
    this petition.</p>
  <div>
    <img src="https://d17fnq9dkz9hgj.cloudfront.net/uploads/2015/09/hfh-dog-hero.jpg" alt="dog-adoption">
  </div>
</section>`
}

const sitterPetition = (host, owner, checkin, checkout) => {
  return contentHTML = `<div style="background: #4D716D; height: 100px; background-size: cover;
  background-repeat: no-repeat; text-align: center; padding: 35px; font-size:1.5em; color:#cce0dd;">
  <h1>Someone is interested in your sitting service <strong>${host}</strong></h1>
</div>
<section style="padding: 20px; margin: 50px; border: 2px solid #4D716D; border-radius:40px; text-align: center;">
  <h2>SITTING PETITION</h2>
  <p>The user ${owner} in the <strong>Rehome Me</strong> webpage is interested in your services as a
    sitter!<br>
    The pet's check-in date would be <strong>${checkin}</strong> and it will be returning to it's owner the
    <strong>${checkout}</strong> as soon as you can to accept or reject this petition.
  </p>
  <p>Please, log in at <a href="http://rehome-me.herokuapp.com/">Rehome Me</a></p>
  <div>
    <img src="https://www.veterinarypracticenews.com/wp-content/uploads/2018/06/Pet-Sitter.jpg" alt="dog-sitter">
  </div>
</section>`
}

const processClosed = (animal, status, ownerN, ownerE, hostN, hostE) => {
  return contentHTML = `<div style="background: #4D716D; height: 100px; background-size: cover;
  background-repeat: no-repeat; text-align: center; padding: 35px; font-size:1.5em; color:#cce0dd;">
  <h1>The process has been closed!</h1>
</div>
<section style="padding: 20px; margin: 50px; border: 2px solid #4D716D; border-radius:40px; text-align: center;">
  <h2>PROCESS CLOSED</h2>
  <p>The process opened about the ${animal} in the <strong>Rehome Me</strong> webpage has been
    closed.<br>
    The actual petition status is ${status}.
    <ul style="list-style-type: none">
      <li><b>Animal's name</b>: ${animal}</li>
      <li><b>Current owner</b>: ${ownerN}</li>
      <li><b>Owner's email</b>: ${ownerE}</li>
      <li><b>Host</b>: ${hostN}</li>
      <li><b>Host's email</b>: ${hostE}</li>
    </ul>
  </p>
  <p>To obtain more details, please log in at <a href="http://rehome-me.herokuapp.com/">Rehome Me</a>.</p>
  <div>
    <img
      src="https://images2.minutemediacdn.com/image/upload/c_crop,h_1195,w_2127,x_0,y_0/f_auto,q_auto,w_1100/v1586626259/shape/mentalfloss/606627-gettyimages-1080967246.jpg"
      alt="process-finished">
  </div>
</section>`
}

const createAccount = (user) => {
  return contentHTML = `<div style="background: #4D716D; height: 100px; background-size: cover;
  background-repeat: no-repeat; text-align: center; padding: 35px; font-size:1.5em; color:#cce0dd;">
  <h1>We are happy to have you with us <strong>${user}</strong>!</h1>
</div>
<section
  style="padding: 20px; margin: 50px; border: 2px solid #4D716D; border-radius:40px; text-align: center;">
  <h2>ACCOUNT CREATION</h2>
  <p>This is a confirmation that your <strong>Rehome Me</strong> account has been created!<br>
    We are happy to have you with us, and if there is anything that you need help with, please let us now so
    that we can help you fix any issue that you have in our webpage.
  </p>
  <div>
    <img
      src="https://cdn2www.mundo.com/fotos/201507/Este-perro-salchicha-esta-muy-feliz-600x400.jpg"
      alt="happy-dog">
  </div>
  <p><b>If you want to use our services again, we'll be at <a href="http://rehome-me.herokuapp.com/">Rehome Me</a>
      for
      you!
      :)</b</p> </section>`
}

module.exports = {
  transporter,
  deleteMail,
  adoptionPetition,
  sitterPetition,
  processClosed,
  createAccount
};