#! /bin/env node
import * as mustache from "mustache";
import * as fs from "fs";
import * as path from "path";
import * as config from "config";

const mypath = path.join(__dirname, "..", "..", "work", "jcl", "template.jcl");
const jcl = fs.readFileSync(mypath).toString();
const rendered = mustache.render(jcl, config);

if (!fs.existsSync("./build")) fs.mkdirSync("./build");
fs.writeFileSync("./build/custom.jcl", rendered);
console.log("Generated custom JCL to ./build/custom.jcl");