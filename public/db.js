// create variable for database
let db;

// creating a new request to create a database called "budget"
const request = indexedDB.open('BudgetDB', 1);

request.onupgradeneeded = function (event) {
  const db = event.target.result;

  db.createObjectStore("BudgetStore", { autoIncrement: true });
};

request.onerror = function (event) {
  console.log(`You broke it: ${event.target.errorCode}`);
};

request.onsuccess = function (event) {
    console.log('It worked, db created with object store');
    db = event.target.result;
  
    if (navigator.onLine) {
      console.log('We are online, reading from db');
      checkDB();

      // not sure if we need this else?
    } else {
        saveToDB();
    }
  };

// need to write checkDB function to check and fetch from database if we're online, and saveToDB function to save to database if we're offline 






// Listen for app coming back online
window.addEventListener('online', checkDB);












