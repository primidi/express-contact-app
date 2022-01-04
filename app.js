const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const { loadContact, findContact, addContact, duplicateCheck, deleteContact, updateContacts } = require("./utils/contacts");
const app = express();
const port = 3000;
const { body, validationResult, check } = require("express-validator");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const flash = require("connect-flash");
const { cookie } = require("express/lib/response");

// Use EJS as template engine and express-layout
app.set("view engine", "ejs");
app.use(expressLayouts);

// Built-in middleware for static assets
app.use(express.static("public"));

// Built-in middleware for parsing the data that entered in form
app.use(express.urlencoded({ extended: true }));

// Flash Message configuration
app.use(cookieParser("secret"));
app.use(
  session({
    cookie: { maxAge: 6000 },
    secret: "secret",
    resave: true,
    saveUninitialized: true,
  })
);
app.use(flash());

app.get("/", (req, res) => {
  const people = [
    {
      name: "Kang Hyewon",
      email: "hyewon@mail.com",
    },
    {
      name: "Lee Chaeyoung",
      email: "chaeyoung@mail.com",
    },
    {
      name: "Hwang Eunbi",
      email: "eunbi@mail.com",
    },
  ];
  res.render("index", {
    name: "Primada",
    title: "Homepage",
    people,
    layout: "layouts/main-layout",
  });
});

app.get("/about", (req, res) => {
  res.render("about", {
    layout: "layouts/main-layout",
    title: "About Page",
  });
});

app.get("/contact", (req, res) => {
  const contacts = loadContact();
  res.render("contact", {
    layout: "layouts/main-layout",
    title: "Contact Page",
    contacts,
    msg: req.flash("msg"),
  });
});

// Form for add new data for contact
app.get("/contact/add", (req, res) => {
  res.render("add-contact", {
    layout: "layouts/main-layout",
    title: "Add Contact Form",
  });
});

// Data contact processes
app.post(
  "/contact",
  [
    body("name").custom((value) => {
      const duplicate = duplicateCheck(value);
      if (duplicate) {
        throw new Error(`The contact's name of ${value} is being used, please use other name!`);
      }
      return true;
    }),
    check("phonenum", "Phone Number is not valid!").isMobilePhone("id-ID"),
    check("email", "Email is not valid!").isEmail(),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.render("add-contact", {
        layout: "layouts/main-layout",
        title: "Add Contact Form",
        errors: errors.array(),
      });
    } else {
      addContact(req.body);
      // Send the flash message
      req.flash("msg", "New contact added!");
      res.redirect("/contact");
    }
  }
);

// Delete process of the contact
app.get("/contact/delete/:name", (req, res) => {
  const contact = findContact(req.params.name);

  // Condition when the contact is not found
  if (!contact) {
    res.status(404);
    res.send("<h1>404</h1>");
  } else {
    deleteContact(req.params.name);
    // Send the flash message
    req.flash("msg", "Contact's data deleted!");
    res.redirect("/contact");
  }
});

// Form for edit contact
app.get("/contact/edit/:name", (req, res) => {
  const contact = findContact(req.params.name);
  res.render("edit-contact", {
    layout: "layouts/main-layout",
    title: "Edit Contact Form",
    contact,
  });
});

// Edit data process
app.post(
  "/contact/update",
  [
    body("name").custom((value, { req }) => {
      const duplicate = duplicateCheck(value);
      if (value !== req.body.oldName && duplicate) {
        throw new Error(`The contact's name of ${value} is being used, please use other name!`);
      }
      return true;
    }),
    check("phonenum", "Phone Number is not valid!").isMobilePhone("id-ID"),
    check("email", "Email is not valid!").isEmail(),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.render("edit-contact", {
        layout: "layouts/main-layout",
        title: "Edit Contact Form",
        errors: errors.array(),
        contact: req.body,
      });
    } else {
      updateContacts(req.body);
      // Send the flash message
      req.flash("msg", "Data contact edited!");
      res.redirect("/contact");
    }
  }
);

// Show detail of the contact
app.get("/contact/:name", (req, res) => {
  const contact = findContact(req.params.name);
  res.render("detail", {
    layout: "layouts/main-layout",
    title: "Contact's Detail Page",
    contact,
  });
});

app.use((req, res) => {
  res.status(404);
  res.send("<h1>404</h1>");
});

app.listen(port, () => {
  console.log(`This app is listening in http://localhost:${port}`);
});
