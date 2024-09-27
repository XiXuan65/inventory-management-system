const router = require("express").Router();
const { User, validate } = require("../models/user");
const bcrypt = require("bcrypt");

router.post("/", async (req, res) => {
    try {
        const { error } = validate(req.body);
        if (error) {
            return res.status(400).send({ message: error.details[0].message });
        }

        // Check for duplicate username
        let user = await User.findOne({ username: req.body.username });
        if (user) {
            return res.status(409).send({ message: "Username already exists!" });
        }

        // Check for duplicate email
        user = await User.findOne({ email: req.body.email });
        if (user) {
            return res.status(409).send({ message: "Email already exists!" });
        }

        // Hash the password
        const salt = await bcrypt.genSalt(Number(process.env.SALT));
        const hashPassword = await bcrypt.hash(req.body.password, salt);

        // Save the new user
        await new User({ ...req.body, email: req.body.email.toLowerCase(), password: hashPassword }).save();
        res.status(201).send({ message: "User created successfully" });
    } catch (error) {
        res.status(500).send({ message: "Internal Server Error" });
    }
});

module.exports = router;
