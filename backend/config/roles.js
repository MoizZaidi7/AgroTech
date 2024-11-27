// roles.js
const roles = {
    Admin: [
      'viewAllUsers',
      'editUser',
      'deleteUser',
      'manageComplaints',
      'resolveComplaints',
      'viewReports',
      'generateReports',
      'registerUser',
      'updateProfile',
      'viewProfile',
      'changePassword',
      'deleteAccount'
    ],
    Farmer: ['updateProfile', 'viewProfile', 'changePassword', 'deleteAccount'],
    Customer: ['updateProfile', 'viewProfile', 'changePassword', 'deleteAccount'],
    Seller: ['updateProfile', 'viewProfile', 'changePassword', 'deleteAccount'],
  };
  
  export default roles;