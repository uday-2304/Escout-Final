//user controller
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendEmail } from "../utils/sendEmail.js";
import bcrypt from "bcrypt";
import crypto from "crypto";


const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId); // Returns as user object contains userid,email,hashed password and refreshtoken
        const accessToken = user.generateAccessToken(); // Comes from the user model code //71 //Function call // Short lived one used to generate api requests
        const refreshToken = user.generateRefreshToken(); //Comes from usermodel code  //87 // function call //Longlived one used to generate new access tokens

        user.refreshToken = refreshToken; //stores in a database for invalidate when user logs out
        await user.save({ validateBeforeSave: false });  // Its doesnot validate email,password we only changed refreshtoken so it doesnot validate and saves before validation it saves time

        return { accessToken, refreshToken };
        
    } catch (error) {
        throw new ApiError(
            500, //Server error
            "Something went wrong while generating refresh and access token"
        );
    }
};

const generateOtp = () => {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashed = crypto.createHash("sha256").update(otp).digest("hex");
    return { otp, hashed };
};
// In-memory store for OTPs to avoid cross-site cookie blocking issues with express-session
// data is stored like this in a map (simple temporary storage , fastlookup)
/*{
  "user@gmail.com": {
     userName: "uday",
     email: "user@gmail.com",
     password: "hashedPassword",
     role: "user",
     phoneNumber: "9876543210",
     instaHandle: "uday.dev",
     coverImage: "cloudinary_url",
     otp: "483920",
     timestamp: 171234567890
}
     }*/


const otpStore = new Map(); // Temporary storage

