# Assembler Metal Template - API Example

This project implements the v1 branch of [this Assembler Metal Template repository](https://github.com/dkelosky/assembler-metal-template/tree/v1) using the Zowe SDK APIs.

## Prerequisites

To use the sample locally, you will need the following:

- Node.js and npm install
- Access to public NPM
- Access to a mainframe running z/OSMF

## Using this exaple

1. Run `npm install`.
2. Make a copy of `config/default.json` and name it `config/local.json`.
3. Modify `config/local.json`, specifying the following information:
  - `zosmfHost` - The host of the mainframe to use that has z/OSMF exposed
  - `zosmfPort` - The port that z/OSMF uses on the host
  - `zosmfUser` - Your username on the system
  - `zosmfPassword` - Your password on the system
  - `basePath` - The base path to append if you are using the API Mediation Layer
  - `rejectUnauthorized` - Allow connections to systems with self signed certificates
  - `job` - The name and account number to be used when generating the JCL job
  - `program` - The name to use for the assembly program
  - `asmDataset` - The DSN and member name to use to upload the assembly code. Optionally, the settings to use to create the dataset.
  - `asmmacDataset` - The DSN to use to upload the assembly macros. Optionally, the settings to use to create the dataset.
  - `adataDataset` - The DSN to use to store SYSADATA. Optionally, the settings to use to create the dataset.
  - `objlibDataset` - The DSN to use to store the created object libraries. Optionally, the settings to use to create the dataset.
  - `loadlibDataset` - The DSN to use as a loadlib. Optionally, the settings to use to create the dataset.
4. Run `npm run genjcl` to generate your JCL from the template stored in `work/jcl/template.jcl` using your modified JSON.
5. Once completed, run `npm run start` to create any datasets, upload the assembly, and run the job to compile and bind it.
6. View the output from the `output/<jobid>` directory.