const { Prisma } = require("@prisma/client");
// prisma.io but id be lying if i didnt say i was inpired by the other one
function getPrismaErrorInfo(error) {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    console.log("DataBase Error", error);
    const { message, code, meta } = error;
    return { error: "PrismaClientKnownRequestError", message, code, meta };
  } else if (error instanceof Prisma.PrismaClientValidationError) {
    console.log("validation error", error);
    return { error: "PrismaClientValidationError", message: error.message };
  } else if (error instanceof Prisma.PrismaClientUnknownRequestError) {
    console.log("Unkown error", error);
    return { error: "PrismaClientUnknownRequestError", message: error.message };
  } else {
    console.log("Ghosts\n", error);
    return {
      error: "Picnic with Ghost",
      message:
        "IDK what broke but something in the catch threw an error. Look into other prisma error types.",
    };
  }
}

module.exports = getPrismaErrorInfo;