const sendOtpForRegistration = asyncHandler(async (req, res) => {
    const { userName, email, password, role, phoneNumber, instaHandle } = req.body;

    if (!userName || !email || !password) {
        throw new ApiError(400, "All fields are required"); //HTTP 400 → Bad Request
    }

    const existingUser = await User.findOne({ $or: [{ email }, { userName }] });

    if (existingUser) {
        throw new ApiError(409, "User with this email or username already exists");  //HTTP 409 = Conflict
    }

    let coverImageLocalPath;
    if (
        req.files &&
        Array.isArray(req.files.coverImage) &&
        req.files.coverImage.length > 0
    ) {
        coverImageLocalPath = req.files.coverImage[0].path;
    }

    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    const { otp, hashed } = generateOtp();

    // Store registration data in memory map (store only hashed OTP)
    otpStore.set(email, {
        userName,
        email,
        password,
        role,
        phoneNumber,
        instaHandle,
        coverImage: coverImage?.url || "",
        otp: hashed,
        attempts: 0,
        timestamp: Date.now(),
    });

    // DEBUG: For local development, log the OTP so it can be used if email delivery isn't working.
    if (process.env.NODE_ENV !== "production") {
        console.log(`DEBUG: OTP for ${email} is ${otp}`);
    }

    // Send email (in development we log the OTP and still proceed)
    try {
        await sendEmail({
            to: email,
            subject: "Verify Your Email - eScout",
            html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
              <h2 style="color: #333; text-align: center;">Welcome to eScout!</h2>
              <p style="color: #555; font-size: 16px;">Hi ${userName},</p>
              <p style="color: #555; font-size: 16px;">Thank you for registering. To complete your sign-up process, please use the following One-Time Password (OTP):</p>
              <div style="text-align: center; margin: 30px 0;">
                <span style="font-size: 32px; font-weight: bold; color: #000; letter-spacing: 5px; padding: 10px 20px; background-color: #f4f6f8; border-radius: 8px;">${otp}</span>
              </div>
              <p style="color: #555; font-size: 14px;">This OTP is valid for 15 minutes. If you didn't request this, please ignore this email.</p>
              <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;" />
              <p style="color: #999; font-size: 12px; text-align: center;">eScout - Unlock Your Potential</p>
            </div>`
        });

    } catch (emailError) {
        // Log full error details for debugging
        const underlying = emailError?.response?.body || emailError?.message || emailError;
        console.error("Email sending error:", underlying);

        // In dev, allow registration to proceed with OTP logged to console
        if (process.env.NODE_ENV !== "production") {
            console.warn(
                "Continuing despite email failure (dev mode). OTP is logged to console above."
            );
        } else {
            // In production, fail loudly so the client knows email delivery failed.
            throw new ApiError(500, `Failed to send OTP email: ${underlying}`);
        }
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                { sessionId: req.session.id }, // Return session ID for debugging
                "OTP sent successfully."
            )
        );
});


const verifyOtpAndRegister = asyncHandler(async (req, res) => {

    const { otp, email } = req.body;

    let registrationData = null;
    let registeredEmail = null;

    // If frontend sends email (recommended)
    if (email) {
        registrationData = otpStore.get(email);
        registeredEmail = email;
    } 

    // Fallback search by OTP (not recommended but kept for compatibility)

    else {
        for (const [key, value] of otpStore.entries()) {

            const hashedOtp = crypto
                .createHash("sha256")
                .update(otp)
                .digest("hex");

            if (value.otp === hashedOtp) {
                registrationData = value;
                registeredEmail = key;
                break;
            }
        }
    }

    if (!registrationData) {
        throw new ApiError(400, "Session expired or invalid. Please register again.");
    }

    // Check OTP expiry (15 minutes)
    const sessionAge = Date.now() - registrationData.timestamp;

    if (sessionAge > 15 * 60 * 1000) {
        otpStore.delete(registeredEmail);
        throw new ApiError(400, "OTP expired. Please register again.");
    }

    // Hash the OTP entered by user
    const hashedOtp = crypto
        .createHash("sha256")
        .update(otp)
        .digest("hex");

    // Limit attempts
    if (registrationData.attempts >= 10) {
        otpStore.delete(registeredEmail);
        throw new ApiError(400, "Too many attempts. Please register again.");
    }

    // Check OTP
    if (registrationData.otp !== hashedOtp) {

        registrationData.attempts += 1;
        otpStore.set(registeredEmail, registrationData);

        throw new ApiError(400, "Invalid OTP.");
    }

    // OTP correct → create user
    const { userName, password, coverImage, role, phoneNumber, instaHandle } = registrationData;

    const user = await User.create({
        userName,
        email: registeredEmail,
        password,
        coverImage,
        role,
        phoneNumber,
        instaHandle,
        isEmailVerified: true,
    });

    // Clear OTP memory
    otpStore.delete(registeredEmail);

    return res.status(201).json(
        new ApiResponse(
            201,
            { userId: user._id },
            "User registered successfully!"
        )
    );
});


const resendOtp = asyncHandler(async (req, res) => {  //Purpose of asynchandler is to find async errors , otherwise we need to write try catchblock
// (asyncHandler wraps the async function to automatically catch errors.)
    const { email } = req.body;

    if (!email) {
        throw new ApiError(400, "Email is required to resend OTP");
    }

    const registrationData = otpStore.get(email);
    if (!registrationData) {
        throw new ApiError(400, "No pending registration found for this email. Please register again.");
    }

    const { otp, hashed } = generateOtp();
    registrationData.otp = hashed;
    registrationData.timestamp = Date.now(); // reset timer

    // DEBUG: For local development, log the OTP so it can be used if email delivery isn't working.
    if (process.env.NODE_ENV !== "production") {
      console.log(`DEBUG: Resent OTP for ${email} is ${otp}`);
    }

    try {
        await sendEmail({
            to: email,
            subject: "Your New OTP - eScout",
            html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
              <h2 style="color: #333; text-align: center;">eScout Security</h2>
              <p style="color: #555; font-size: 16px;">Hi ${registrationData.userName},</p>
              <p style="color: #555; font-size: 16px;">You requested a new OTP. Please use the following code to complete your verification:</p>
              <div style="text-align: center; margin: 30px 0;">
                <span style="font-size: 32px; font-weight: bold; color: #000; letter-spacing: 5px; padding: 10px 20px; background-color: #f4f6f8; border-radius: 8px;">${otp}</span>
              </div>
              <p style="color: #555; font-size: 14px;">This OTP is valid for 15 minutes.</p>
              <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;" />
              <p style="color: #999; font-size: 12px; text-align: center;">eScout - Unlock Your Potential</p>
            </div>
            `
        });
    } catch (error) {
        const underlying = error?.response?.body || error?.message || error;
        console.error("Resend OTP email error:", underlying);

        if (process.env.NODE_ENV !== "production") {
            console.warn(
                "Continuing despite resend email failure (dev mode). OTP is logged to console above."
            );
        } else {
            throw new ApiError(500, `Failed to resend OTP email: ${underlying}`);
        }
    }

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "New OTP sent successfully."));
});

