import { Router } from "express";
import {
    changeCurrentPassword,
    loginUser,
    logOutUser,
    sendOtpForRegistration,
    verifyOtpAndRegister,
    resendOtp,
    refreshAccessToken,
    updateUserCoverImage,
    forgotPassowrd,
    resetPassword,
    userProfile,
    updateAccountDetails,
    getAllUsers,
    submitContactForm,
    socialLogin
} from "../controllers/userController.js";
import { upload } from "../middlewares/upload.js";
import { verifyToken } from "../middlewares/authMiddleware.js";

const router = Router();

router.route("/register").post(
    upload.fields([
        {
            name: "coverImage",
            maxCount: 1,
        },
    ]),
    sendOtpForRegistration
);

router.route("/verify-otp").post(verifyOtpAndRegister);

router.route("/resend-otp").post(resendOtp);

router.route("/login").post(loginUser);

router.route("/social-login").post(socialLogin);

router.route("/refresh-token").post(refreshAccessToken);

router.route("/forgot-password").post(forgotPassowrd);

router.route("/reset-password").post(resetPassword);

router.route("/contact").post(submitContactForm);

//secured routes

router
    .route("/update-cover-image")
    .patch(verifyToken, upload.single("coverImage"), updateUserCoverImage);

router.route("/logout").post(verifyToken, logOutUser);

router.route("/change-password").post(verifyToken, changeCurrentPassword);

router.route("/profile").get(verifyToken, userProfile);

router.route("/update-account").patch(verifyToken, updateAccountDetails);

router.route("/all").get(verifyToken, getAllUsers);

export default router;