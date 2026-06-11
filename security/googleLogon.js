const { OAuth2Client } = require("google-auth-library"); //
const { logger, getPrismaErrorInfo } = require("../middleware/index");
const { hashPassword, comparePassword } = require("./passwordProtection");
const { setJwtCookie } = require("./webTokens");
const { prisma, StatusCodes } = require("../index");
require("dotenv").config();

const oAuth2Client = new OAuth2Client({
  clientId: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  redirectUri: "postmessage",
});

async function googleLogon(req, res, next) {
  console.log("google-hand-shake");
  try {
    const code = req.body.code;

    const r = await oAuth2Client.getToken({
      code: code,
      redirectUri: "postmessage",
    });

    oAuth2Client.setCredentials(r.tokens);
    // 5. get user info
    const idToken = r.tokens.id_token;

    const userInfo = await oAuth2Client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = userInfo.getPayload();
    const splitEmail = (email) => {
      return email?.split("@")[0];
    };

    const { name, email } = payload;

    const user = {
      name,
      email,
      password: `${splitEmail(payload?.email)}${process.env.GOOGLE_CLIENT_PASSWORD_SALT}`,
    };

    // 6. use info to query db
    // let accountExist;
    // try {
    //   accountExist = await prisma.user.findUnique({
    //     where: { email },
    //     select: {
    //       id: true,
    //       name: true,
    //       email: true,
    //       createdAt: true,
    //       hashedPassword: true,
    //     },
    //   });
    // } catch (err) {
    //   getPrismaErrorInfo(err);
    //   return next(err);
    // }

    // if (!accountExist) {
    user.hashedPassword = await hashPassword(user.password);
    //if no user account exists then we register
    let result = null;

    try {
      const { name, email, hashedPassword } = user;

      result = await prisma.$transaction(async (txt) => {
        const user = await txt.user.create({
          data: { email, name, hashedPassword },
          select: { id: true, email: true, name: true },
        });

        const welcomeTaskData = [
          {
            title: "Complete your profile",
            userId: user.id,
            priority: "medium",
          },
          { title: "Add your first task", userId: user.id, priority: "high" },
          { title: "Explore the app", userId: user.id, priority: "low" },
        ];

        await txt.task.createMany({ data: welcomeTaskData });

        const welcomeTasks = await txt.task.findMany({
          where: {
            userId: user.id,
            title: { in: welcomeTaskData.map((t) => t.title) },
          },
          select: {
            id: true,
            title: true,
            isCompleted: true,
            userId: true,
            priority: true,
          },
        });

        return { user, welcomeTasks };
      });
    } catch (err) {
      if (
        err.name === "PrismaClientKnownRequestError" &&
        err.code === "P2002"
      ) {
        return res.status(400).json({ message: "Email already registered" });
      } else {
        getPrismaErrorInfo(err);
        return next(err);
      }
    }
    const csrfToken = setJwtCookie(req, res, result.user);

    return res.status(StatusCodes.CREATED).json({
      user: result.user,
      csrfToken,
      welcomeTasks: result.welcomeTasks,
      transactionStatus: "success",
    });
    // } //end of register

    //   const compairison = await comparePassword(
    //     user.password,
    //     accountExist?.hashedPassword,
    //   );

    //   delete user.password;

    //   if (!compairison) {
    //     return res.status(StatusCodes.UNAUTHORIZED).json({
    //       message: "Authentication Failed <oo>",
    //     });
    //   }

    //   const csrfToken = setJwtCookie(req, res, user);

    //   return res.status(StatusCodes.OK).json({
    //     name: user.name,
    //     email: user.email,
    //     csrfToken,
    //     message: "logged in",
    //   });
  } catch (error) {
    // 9a. send response to front end like business as usual
    // 9b. their tasks explain a set password

    console.error(error);
    res.status(500).json({ message: "Failed to get tokens." });
  }
}

module.exports = { googleLogon };
