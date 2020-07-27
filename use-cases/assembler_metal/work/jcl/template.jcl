//{{job.name}} JOB {{job.account}},'ASM/BIND/RUN',MSGCLASS=A,CLASS=A,
//             MSGLEVEL=(1,1),REGION=0M
/*JOBPARM SYSAFF=*
//*
//         SET SRC={{program.name}}
//*
//* *******************************************************************
//* A S S E M B L E
//* *******************************************************************
//*
//ASSEMBLE EXEC PGM=ASMA90
//ASMAOPT  DD  *
ADATA
RENT
MACHINE(ZSERIES-5)
LIST(133)
/*
//SYSADATA DD  DISP=SHR,DSN={{adataDataset.dsn}}(&SRC)
//SYSLIB   DD  DISP=SHR,DSN={{asmmacDataset.dsn}}
//         DD  DISP=SHR,DSN=SYS1.MACLIB
//         DD  DISP=SHR,DSN=SYS1.MODGEN
//         DD  DISP=SHR,DSN=ASMA.SASMMAC2
//         DD  DISP=SHR,DSN=CBC.SCCNSAM
//SYSPRINT DD  SYSOUT=*                                       Listing
//SYSIN    DD  DISP=SHR,DSN={{asmDataset.dsn}}(&SRC)
//SYSLIN   DD  DISP=SHR,DSN={{objlibDataset.dsn}}(&SRC)
//*
//* *******************************************************************
//* B I N D   M O D U L E
//* *******************************************************************
//*
//         IF (RC = 0) THEN
//BIND     EXEC PGM=IEWL,PARM='OPTIONS=IEWLOPT'
//IEWLOPT  DD  *
 LIST
 MAP
 XREF
/*
//OBJECT   DD  DISP=SHR,DSN={{objlibDataset.dsn}}
//SYSLIN   DD  *                                              LNKINC
 INCLUDE OBJECT(TEMPLATE)
 SETOPT PARM(REUS=REFR)
 ORDER TEMPLATE(P)
 ENTRY TEMPLATE
 NAME TEMPLATE(R)
/*
//SYSLMOD  DD  DISP=SHR,DSN={{loadlibDataset.dsn}}(&SRC)
//SYSPRINT DD  SYSOUT=*                                       Listing
//         ENDIF
//*
//* *******************************************************************
//* L I N K   M O D U L E
//* *******************************************************************
//*
//         IF (RC = 0) THEN
//RUN      EXEC PGM=&SRC,PARM=('HELLO WORLD')
//STEPLIB  DD  DISP=SHR,DSN={{loadlibDataset.dsn}}
//SNAP     DD  SYSOUT=*
//SYSPRINT DD  SYSOUT=*
//SYSMDUMP DD  DUMMY
//         ENDIF