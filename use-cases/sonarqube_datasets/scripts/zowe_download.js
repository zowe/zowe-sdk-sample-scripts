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
 *   It requires that you pass the following arguments:             *
 *                                                                  *
 *   --user         A TSO user id                                   *
 *   --password     The password for the TSO user specified         *
 *                                                                  *
 *   The script also requires a properties file in the project      *
 *   root: "properties.json". The properties file contains the      *
 *   non-sensitive "static" information for the project such as the *
 *   z/OSMF host/port and the source data-sets.                     *
 *                                                                  *
 *   The script parses the input, creates the local directory       *
 *   for the source files and downloads all members from each PDS   *
 *   specified using Zowe CLI.                                      *       
 *                                                                  *
 *   If an error is detected, the script will exit immediately with *
 *   an exit code of 1.                                             *
 ********************************************************************/
//const spawnSync = require("child_process").spawnSync;
const os = require("os");
const path = require("path");
const fs = require("fs");
const cli = require("@zowe/cli");
const imperative = require("@zowe/imperative");

/******************************************************************** 
 *   Process the script input arguments                             *                              
 ********************************************************************/

// Set of required script arguments
const requiredArgs = ["user", "password"];

// Parse the input arguments into an args object
const args = {};
for (let i = 0; i < process.argv.length; i++) {
    if (process.argv[i].startsWith("--")) {
        args[process.argv[i].replace("--", "")] = process.argv[i + 1];
    }
}

// Determine if any required arguments are missing
const missingArgs = requiredArgs.filter((value) => !(value in args));

// If there are missing arguments, report the missing args and exit.
if (missingArgs.length > 0) {
    console.error(`Missing Script Arguments:`)
    console.error(missingArgs);
    console.error("");
    process.exit(1);
}

/******************************************************************** 
 *   Create the local src directory (target of download)            *                              
 ********************************************************************/

// Create the src directory 
const srcDir = path.join(__dirname, "..", "zossrc");
if (!fs.existsSync(srcDir)) {
    fs.mkdirSync(srcDir);
}

/******************************************************************** 
 *   Download the members using Zowe CLI                            *                              
 ********************************************************************/

// Read the properties file
let properties;
try {
    properties = require("../custom_properties.json");
} catch (err) {
    console.error(`Unable to read "custom_properties.json": ${err.message}`);
    process.exit(1);
}

process.chdir(srcDir);

// Iterate through each source type
(async() => {
    for (const srcType of Object.keys(properties.src)) {
        for (const ds of properties.src[srcType]) {

            const session = new imperative.AbstractSession({
                hostname: properties.zosmfHost,
                port: properties.zosmfPort,
                user: args.user,
                password: args.password,
                protocol: undefined,
                basePath: undefined,
                type: "basic",
                rejectUnauthorized: false
            });
            const downloadOptions = {
                extension: srcType,
                maxConcurrentRequests: 10,
                encoding: properties.encoding
            }

            await cli.Download.allMembers(session, `${ds}`, downloadOptions).then((result) => {
                console.log(`Downloading: ${ds}`);
                console.log(result);
                console.log("");
            }).catch((err) => {
                console.error(`Unable to download members: ${err.message}`);
                console.error("");
                process.exit(1);
            });
        }
    };
})();