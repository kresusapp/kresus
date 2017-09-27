import * as cozydb from "cozydb";
import { promisifyModel } from "../helpers";

let Cozy = cozydb.getModel("CozyInstance", {
  domain: String,
  helpUrl: String,
  locale: String
});

Cozy = promisifyModel(Cozy);

module.exports = Cozy;
