// hydra/src/app.ts

import express, { NextFunction, Response, Request } from "express";
import path from "path";
import cors from 'cors';
import logger from "morgan";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import favicon from 'serve-favicon';

import routes from "./routes";
import login from "./routes/login";
import logout from "./routes/logout";
import consent from "./routes/consent";
import device from "./routes/device";
import register from './routes/register';

const app = express();

// app.set('views', path.join(__dirname, 'views'));
// app.set('view engine', 'pug');
// app.use(express.static(path.join(__dirname, 'public')));

// view engine setup
app.set('views', path.join(__dirname, '..', '/views'));
app.set("view engine", "pug")
app.use(express.static(path.join(__dirname, '..', '/public')));
// app.use(express.static(path.resolve(__dirname, '../public')));
// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, '../public', 'favicon.ico')));
// app.use(favicon(path.join(__dirname, '..', 'public', 'favicon.ico')));

app.use(cors());
app.use(logger("dev"));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/", routes)
app.use("/login", login)
app.use("/logout", logout)
app.use("/consent", consent)
app.use("/device", device)
app.use('/register', register);

// catch 404 and forward to error handler
app.use((req: Request, res: Response, next: NextFunction) => {
  next(new Error("Not Found"))
})

// error handlers

// development error handler
// will print stacktrace
if (app.get("env") === "development") {
  app.use((err: Error, req: Request, res: Response) => {
    res.status(500)
    res.render("error", {
      message: err.message,
      error: err,
      pageTitle: "Authenticate | Error Page",
    })
  })
}

// production error handler
// no stacktraces leaked to user
app.use((err: Error, req: Request, res: Response) => {
  res.status(500)
  res.render("error", {
    message: err.message,
    error: {},
  })
})

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack)
  res.status(500).render("error", {
    message: JSON.stringify(err, null, 2),
  })
})

const port = Number(process.env.PORT || 3000)
app.listen(port, () => {
  console.log(`Listening on http://localhost:${port}`)
})