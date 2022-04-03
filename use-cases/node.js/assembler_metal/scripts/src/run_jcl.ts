/**
 * This program and the accompanying materials are made available and may be used, at your option, under either:
 * * Eclipse Public License v2.0, available at https://www.eclipse.org/legal/epl-v20.html, OR
 * * Apache License, version 2.0, available at http://www.apache.org/licenses/LICENSE-2.0
 *
 * SPDX-License-Identifier: EPL-2.0 OR Apache-2.0
 *
 * Copyright Contributors to the Zowe Project.
 */

import { SubmitJobs, IJob, GetJobs, DownloadJobs, IDownloadAllSpoolContentParms } from "@zowe/zos-jobs-for-zowe-sdk";
import { ISession, SessConstants, Session, Logger, LoggingConfigurer } from "@zowe/imperative";
import { readFileSync, existsSync, mkdirSync } from "fs";
import * as path from "path";

const properties = require("../../config/local.json");
const outputPath = path.join(__dirname, "..", "..", "output");
const jclPath = path.join(__dirname, "..", "..", "build", "custom.jcl");
const jcl = readFileSync(jclPath).toString();

Logger.initLogger(LoggingConfigurer.configureLogger(path.join(__dirname,'..','..','logs'), {name: 'test'}));

const sessionOptions: ISession = {
    "hostname": properties.zosmfHost,
    "port": properties.zosmfPort,
    "user": properties.zosmfUser,
    "password": properties.zosmfPassword,
    "protocol": SessConstants.HTTPS_PROTOCOL,
    "basePath": properties.basepath,
    "type": SessConstants.AUTH_TYPE_BASIC,
    "rejectUnauthorized": properties.rejectUnauthorized
};

const downloadJobOptions: IDownloadAllSpoolContentParms = {
    outDir: outputPath,
    omitJobidDirectory: false,
    extension: "txt",
    jobname: "",
    jobid: ""
};

const session = new Session(sessionOptions);
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

(async() => {

    let checkNum = 0;
    let status: string = "INPUT";
    let jobSubmitResponse: IJob;
    let jobCheckResponse: IJob;
    let jobSpoolResponse;

    // Run the job
    try {
        jobSubmitResponse = await SubmitJobs.submitJcl(session, jcl, undefined, undefined);
        console.log(`Job ${jobSubmitResponse.jobname} submitted with ID ${jobSubmitResponse.jobid}`);
    } catch (err) {
        console.error(`JCL submission failed: ${err.message}`);
        process.exit(1);
    }

    status = jobSubmitResponse.status;
    jobCheckResponse = jobSubmitResponse;

    // Wait for it to complete.
    while (( status == "INPUT" || status == "ACTIVE" ) && checkNum < 100 ) {
        checkNum = checkNum + 1;
        try {
            jobCheckResponse = await GetJobs.getJob(session, jobSubmitResponse.jobid);
            status = jobCheckResponse.status;
            console.log(`Job ${jobSubmitResponse.jobname} (${jobSubmitResponse.jobid}) status check #${checkNum}: ${jobCheckResponse.status}`);
        } catch (err) {
            console.error(`Failed to get information: ${err.message}`);
            process.exit(1);
        }

        if (status == "INPUT" || status == "ACTIVE") {
            await delay(5000);
        }
        if (checkNum == 100 && status != "OUTPUT") {
            console.error(`Job ${jobSubmitResponse.jobname} (${jobSubmitResponse.jobid}) did not complete in time.`);
        }
    }

    // Make directory for the spool output
    if (!existsSync(outputPath)) {
        mkdirSync(outputPath);
    }

    //Get the spool output
    downloadJobOptions.jobid = jobSubmitResponse.jobid;
    downloadJobOptions.jobname = jobSubmitResponse.jobname;

    try {
        // eslint-disable-next-line unused-imports/no-unused-vars
        jobSpoolResponse = await DownloadJobs.downloadAllSpoolContentCommon(session, downloadJobOptions);
        console.log(`Got job spool output from job ${jobSubmitResponse.jobid}`);
        console.log(`Job ${jobSubmitResponse.jobname} exited with return code ${jobCheckResponse.retcode}`);
        if (jobCheckResponse.retcode != "CC 0000") {
            process.exit(1);
        }
    } catch (err) {
        console.error(`Failed to download job spool output: ${err.message}`);
        process.exit(1);
    }

})();