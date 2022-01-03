const fs = require("fs");

// Create a directory when there's not created yet.
const dirPath = "./data";
if (!fs.existsSync(dirPath)) {
  fs.mkdirSync(dirPath);
}

// Create a contacts.json when there's not created yet.
const dataPath = "./data/contacts.json";
if (!fs.existsSync(dataPath)) {
  fs.writeFileSync(dataPath, "[]", "utf-8");
}

// Function for read all contacts' data at contacts.json
const loadContact = () => {
  const file = fs.readFileSync("data/contacts.json", "utf-8");
  const contacts = JSON.parse(file);
  return contacts;
};

// Function for find contact based on its name
const findContact = (name) => {
  const contacts = loadContact();
  const contact = contacts.find((contact) => contact.name.toLowerCase() === name.toLowerCase());
  return contact;
};

// Function to override contacts.json
const saveContacts = (contacts) => {
  fs.writeFileSync("data/contacts.json", JSON.stringify(contacts));
};

// Function to add new contact
const addContact = (contact) => {
  const contacts = loadContact();
  contacts.push(contact);
  saveContacts(contacts);
};

// Function for checking the name is being used or not
const duplicateCheck = (contactName) => {
  const contacts = loadContact();
  return contacts.find((contact) => contact.name === contactName);
};

module.exports = { loadContact, findContact, addContact, duplicateCheck };
