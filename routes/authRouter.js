const express = require("express");
const Employee = require("../models/Employee");
const Profile = require("../models/Profile");
require("dotenv").config();
const router = express.Router();
const jwt = require("jsonwebtoken");

router.post("/register", async (req, res) => {
  try {
    const existingEmployee = await Employee.findOne(req.body.username);
    if (existingEmployee) {
      return res
        .status(409)
        .json({ message: "Username already taken.", field: "username" });
    }

    const employee = new Employee(req.body);
    const savedEmployee = await employee.save();

    const profile = new Profile({
      empId: savedEmployee.empId,
      title: "anything...",
      description: "profile description",
      department: "General",
      phone: "01110071232",
      email: "mhmed@gmail.com",
    });
    await profile.save();

    res.status(201).json({
      message: "Employee registered successfully",
      employee: savedEmployee.empId,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      const errors = {};
      for (const field in error.errors) {
        errors[field] = error.errors[field].message;
      }
      return res
        .status(400)
        .json({ errors: errors, message: "Validation Error" });
    }
    console.error("Error registering employee:", error);
    res
      .status(500)
      .json({ message: "Failed to register employee", error: error });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    const employee = await Employee.findOne({ username }).select("+password");

    if (!employee) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    const isPasswordMatch = await employee.comparePassword(password);
    if (!isPasswordMatch) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    console.log("EMPO", employee);

    const token = jwt.sign({ empId: employee._id }, process.env.SECRET_KEY, {
      expiresIn: "1h",
    });

    res.status(200).json({
      message: "Login successful",
      token: token,
      empId: employee._id,
    });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ message: "Login failed", error: error });
  }
});

module.exports = router;


