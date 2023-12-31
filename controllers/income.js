const IncomeSchema = require("../models/IncomeModel")


exports.addIncome = async (req, res) => {
    const user_id = req.params.uid;
    const { title, amount, category, description, date } = req.body;

    const income = IncomeSchema({
        user_id,
        title,
        amount,
        category,
        description,
        date
    })

    try {
        //validations
        if (!user_id) {
            return res.status(400).json({ message: 'User Id is not valid' });
        }
        if (!title || !category || !description || !date) {
            return res.status(400).json({ message: 'All fields are required!' });
        }
        if (amount <= 0 || !amount === 'number') {
            return res.status(400).json({ message: 'Amount must be a positive number!' });
        }
        await income.save()
        res.status(200).json({ message: 'Income Added' })
    } catch (error) {
        res.status(500).json({ message: 'Server Error' })
    }
    console.log(income)
}

exports.getIncomes = async (req, res) => {
    await IncomeSchema.find({ user_id: req.params.uid })
        .then((income) => {
            const incomes = income.sort((a, b) => b.createdAt - a.createdAt);
            res.status(200).json(incomes)
        })
        .catch((error) => {
            res.status(500).json({ message: 'Server Error' })
        })
}

exports.deleteIncome = async (req, res) => {
    const { uid, id } = req.params;
    IncomeSchema.findByIdAndDelete({ user_id: uid, _id: id })
        .then((income) => {
            res.status(200).json({ message: 'Income Deleted' })
        })
        .catch((err) => {
            res.status(500).json({ message: 'Server Error' })
        })
}