const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        throw new ApiError(401, "Both email and password are required for login");
    }

    const user = await User.findOne({ email });

    if (!user) {
        throw new ApiError(404, "User does not exist");
    }

    const isPasswordValid = await user.isPasswordCorrect(password);

    if (!isPasswordValid) {
        throw new ApiError(404, "Password is incorrect");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
        user._id
    );

    const loggedInUser = await User.findById(user._id).select(
        -"password -refreshToken"
    );

    const options = {
        httpOnly: true,
        secure: true,
        sameSite: "None",
    };

    return res
        .status(200)
        .cookie("refreshToken", refreshToken, options)
        .cookie("accessToken", accessToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    user: loggedInUser,
                    accessToken,
                    tokens: {
                        accessToken,
                        refreshToken,
                    },
                },
                "User logged in successfully"
            )
        );
});

const socialLogin = asyncHandler(async (req, res) => {
    const { email, name, authProvider, authProviderId, photoUrl } = req.body;

    if (!email || !authProvider || !authProviderId) {
        throw new ApiError(400, "Missing required fields for social login");
    }

    if (!['google', 'facebook'].includes(authProvider)) {
        throw new ApiError(400, "Invalid auth provider");
    }

    let user = await User.findOne({ email });

    if (!user) {
        // Register new user seamlessly without password
        let baseName = name ? name.replace(/\s+/g, '').toLowerCase() : email.split('@')[0];
        
        // Ensure unique username
        let uniqueName = baseName;
        let counter = 1;
        while (await User.findOne({ userName: uniqueName })) {
             uniqueName = baseName + counter;
             counter++;
        }

        user = await User.create({
            userName: uniqueName,
            email,
            authProvider,
            authProviderId,
            coverImage: photoUrl || "",
            role: "player",
            isEmailVerified: true
        });
    } else {
        // If user logged in locally before, maybe link the account
        if (user.authProvider === 'local') {
            user.authProvider = authProvider;
            user.authProviderId = authProviderId;
            if (photoUrl && !user.coverImage) {
                user.coverImage = photoUrl;
            }
            await user.save({ validateBeforeSave: false });
        }
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

    const options = {
        httpOnly: true,
        secure: true,
        sameSite: "None",
    };

    return res
        .status(200)
        .cookie("refreshToken", refreshToken, options)
        .cookie("accessToken", accessToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    user: loggedInUser,
                    accessToken,
                    tokens: {
                        accessToken,
                        refreshToken,
                    },
                },
                "Social login successful"
            )
        );
});


const logOutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined,
            },
        },
        {
            new: true,
        }
    );

    const options = {
        httpOnly: true,
        secure: true,
        sameSite: "None",
    };

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "User logged out Successfully"));
});

const forgotPassowrd = asyncHandler(async (req, res) => {
    const { email } = req.body;

    if (!email) {
        throw new ApiError(401, "Email is required");
    }

    const user = await User.findOne({ email });

    if (!user) {
        throw new ApiError("User does not exist");
    }

    const {otp} = generateOtp();

    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    user.passwordResetOtp = otp;

    user.passwordResetOtpExpires = otpExpires;

    await user.save({ validateBeforeSave: false });

    const emailSubject = "Reset Your Password";
    const emailMessage = `<p>You have requested to reset your password. Your One-Time Password (OTP) is: <strong>${otp}</strong>. It is valid for 10 minutes.</p>`;

    try {
        await sendEmail({
            to: email,
            subject: emailSubject,
            html: emailMessage
        });

        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    {},
                    "Password reset OTP has been sent to your email."
                )
            );
    } catch (error) {
        user.passwordResetOtp = undefined;
        user.passwordResetOtpExpires = undefined;
        await user.save({ validateBeforeSave: false });

        throw new ApiError(
            500,
            "Failed to send password reset email. Please try again."
        );
    }
});

