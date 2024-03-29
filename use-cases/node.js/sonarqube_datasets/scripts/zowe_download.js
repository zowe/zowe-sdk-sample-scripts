/**
 * This program and the accompanying materials are made available and may be used, at your option, under either:
 * * Eclipse Public License v2.0, available at https://www.eclipse.org/legal/epl-v20.html, OR
 * * Apache License, version 2.0, available at http://www.apache.org/licenses/LICENSE-2.0
 *
 * SPDX-License-Identifier: EPL-2.0 OR Apache-2.0
 *
 * Copyright Contributors to the Zowe Project.
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
const path = require("path");
const fs = require("fs");
const files = require("@zowe/zos-files-for-zowe-sdk");
const imperative = require("@zowe/imperative");

imperative.Logger.initLogger(imperative.LoggingConfigurer.configureLogger(path.join(__dirname,'..','logs'), {name: 'test'}));

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
    console.error(`Missing Script Arguments:`);
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
            };

            await files.Download.allMembers(session, `${ds}`, downloadOptions).then((result) => {
                console.log(`Downloading: ${ds}`);
                console.log(result);
                console.log("");
            }).catch((err) => {
                console.error(`Unable to download members: ${err.message}`);
                console.error("");
                process.exit(1);
            });
        }
    }
})();