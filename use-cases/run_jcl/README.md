# Zowe CLI SonarQube Sample
This sample serves as a working example of using Zowe SDK.

The sample includes a means to execute and check JCL output locally via `npm` scripts and via a Jenkins pipeline.

The sample will upload the JCL source file from the local file specified in [custom_properties.json](./custom_properties.json), run it on the mainframe, and download the output.

## Quick-Start
For detailed information on configuration and execution, start with [Prerequisites](#Prerequisites).

1. Clone the project
2. Configure [custom_properties.json](./custom_properties.json)
3. From the project root, run `npm run jcl -- --user yourTSOuserid --password yourTSOpassword`

## Prerequisites
To use the sample locally you will need the following:
- Node.js and npm installed

To use the Jenkins pipeline you will need the following:
- A running instance of Jenkins 
- A Jenkins agent docker image/container with ubuntu:xenial 

**Note:** The pipeline installs the latest version of Zowe SDK. The implication being, the container will need access to public npm.

## Basic Configuration
After cloning the project, you must configure one file:
- [custom_properties.json](./custom_properties.json)

If you wish to use the Jenkins pipeline example, make sure you commit and push your configuration changes to a repository that your Jenkins instance can scan.

### Configure properties.json
Example properties file:
```
{
    "zosmfHost": "your.zosmf.hostname",
    "zosmfPort": "your.zosmf.port",
    "createDataset": false,
    "dataset": {
        "dsn": "yourpmf.group.jcl",
        "member": "mymember",
        "blocksize": 6160,
        "directoryblocks": 25,
        "alcunit": "CYL",
        "primary": 1,
        "secondary": 1,
        "lrecl": 80,
        "dsorg": "PO",
        "volser": null
    },
    "localFile": "",
    "encoding": 1047,
    "extension": "jcl",
    "expectedOutput": [
        "STEP1 - STEP WAS EXECUTED",
        "STEP2 - STEP WAS EXECUTED"
    ]
}
```

Customize `zosmf.hostname` to be your z/OSMF host and `1234` to be your z/OSMF port. Customize the options provided in `dataset` to define what dataset to use, what member to populate with the JCL, and the settings to use if you want to create one. Customize `localfile` to be the JCL stored on the system, `encoding` to be your codepage, and `expectedOutput` to be what output you expect your job to return if completed successfully.

## Running the sample locally
Once you have cloned the project and performed [basic configuration](#Basic-Configuration) you are ready to run the scripts locally.

Using your terminal/command prompt, navigate to the project root directory.

You can upload and run JCL and download the output by executing the following npm script:
```
npm run jcl -- --user MyTSOUser --password MyTSOPassword
```

## Running the Jenkins pipeline
To use the Jenkins pipelines, you must push your changes to a repository that is accessible from your Jenkins instance.

To run the pipeline, complete the following:
1. Setup a Jenkins build to scan your repository (Multibranch Pipeline, etc.)
2. Configure your mainframe credential ID in Jenkins.
3. Customize the [Jenkinsfile](./Jenkinsfile) - read the comment block.

Once you have completed the above steps, run the pipeline.