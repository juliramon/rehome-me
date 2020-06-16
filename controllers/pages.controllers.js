const getIndex = (req, res, next) => res.render('index')

const getUserProfile = (req, res) => res.render('user-profile')

module.exports = {
  getIndex,
  getUserProfile
}