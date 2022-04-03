#! /bin/env node

/**
 * This program and the accompanying materials are made available and may be used, at your option, under either:
 * * Eclipse Public License v2.0, available at https://www.eclipse.org/legal/epl-v20.html, OR
 * * Apache License, version 2.0, available at http://www.apache.org/licenses/LICENSE-2.0
 *
 * SPDX-License-Identifier: EPL-2.0 OR Apache-2.0
 *
 * Copyright Contributors to the Zowe Project.
 */

import * as mustache from "mustache";
import * as fs from "fs";
import * as path from "path";

const config = require("../../config/local.json");
const mypath = path.join(__dirname, "..", "..", "work", "jcl", "template.jcl");
const jcl = fs.readFileSync(mypath).toString();
const rendered = mustache.render(jcl, config);

if (!fs.existsSync("./build")) fs.mkdirSync("./build");
fs.writeFileSync("./build/custom.jcl", rendered);
console.log("Generated custom JCL to ./build/custom.jcl");