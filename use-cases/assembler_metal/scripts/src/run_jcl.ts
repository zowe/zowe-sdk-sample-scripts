import { SubmitJobs, IJob, GetJobs, DownloadJobs, IDownloadAllSpoolContentParms } from "@zowe/cli";
import { ISession, SessConstants, Session } from "@zowe/imperative";
import { readFileSync, existsSync, mkdirSync } from "fs";
import * as path from "path";

const properties = require("../../config/local.json");
const outputPath = path.join(__dirname, "..", "..", "output");
const jclPath = path.join(__dirname, "..", "..", "build", "custom.jcl");
const jcl = readFileSync(jclPath).toString();

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
}

const session = new Session(sessionOptions);

(async() => {

    let checkNum = 0;
    let status: string = "INPUT";
    let jobSubmitResponse: IJob;
    let jobCheckResponse: IJob;
    let jobSpoolResponse;

    // Run the job
    try {
        jobSubmitResponse = await SubmitJobs.submitJcl(session, jcl, undefined, undefined)
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
            setTimeout(() => {return null;}, 5000);
        }
        if (checkNum == 100 && status != "OUTPUT") {
            console.error(`Job ${jobSubmitResponse.jobname} (${jobSubmitResponse.jobid}) did not complete in time.`)
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