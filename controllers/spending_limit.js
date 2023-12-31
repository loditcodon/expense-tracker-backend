const User = require("../models/User");

exports.addSpendingLimitsDay = async (req, res) => {
    try {
        const user = await User.findOne({ _id: req.params.uid });
        if (!user) {
            return res.status(404).json("User not found!");
        }

        user.spending_limit_day = req.body.spending_limit_day;
        await user.save();

        return res.status(200).json("Add Spending Limits Successfully!");
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.addSpendingLimitsMonth = async (req, res) => {
    try {
        const user = await User.findOne({ _id: req.params.uid });
        if (!user) {
            return res.status(404).json("User not found!");
        }

        user.spending_limit_month = req.body.spending_limit_month;
        await user.save();

        return res.status(200).json("Add Spending Limits Successfully!");
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.addSpendingLimitsYear = async (req, res) => {
    try {
        const user = await User.findOne({ _id: req.params.uid });
        if (!user) {
            return res.status(404).json("User not found!");
        }

        user.spending_limit_year = req.body.spending_limit_year;
        await user.save();

        return res.status(200).json("Add Spending Limits Successfully!");
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};
