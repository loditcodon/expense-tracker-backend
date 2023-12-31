const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

let reFreshTokens = [];
const authController = {
    // POST localhost:[port]/api/user/register
    async register(req, res) {
        try {
            const sait = await bcrypt.genSalt(10);
            const hashed = await bcrypt.hash(req.body.password, sait);

            // Create new User
            const newUser = await new User({
                email: req.body.email,
                phone_number: req.body.phone_number,
                user_name: req.body.user_name,
                password: hashed,
                nickname: req.body.nickname,
            });
            // console.log(newUser);
            // Save new User
            newUser.save();
            res.status(200).send("Successfully");
        } catch (err) {
            res.status(500).json("err");
        }
    },

    // Generate Access Token
    generateAccessToken(user) {
        const accessToken = jwt.sign(
            {
                uid: user.id,
                user_name: user.user_name,
                admin: user.admin,
            },
            process.env.JWT_ACCESS_KEY,
            {
                expiresIn: 60 * 1440, // 1 day
            }
        );
        return accessToken;
    },

    // Generate Refresh Token
    generateRefreshToken(user) {
        const refreshToken = jwt.sign(
            {
                uid: user.id,
                user_name: user.user_name,
                admin: user.admin,
            },
            process.env.JWT_REFRESH_KEY,
            {
                expiresIn: "30d", // 30 days
            }
        );
        return refreshToken;
    },

    // POST localhost:[port]/api/user/login
    async login(req, res) {
        try {
            const user = await User.findOne({ user_name: req.body.user_name });
            if (!user) {
                return res.status(404).json("Wrong username!");
            }
            const validPassword = await bcrypt.compare(req.body.password, user.password);
            if (!validPassword) {
                return res.status(404).json("Wrong password!");
            }
            if (user && validPassword) {
                const accessToken = authController.generateAccessToken(user);
                const refreshToken = authController.generateRefreshToken(user);
                reFreshTokens.push(refreshToken);
                res.cookie("refreshToken", refreshToken, {
                    httpOnly: true,
                    path: "/",
                    sameSite: "strict",
                    secure: false,
                });
                res.cookie("accessToken", accessToken, {
                    httpOnly: true,
                    path: "/",
                    sameSite: "strict",
                    secure: false,
                });
                const uid = user._id;
                res.cookie("uid", user._id, {
                    httpOnly: true,
                    path: "/",
                    sameSite: "strict",
                    secure: false,
                });
                res.status(200).json({ accessToken, refreshToken, uid });
            }
        } catch (err) {
            res.status(500).json(err);
        }
    },

    // Refresh Token
    async requestRefreshToken(req, res) {
        const refreshToken = req.cookies.refreshToken;
        if (!refreshToken) {
            return res.status(401).json("You're not authenticated");
        }
        if (!reFreshTokens.includes(refreshToken)) {
            return res.status(403).json("Refresh Token is not valid");
        }

        jwt.verify(refreshToken, process.env.JWT_REFRESH_KEY, (err, user) => {
            if (err) {
                return res.status(401).json(err);
            }
            // Delete RefreshToken in App
            reFreshTokens = reFreshTokens.filter((token) => token !== refreshToken);
            // Create new accessToken and refreshToken
            const newAccessToken = authController.generateAccessToken(user);
            const newRefreshToken = authController.generateRefreshToken(user);
            res.cookie("refreshToken", newRefreshToken, {
                httpOnly: true,
                path: "/",
                sameSite: "strict",
                secure: false,
            });
            reFreshTokens.push(newRefreshToken);
            res.status(200).json({ accessToken: newAccessToken });
        });
    },

    async logout(req, res) {
        res.clearCookie("refreshToken");
        res.clearCookie("accessToken");
        // Delete RefreshToken in App
        reFreshTokens = reFreshTokens.filter((token) => token !== req.cookies.refreshToken);
        res.status(200).json("Logged out");
    },

    // PUT localhost:[port]/api/v1/editpassword/:uid
    async editPassword(req, res) {
        const user = await User.findOne({ _id: req.params.uid });
        if (!user) {
            return res.status(404).json({
                error: "Invalid ID",
            });
        }
        try {
            const validPassword = await bcrypt.compare(req.body.oldPassword, user.password);
            if (!validPassword) {
                return res.status(400).json({
                    error: "Wrong password",
                });
            }
            try {
                const salt = await bcrypt.genSalt(10);
                const hashed = await bcrypt.hash(req.body.newPassword, salt);
                user.password = hashed;
                user.save();
                res.status(200).json("Update Successfully");
            } catch (error) {
                return res.status(500).json({
                    error: "User save error",
                });
            }
        } catch (error) {
            return res.status(500).json({
                error: "Bcrypt error",
            });
        }
    },

    async forgotPassword(req, res) {
        const user = await User.findOne({ user_name: req.body.user_name })
        if (!user) {
            return res.status(404).json({
                error: "Invalid username",
            });
        }
        else if (user.email != req.body.email) {
            return res.status(404).json({
                error: "Invalid email"
            })
        }
        const id = user._id;
        return res.status(200).json(id);
    },

    // PUT localhost:[port]/api/v1/editpassword/:uid
    async forgotPasswordNext(req, res) {
        const user = await User.findOne({ _id: req.params.uid });
        if (!user) {
            return res.status(404).json({
                error: "Invalid ID",
            });
        }
        try {
            try {
                const salt = await bcrypt.genSalt(10);
                const hashed = await bcrypt.hash(req.body.newPassword, salt);
                user.password = hashed;
                user.save();
                res.status(200).json("Update Successfully");
            } catch (error) {
                return res.status(500).json({
                    error: "User save error",
                });
            }
        } catch (error) {
            return res.status(500).json({
                error: "Bcrypt error",
            });
        }
    },

    async getUserProfile(req, res) {
        try {
            const user = await User.findOne({ _id: req.params.uid });

            if (user) {
                const profileUser = {
                    email: user.email,
                    phone_number: user.phone_number,
                    nickname: user.nickname,
                    user_name: user.user_name,
                    spending_limit_day: user.spending_limit_day,
                    spending_limit_month: user.spending_limit_month,
                    spending_limit_year: user.spending_limit_year
                };

                return res.status(200).json(profileUser);
            } else {
                return res.status(404).json({
                    errCode: 1,
                    errMessaging: "Not found"
                });
            }
        } catch (err) {
            console.error("Server error: ", err);
            return res.status(500).json({
                errCode: 2,
                errMessaging: "Server error"
            });
        }
    },


    async editUserProfile(req, res, next) {
        try {
            const updatedUser = await User.findByIdAndUpdate(req.params.uid, req.body, { new: true });

            if (updatedUser) {
                return res.status(200).json({
                    errCode: 0,
                    errMessaging: "Successfully updated",
                    user: updatedUser,
                });
            } else {
                return res.status(404).json({
                    errCode: 1,
                    errMessaging: "Not found",
                });
            }
        } catch (error) {
            next(error); // Pass the error to the next middleware
        }
    },


    async editPictureUserProfile(req, res) {
        User.find({ _id: req.params.uid })
            .then((user) => {
                user.image = req.body.image;
                user.save();
                return res.status(200).json("Edit Image User Successfully!");
            })
            .catch((error) => {
                res.status(500).json({ message: 'Server Error' })
            })
    }
};

module.exports = authController;
