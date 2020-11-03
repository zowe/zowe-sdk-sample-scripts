/*
 * This program and the accompanying materials are made available under the terms of the *
 * Eclipse Public License v2.0 which accompanies this distribution, and is available at  *
 * https://www.eclipse.org/legal/epl-v20.html                                            *
 *                                                                                       *
 * SPDX-License-Identifier: EPL-2.0                                                      *
 *                                                                                       *
 * Copyright Contributors to the Zowe Project.                                           *
 */

/******************************************************************** 
 *   This script is intended to be executed from the command line   *
 *   at your terminal or in a Jenkins (or other CI/CD tool)         * 
 *   pipeline.                                                      *
 *                                                                  *
 *   The script will remove the output/ directory.                  *
 ********************************************************************/
const path = require("path");
const fs = require("fs");

try {
    const sourceDir = path.join(__dirname, "..", "output");
    console.log("Removing 'output' directory...");
    rmDirR(sourceDir);
    console.log("+~~~~~~~~~~~~~~~~~~~~~~~~~~~~~+")
    console.log("| 'output' directory deleted! |");
    console.log("+~~~~~~~~~~~~~~~~~~~~~~~~~~~~~+")
    console.log("");
} catch (err) {
    console.error("ERROR!!! Unable to remove source directory 'output'. Please delete manually!");
    console.error(`Error Details: ${err.message}`);
    console.error("");
    process.exit(1);
}

/**
 * Recurisvely delete a directory and its contents.
 * @param {*} path The directory to delete.
 */
function rmDirR(path) {
    if (fs.existsSync(path)) {
        fs.readdirSync(path).forEach((file) => {
            var curPath = path + "/" + file;
            if (fs.lstatSync(curPath).isDirectory()) {
                rmDirR(curPath);
            } else {
                fs.unlinkSync(curPath);
            }
        });
        fs.rmdirSync(path);
    }
}