const resetPassword = asyncHandler(async (req, res) => {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
        throw new ApiError(401, "All fields are required");
    }

    const user = await User.findOne({
        email,
        passwordResetOtp: otp,
        passwordResetOtpExpires: { $gt: Date.now() },
    });

    if (!user) {
        throw new ApiError(401, "Invalid credentials entered");
    }

    user.password = newPassword;

    user.passwordResetOtp = undefined;
    user.passwordResetOtpExpires = undefined;

    user.refreshToken = undefined

    await user.save();

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                {},
                "Your password has been reset successfully. You can now login using your new password"
            )
        );
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id);
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

    if (!isPasswordCorrect) {
        throw new ApiError(401, "Old password given is incorrect");
    }

    user.password = newPassword;

    await user.save({ validateBeforeSave: false });

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Password changed successfully"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken =
        req.cookies.refreshToken || req.body.refreshToken;
    if (!incomingRefreshToken) {
        throw new ApiError(401, "Unauthorized request");
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        );

        const user = await User.findById(decodedToken?._id);

        if (!user) {
            throw new ApiError(401, "Invalid refresh token");
        }

        if (incomingRefreshToken !== user.refreshToken) {
            throw new ApiError(401, "Refresh token is expired or used");
        }

        const options = {
            httpOnly: true,
            secure: true,
            sameSite: "None",
        };

        const { accessToken, refreshToken: newrefreshToken } =
            await generateAccessAndRefreshTokens(user._id);

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", newrefreshToken, options)
            .json(
                new ApiResponse(
                    200,
                    { accessToken, refreshToken: newrefreshToken },
                    "Access Token refreshed"
                )
            );
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token");
    }
});

const updateUserCoverImage = asyncHandler(async (req, res) => {
    const coverImageLocalPath = req.file?.path;
    let newCoverImageUrl = null;

    if (coverImageLocalPath) {
        const coverImage = await uploadOnCloudinary(coverImageLocalPath);
        if (!coverImage?.url) {
            throw new ApiError(500, "Error while uploading to Cloudinary");
        }
        newCoverImageUrl = coverImage.url;
    } else {
        newCoverImageUrl = null;
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                coverImage: newCoverImageUrl,
            },
        },
        { new: true }
    ).select("-password");

    const message = newCoverImageUrl ? "Cover image updated successfully" : "Cover image removed successfully";

    return res
        .status(200)
        .json(new ApiResponse(200, user, message));
});

const userProfile = asyncHandler(async (req, res) => {
    const user = req.user

    return res
        .status(200)
        .json(new ApiResponse(200, user, "User profile fetched successfully"))
})

const updateAccountDetails = asyncHandler(async (req, res) => {
    const { name, phoneNumber, instaHandle } = req.body;

    if (!name) {
        throw new ApiError(400, "Name is required");
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                userName: name,
                phoneNumber: phoneNumber || undefined,
                instaHandle: instaHandle || undefined
            }
        },
        { new: true, runValidators: true }
    ).select("-password");

    return res
        .status(200)
        .json(new ApiResponse(200, user, "Account details updated successfully"));
});

const getAllUsers = asyncHandler(async (req, res) => {
    const users = await User.find({ _id: { $ne: req.user._id } }).select("-password");
    return res.status(200).json(new ApiResponse(200, users, "All users fetched"));
});

export const submitContactForm = asyncHandler(async (req, res) => {
    const { name, email, phone, subject, message } = req.body;

    if (!name || !email || !message) {
        throw new ApiError(400, "Name, email, and message are required");
    }

    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
            <h2 style="color: #c90e1e; text-align: center;">eScout HQ Transmissions</h2>
            <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;" />
            <p><strong>From:</strong> ${name} &lt;${email}&gt;</p>
            <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
            <p><strong>Subject:</strong> ${subject || 'General Inquiry'}</p>
            <div style="background: #f4f6f8; padding: 20px; border-radius: 8px; margin-top: 20px;">
                <p style="white-space: pre-wrap; font-size: 15px; color: #333;">${message}</p>
            </div>
            <p style="color: #999; font-size: 12px; text-align: center; margin-top: 30px;">Automated System Transmission - eScout Platform</p>
        </div>
    `;

    try {
        await sendEmail({
            to: process.env.SMTP_EMAIL || "satyateja1707@gmail.com",
            subject: `eScout Contact Update: ${subject || 'Inquiry from ' + name}`,
            html
        });
        return res.status(200).json(new ApiResponse(200, {}, "Message sent successfully"));
    } catch (error) {
        throw new ApiError(500, "Failed to send email transmission at this time.");
    }
});

export {
    sendOtpForRegistration,
    verifyOtpAndRegister,
    resendOtp,
    loginUser,
    logOutUser,
    changeCurrentPassword,
    refreshAccessToken,
    updateUserCoverImage,
    forgotPassowrd,
    resetPassword,
    userProfile,
    updateAccountDetails,
    getAllUsers,
    socialLogin
};