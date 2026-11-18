import { render } from "preact";
import { App } from "./app.jsx";
import "./styles/base.css";
import "./styles/app.css";
import "./styles/home.css";
import "./styles/hardware.css";
import "./styles/developers.css";
import "./styles/account.css";

render(<App />, document.getElementById("app"));
