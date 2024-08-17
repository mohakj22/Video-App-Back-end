import { Router } from "express";
import {
    registerUser,
    findUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1,
        },
        {
            name: "coverImage",
            maxCount: 1,
        },
    ]),
    function (req, res, next) {
        registerUser(req, res, next);
    }
);
// post method takes callback functions as input and will execute them by itself, so I just have to pass the refrence of a function that I want to execute when a particular route matches.
router.route("/login").post(upload.none(), function (req, res, next) {
    loginUser(req, res, next);
});
router.route("/find").post(upload.none(), function (req, res, next) {
    findUser(req, res, next);
});
// Secured routes
router
    .route("/logout")
    .post(upload.none(), verifyJWT, function (req, res, next) {
        logoutUser(req, res, next);
    });
router.route("/refresh-token").post(upload.none(), function (req, res) {
    refreshAccessToken(req, res);
});
// router.route("/login").post(login)
export default router;
