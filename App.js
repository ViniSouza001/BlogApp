// carregando módulos
const express = require("express");
const handlebars = require("express-handlebars");
const bodyParser = require("body-parser");
const adminRouter = require("./routes/admin.routes.js");
const usuarios = require("./routes/usuario.routes.js");
const mongoose = require("mongoose");
const app = express();
const path = require("path");
const session = require("cookie-session");
const flash = require("connect-flash");
require("./models/Postagens.js");
require("./models/Categoria.js");
const Categoria = mongoose.model("categorias");
const Postagem = mongoose.model("postagens");
const passport = require("passport");
require("./config/auth.js")(passport);
const { admin } = require("./helpers/admin.js");
const db = require("./config/db.js");

// configurações
// sessão
// obs: essa ordem é muito importante

// app.use(
//   session({
//     resave: true,
//     secret: "cursoNode",
//     saveUninitialized: true,
//   })
// );
app.use(
  session({
    secret: "cursoNode",
    saveUnitialized: true,
  })
);
app.use((req, res, next) => {
  if (!req.session) {
    return next(new Error("There was an internal error"));
  }
  next();
});

app.use(passport.initialize());
app.use(passport.session());

app.use(flash());
// Middleware
app.use((req, res, next) => {
  // esse middleware irá criar duas variáveis globais: uma para mensagem de sucesso e outra para erro
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  res.locals.error = req.flash("error"); // variável global só para o passport
  res.locals.user = req.user || null;
  next();
});
// body parser
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
// Handlebars
app.engine("handlebars", handlebars.engine({ defaultLayout: "main" }));
app.set("view engine", "handlebars");
app.set("views", path.join(__dirname, "views"));

// Mongoose
mongoose.Promise = global.Promise;
mongoose
  .connect(db.mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("connected to MongoDB");
  })
  .catch((err) => {
    console.log("error to connect to MongoDB: " + err);
  });
// Public
app.use(express.static(path.join(__dirname, "public")));

// Rotas
app.use("/admin", adminRouter);

app.get("/", (req, res) => {
  if (req.user) {
    const logged = {
      nome: req.user.nome,
      email: req.user.email,
      eAdmin: req.user.admin,
    };
    Postagem.find()
      .lean()
      .populate("categoria")
      .sort({ data: "desc" })
      .then((postagens) => {
        res.render("index", {
          postagens: postagens,
          userLogged: logged,
          isAdmin: req.user.admin,
        });
      })
      .catch((err) => {
        req.flash("error_msg", "Sorry, there was an internal error");
        res.redirect("/404");
      });
  } else {
    Postagem.find()
      .lean()
      .populate("categoria")
      .sort({ data: "desc" })
      .then((postagens) => {
        res.render("index", { postagens: postagens });
      })
      .catch((err) => {
        req.flash("error_msg", "Sorry, there was an internal error");
        res.redirect("/404");
      });
  }
});

app.get("/404", (req, res) => {
  res.send("Página não encontrada");
});

app.get("/postagens/:slug", (req, res) => {
  Postagem.findOne({ slug: req.params.slug })
    .lean()
    .then((postagem) => {
      if (postagem) {
        res.render("posts/index", { postagem: postagem });
      } else {
        req.flash("error_msg", "This post doesn't exist");
        res.redirect("/");
      }
    })
    .catch((err) => {
      req.flash("error_msg", "There was an internal error");
      res.redirect("/");
    });
});

app.get("/categorias", (req, res) => {
  Categoria.find()
    .lean()
    .then((categorias) => {
      res.render("categories/index", { categorias: categorias });
    })
    .catch((err) => {
      req.flash("error_msg", "There was an internal error listing categories");
      res.redirect("/login");
    });
});

app.get("/categorias/:slug", (req, res) => {
  Categoria.findOne({ slug: req.params.slug })
    .lean()
    .then((categoria) => {
      if (categoria) {
        Postagem.find({ categoria: categoria._id })
          .lean()
          .then((postagens) => {
            res.render("categories/postagens", {
              postagens: postagens,
              categoria: categoria,
            });
          })
          .catch((err) => {
            req.flash("error_msg", "There was a error to list the posts");
            res.redirect("/");
          });
      } else {
        req.flash("error_msg", "This category doesn't exists");
        res.redirect("/");
      }
    })
    .catch((err) => {
      req.flash(
        "error_msg",
        "There was an internal error loading page of this category"
      );
      res.redirect("/");
    });
});

app.use("/usuarios", usuarios);
// Outros
const PORT = process.env.PORT || 8081;
app.listen(PORT, () => {
  console.log("server running on port " + PORT);
});
