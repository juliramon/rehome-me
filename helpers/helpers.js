exports.formatDate = (model, field) => {
  let year = model[field].getFullYear();
  let month = model[field].getMonth();
  let date = model[field].getDate();
  month < 10 ? month = `0${month}` : undefined;
  date < 10 ? date = `0${date}` : undefined;
  return year + "-" + month + "-" + date;
}

exports.generateUsername = fullname => {
  let cleanFullname = fullname.toLowerCase().split(' ').join('');
  let randomNumber = Math.floor(Math.random() * 1000000000);
  return cleanFullname + "-" + randomNumber;
}

exports.validateUsername = (arr, newUsername) => {
  let isUsernameAvailable = true;
  const usernames = arr.map(el => el.username);
  usernames.forEach(el => {
    if(newUsername == el){ isUsernameAvailable = false; } 
  })
  return isUsernameAvailable;
};