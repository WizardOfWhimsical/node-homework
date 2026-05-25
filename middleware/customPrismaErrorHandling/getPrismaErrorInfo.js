const { Prisma } = require("@prisma/client");
// prisma.io but id be lying if i didnt say i was inpired by the other one
const prError = true;
function getPrismaErrorInfo(error) {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    const { message, code, meta } = error;
    switch (code) {
      case "P2001": //record does not exist
      case "P2003": //foriegn key constraint failed
      case "P2004": //generic constraint failed
      case "P2005": //invalid stored field value
      case "P2006": //invalid value provided
      case "P2007": //validation/parsing error
      case "P2008": //query parsing error
      case "P2009": //query validation erro
      case "P2011": //null violation
      case "P2012": //missing required value
      case "P2013": //required argument
      case "P2016": //interpetation error
      case "P2017": //relation records not connect
      case "P2020": //value outta range
      case "P2022": //column missing
        return { status: 400, message, meta, prError };

      case "P2015": //related record not found
      case "P2018": //required for not connected
      case "P2025": //rquired not found
        return { status: 404, message, meta, prError };

      case "P2002": //unqie key constraint failed
      case "P2014": //relation violation
        return { status: 409, message, meta, prError };

      case "P2010": //raw query failed
      case "P2021": //table/model missing
        return { status: 500, message, meta, prError };

      default:
        return {
          status: 500,
          message: `Database error:(${error.code})`,
          prError,
        };
    }
  } else if (error instanceof Prisma.PrismaClientValidationError) {
    console.log("validation error", error);
    return {
      error: "PrismaClientValidationError",
      message: error.message,
      prError,
    };
  } else if (error instanceof Prisma.PrismaClientUnknownRequestError) {
    console.log("Unkown error", error);
    return {
      error: "PrismaClientUnknownRequestError",
      message: error.message,
      prError,
    };
  } else {
    return {
      error,
      message: "does not seem to have been a prisma error?",
      prError: false,
    };
  }
}

module.exports = getPrismaErrorInfo;
