// create variable for database
let db;

// creating a new request to create a database called "budget"
const request = indexedDB.open("budget", 1);

const { oldVersion } = e;
const newVersion = e.newVersion || db.version;

request.onupgradeneeded = function (event) {
  const db = event.target.result;

  db.createObjectStore("BudgetStore", { autoIncrement: true });

};

request.onerror = function (event) {
  console.log(`You broke it: ${event.target.errorCode}`);
};

request.onsuccess = function (event) {
  console.log("It worked, db created with object store");
  db = event.target.result;

  if (navigator.onLine) {
    console.log("We are online, reading from db");
    checkDatabase();
  }
};


function checkDatabase() {
  console.log("check db invoked");

  // Open a transaction on your BudgetStore db
  let transaction = db.transaction(["BudgetStore"], "readwrite");

  // access your BudgetStore object
  const store = transaction.objectStore("BudgetStore");

  // Get all records from store and set to a variable
  const getAll = store.getAll();

  getAll.onsuccess = function () {

    if (getAll.result.length > 0) {
      fetch("/api/transaction/bulk", {
        method: "POST",
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json",
        },
      })
        .then((response) => response.json())
        .then((res) => {

          if (res.length !== 0) {

            transaction = db.transaction(["BudgetStore"], "readwrite");

            // Assign the current store to a variable
            const currentStore = transaction.objectStore("BudgetStore");

            currentStore.clear();
          }
        });
    }
  };
}

// this is called by the sendTransaction function in index.js. if sendTransaction doesn't work (because the user is offline) and errors, then saveRecord is invoked to add add the posted record to the offline database, aka the indexed db. Can be retrieved when we go back online.
const saveRecord = (record) => {
  console.log("Saving to indexed DB");

  const transaction = db.transaction(["BudgetStore"], "readwrite");

  const store = transaction.objectStore("BudgetStore");

  store.add(record);
};


// if app goes online, then call checkDB function to refresh from database.
window.addEventListener("online", checkDatabase);