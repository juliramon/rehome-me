exports.formatDate = (model, field) => {
  let year = model[field].getFullYear();
  let month = model[field].getMonth();
  let date = model[field].getDate();
  month < 10 ? month = `0${month}` : undefined;
  date < 10 ? date = `0${date}` : undefined;
  return year + "-" + month + "-" + date;
}