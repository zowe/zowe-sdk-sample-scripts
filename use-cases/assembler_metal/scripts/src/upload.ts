import { Create, ICreateDataSetOptions, CreateDataSetTypeEnum, Upload, IUploadOptions } from "@zowe/cli";
import { Session, ISession, SessConstants } from "@zowe/imperative";
import * as path from "path";

const properties = require("../../config/local.json");

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

const createAsmDatasetOptions: ICreateDataSetOptions = {
    volser: properties.asmDataset.volser,
    dsorg: properties.asmDataset.dsorg,
    alcunit: properties.asmDataset.alcunit,
    primary: properties.asmDataset.primary,
    secondary: properties.asmDataset.secondary,
    dirblk: properties.asmDataset.directoryblocks,
    blksize: properties.asmDataset.blocksize,
    lrecl: properties.asmDataset.lrecl
};

const createAsmmacDatasetOptions: ICreateDataSetOptions = {
    volser: properties.asmmacDataset.volser,
    dsorg: properties.asmmacDataset.dsorg,
    alcunit: properties.asmmacDataset.alcunit,
    primary: properties.asmmacDataset.primary,
    secondary: properties.asmmacDataset.secondary,
    dirblk: properties.asmmacDataset.directoryblocks,
    blksize: properties.asmmacDataset.blocksize,
    lrecl: properties.asmmacDataset.lrecl
};

const createAdataDatasetOptions: ICreateDataSetOptions = {
    volser: properties.adataDataset.volser,
    dsorg: properties.adataDataset.dsorg,
    alcunit: properties.adataDataset.alcunit,
    primary: properties.adataDataset.primary,
    secondary: properties.adataDataset.secondary,
    dirblk: properties.adataDataset.directoryblocks,
    blksize: properties.adataDataset.blocksize,
    lrecl: properties.adataDataset.lrecl,
};

const createObjlibDatasetOptions: ICreateDataSetOptions = {
    volser: properties.objlibDataset.volser,
    dsorg: properties.objlibDataset.dsorg,
    alcunit: properties.objlibDataset.alcunit,
    primary: properties.objlibDataset.primary,
    secondary: properties.objlibDataset.secondary,
    dirblk: properties.objlibDataset.directoryblocks,
    blksize: properties.objlibDataset.blocksize,
    lrecl: properties.objlibDataset.lrecl,
};

const createLoadlibDatasetOptions: ICreateDataSetOptions = {
    volser: properties.loadlibDataset.volser,
    dsorg: properties.loadlibDataset.dsorg,
    alcunit: properties.loadlibDataset.alcunit,
    primary: properties.loadlibDataset.primary,
    secondary: properties.loadlibDataset.secondary,
    dirblk: properties.loadlibDataset.directoryblocks,
    blksize: properties.loadlibDataset.blocksize,
    lrecl: properties.loadlibDataset.lrecl,
};

const uploadOptions: IUploadOptions = {
    recall: "nowait",
    recursive: false,
    binary: false
};

const session = new Session(sessionOptions);
const asmTemplate = path.join(__dirname, "..", "..", "work", "asmpgm", "template.asm");
const macDir = path.join(__dirname, "..", "..", "work", "asmmac");

console.log(macDir);

(async() => {
    let createResponse;
    let uploadResponse;

    if (properties.asmDataset.createDataset) {
        try {
            console.log("Creating ASM Dataset");
            createResponse = await Create.dataSet(session, CreateDataSetTypeEnum.DATA_SET_CLASSIC, properties.asmDataset.dsn, createAsmDatasetOptions);
            console.log(createResponse.commandResponse);
        } catch (err) {
            if (err.message.includes("Dynamic allocation Error")) {
                console.log("Dataset already exists.");
            } else {
                console.error(`Failed to create dataset ${properties.asmDataset.dsn}: ${err.message}`);
                process.exit(1);
            }
        }
    };

    if (properties.asmmacDataset.createDataset) {
        try {
            console.log("Creating ASMMAC Dataset");
            createResponse = await Create.dataSet(session, CreateDataSetTypeEnum.DATA_SET_CLASSIC, properties.asmmacDataset.dsn, createAsmmacDatasetOptions);
            console.log(createResponse.commandResponse);
        } catch (err) {
            if (err.message.includes("Dynamic allocation Error")) {
                console.log("Dataset already exists.");
            } else {
                console.error(`Failed to create dataset ${properties.asmmacDataset.dsn}: ${err.message}`);
                process.exit(1);
            }
        }
    };

    if (properties.adataDataset.createDataset) {
        try {
            console.log("Creating ADATA Dataset");
            createResponse = await Create.dataSet(session, CreateDataSetTypeEnum.DATA_SET_CLASSIC, properties.adataDataset.dsn, createAdataDatasetOptions);
            console.log(createResponse.commandResponse);
        } catch (err) {
            if (err.message.includes("Dynamic allocation Error")) {
                console.log("Dataset already exists.");
            } else {
                console.error(`Failed to create dataset ${properties.adataDataset.dsn}: ${err.message}`);
                process.exit(1);
            }
        }
    };

    if (properties.objlibDataset.createDataset) {
        try {
            console.log("Creating OBJLIB Dataset");
            createResponse = await Create.dataSet(session, CreateDataSetTypeEnum.DATA_SET_CLASSIC, properties.objlibDataset.dsn, createObjlibDatasetOptions);
            console.log(createResponse.commandResponse);
        } catch (err) {
            if (err.message.includes("Dynamic allocation Error")) {
                console.log("Dataset already exists.");
            } else {
                console.error(`Failed to create dataset ${properties.objlibDataset.dsn}: ${err.message}`);
                process.exit(1);
            }
        }
    };

    if (properties.loadlibDataset.createDataset) {
        try {
            console.log("Creating LOADLIB Dataset");
            createResponse = await Create.dataSet(session, CreateDataSetTypeEnum.DATA_SET_BINARY, properties.loadlibDataset.dsn, createLoadlibDatasetOptions);
            console.log(createResponse.commandResponse);
        } catch (err) {
            if (err.message.includes("Dynamic allocation Error")) {
                console.log("Dataset already exists.");
            } else {
                console.error(`Failed to create dataset ${properties.loadlibDataset.dsn}: ${err.message}`);
                process.exit(1);
            }
        }
    };

    try {
        console.log(`Uploading ASM to ${properties.asmDataset.dsn}`)
        uploadResponse = await Upload.fileToDataset(session, asmTemplate, properties.asmDataset.dsn, uploadOptions);
        console.log(uploadResponse.commandResponse);
    } catch (err) {
        console.error(`Failed to upload file ${err.message} to dataset ${properties.asmDataset.dsn}{${properties.asmDataset.member}}`);
        console.error(err.message);
        process.exit(1);
    }

    try {
        console.log(`Uploading ASMMAC to ${properties.asmmacDataset.dsn}`)
        uploadResponse = await Upload.dirToPds(session, macDir, properties.asmmacDataset.dsn, uploadOptions);
        console.log(uploadResponse.commandResponse);
    } catch (err) {
        console.error(`Failed to upload file ${err.message} to dataset ${properties.asmmacDataset.dsn}{${properties.asmmacDataset.member}}`);
        console.error(err.message);
        process.exit(1);
    }
})();
