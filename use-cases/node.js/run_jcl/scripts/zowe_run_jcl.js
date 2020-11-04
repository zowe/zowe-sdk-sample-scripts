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
const path = require("path");
const fs = require("fs");
const files = require("@zowe/zos-files-for-zowe-sdk");
const jobs = require("@zowe/zos-jobs-for-zowe-sdk");
const imperative = require("@zowe/imperative");

imperative.Logger.initLogger(imperative.LoggingConfigurer.configureLogger(path.join(__dirname,'..','logs'), {name: 'test'}));
const delay = ms => new Promise(res => setTimeout(res, ms));

/******************************************************************** 
 *   Process the script input arguments                             *                              
 ********************************************************************/

// Set of required script arguments
const requiredArgs = ["user", "password"];

// Parse the input arguments into an args object
const args = {};
let relPath = "";
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
 *   Do some of the required setup now                              *
 ********************************************************************/

// Read the properties file
let properties;
try {
    properties = require("../custom_properties.json");
} catch (err) {
    console.error(`Unable to read "custom_properties.json": ${err.message}`);
    process.exit(1);
}

const inputPath = path.join(__dirname, "..", "jcl", properties.localFile);
const outputDir = path.join(__dirname, "..", "output");
const expectedSuccessOutput = properties.expectedOutput;

// Session that will be used
const session = new imperative.Session({
    hostname: properties.zosmfHost,
    port: properties.zosmfPort,
    user: args.user,
    password: args.password,
    protocol: undefined,
    basePath: undefined,
    type: "basic",
    rejectUnauthorized: false
});

// Options for creating a dataset
const datasetOptions = {
    volser: properties.dataset.volser,
    primary: properties.dataset.primary,
    secondary: properties.dataset.secondary,
    alcunit: properties.dataset.alcunit,
    dirblk: properties.dataset.directoryblocks,
    blksize: properties.dataset.blocksize,
    lrecl: properties.dataset.lrecl,
    dsorg: properties.dataset.dsorg
};

// Options for uploading the JCL file
const uploadOptions = {
    binary: false,
    fileName: properties.localFile
};

// Options for downloading the spool content
const jobDownloadOptions = {
    outDir: outputDir,
    omitJobDirectory: false,
    extension: properties.jobOutputExtension,
    jobname: undefined,
    jobid: undefined
};

const parms = {
    jclSource: undefined,
    viewAllSpoolContent: true,
    directory: undefined,
    extension: undefined,
    volume: undefined,
    waitForActive: undefined,
    waitForOutput: undefined,
    task: undefined
};

(async() => {
/******************************************************************** 
 *   Create the dataset, if requested                               *
 ********************************************************************/

    if (properties.createDataset == true) {
        console.log(`Creating dataset: ${properties.dataset.dsn}`);
        try {
            const create = await files.Create.dataSet(session, files.CreateDataSetTypeEnum.DATA_SET_CLASSIC, properties.dataset.dsn, datasetOptions);
            console.log("Create API response: ");
            console.log(create);
            console.log(`\n`);
        } catch (err) {
            if (err.message.toString().includes("Dynamic allocation Error")) {
                console.log("Dataset already exists.");
            } else {
                console.error(`Unable to create the dataset: ${err.message}`);
                process.exit(1);
            }
        }
    }

/******************************************************************** 
 *   Give zos a chance to realize the dataset exists                *
 ********************************************************************/

    await delay(2000);

/******************************************************************** 
 *   Upload JCL file to dataset                                     *
 ********************************************************************/

    console.log(`Uploading JCL file: ${inputPath}`);
    try {
        const upload = await files.Upload.fileToDataset(session, inputPath, `${properties.dataset.dsn}(${properties.dataset.member})`);
        console.log("Upload API response: ");
        console.log(upload);
        console.log(`\n`);
    } catch (err) {
        console.error(`Unable to upload the file ${inputPath} to dataset ${properties.dataset.dsn}(${properties.dataset.member})`);
        console.error(err.message);
        process.exit(1);
    }

/******************************************************************** 
 *   Give zos a chance to realize the JCL exists                    *
 ********************************************************************/

    await delay(2000);

/******************************************************************** 
 *   Run JCL that was uploaded                                      *
 ********************************************************************/

    let owner;
    let jobid;
    let jobname;

    console.log(`Running JCL in file: ${properties.localFile}`);
    try {
        const run = await jobs.SubmitJobs.submitJob(session, `${properties.dataset.dsn}(${properties.dataset.member})`);
        console.log("Run API response: ");
        console.log(run);
        console.log(`\n`);
        owner = run.owner;
        jobid = run.jobid;
        jobname = run.jobname;
    } catch (err) {
        console.error(`Failed to run job: ${err.message}`)
        process.exit(1);
    }

/******************************************************************** 
 *   Let the job run for awhile                                     *
 ********************************************************************/

    await delay(2000);

/******************************************************************** 
 *   Wait for the job to be out of input and execution              *
 ********************************************************************/

    let status = "INPUT";
    let checkNum = 0;
    let response;
    console.log(`Check job status`);

    while (( status == "INPUT" || status == "ACTIVE" ) && checkNum < 100 ) {
        
        checkNum = checkNum + 1;
        try {
            response = await jobs.GetJobs.getJob(session, jobid);
            status = response.status;
            console.log(`Job ${jobid} status check #${checkNum}: ${status}`)
        } catch (err) {
            console.error(`Failed to get information: ${err.message}`);
            process.exit(1);
        }

        if (status == "INPUT" || status == "ACTIVE") {
            // Wait so we aren't spamming the service
            await delay(5000);
        }
    }

    const apiObj = await jobs.SubmitJobs.checkSubmitOptions(session, parms, response)

    console.log(`Job ${jobid} exited with return code ${response.retcode}`);

/******************************************************************** 
 *   Give the system a second or two                                *
 ********************************************************************/

    await delay(5000);

/******************************************************************** 
 *   Make the directory for the job output                          *                              
 ********************************************************************/

    // Create the output directory 
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir);
    }

/******************************************************************** 
 *   Download the job output                                        *
 ********************************************************************/

    let jobInfo;
    jobDownloadOptions.jobname = jobname;
    jobDownloadOptions.jobid = jobid;

    try {
        jobInfo = await jobs.DownloadJobs.downloadAllSpoolContentCommon(session, jobDownloadOptions);
        console.log(`Got job spool output from job ${jobid}`);
    } catch (err) {
        console.error(`Failed to download job spool output: ${err.message}`);
        process.exit(1);
    };


/******************************************************************** 
 *   Parse the job output                                           *
 ********************************************************************/

    let error = 0;
    let jclResponse;

    for (const spoolFile of apiObj) {
        jclResponse = jclResponse + spoolFile.data;
    };

    if (jclResponse == null) {
        console.error(`No output gathered from z/OSMF.`)
        process.exit(1);
    }

    for (const validationString of expectedSuccessOutput)  {
        if (jclResponse.includes(validationString)) {
            continue;
        } else {
            console.error(`Could not find the string ${validationString} in the output of ${jobid}`);
            error = 1;
        }
    }

    if (error == 1) {
        console.error(`Not all expected output could be found for job ${jobid}`);
        process.exit(1);
    }

    console.log(`Successfully validated output of job ${jobid}`);

})();