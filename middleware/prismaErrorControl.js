const { Prisma } = require("@prisma/client");
//put together with the help of google
function handlePrismaError(error) {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case "P2002":
        return { status: 409, message: "Unique key constraint failed" };
      case "P2025":
        return { status: 404, message: "Record not found" };
      case "P2003":
        return { status: 400, message: "Foreign key constraint failed" };
      case "P2009":
        return { status: 400, message: "Query validation error" };
      default:
        return { status: 500, message: `Database error:(${error.code})` };
    }
  }
  return { status: 500, message: "Internal Server Error" };
}

module.exports = handlePrismaError;
