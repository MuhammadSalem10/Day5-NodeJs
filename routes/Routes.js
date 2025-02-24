const express = require("express");
const authenticateToken = require("../middleware/Authentication");
const Employee = require("../models/Employee");
const Profile = require("../models/Profile");
const Leave = require("../models/Leave");
const router = express.Router();

router.post("/employees", async (req, res) => {
  try {
    const employee = new Employee(req.body);
    const savedEmployee = await employee.save();
    console.log("sved", savedEmployee);
    const profile = new Profile({
      empId: savedEmployee._id,
      title: "Title",
      description: "profile description",
      department: "General",
      phone: "01110071232",
      email: "mhmedsalem10@gmail.com",
    });
    await profile.save();

    res.status(201).json(savedEmployee);
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
    console.error("Error creating employee:", error);
    res.status(500).json({ message: "Failed to create employee", error });
  }
});

router.get("/employees", async (req, res) => {
  try {
    const employees = await Employee.aggregate([
      {
        $addFields: {
          age: {
            $dateDiff: {
              startDate: "$dob",
              endDate: new Date(),
              unit: "year",
            },
          },
        },
      },
    ]);

    res.status(200).json(employees);
  } catch (error) {
    console.error("Error getting employees:", error);
    res
      .status(500)
      .json({ message: "Failed to fetch employees", error: error });
  }
});

router.delete("/employees/:id", authenticateToken, async (req, res) => {
  const empId = req.params.id;
  try {
    const deletedEmployee = await Employee.findOneAndDelete({ _id: empId });
    if (!deletedEmployee) {
      return res.status(404).json({ message: "Employee not found" });
    }
    await Profile.deleteOne({ empId: empId });
    await Leave.deleteMany({ empId: empId });

    res.status(200).json({
      message: "Employee deleted successfully",
      deletedEmployee: deletedEmployee._id,
    });
  } catch (error) {
    console.error("Error deleting employee:", error);
    res.status(500).json({ message: "Failed to delete employee", error });
  }
});

router.patch("/employees/:id", authenticateToken, async (req, res) => {
  const empId = req.params.id;
  try {
    const updatedEmployee = await Employee.findOneAndUpdate(
      { _id: empId },
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedEmployee) {
      return res.status(404).json({ message: "Employee not found" });
    }
    res.status(200).json(updatedEmployee);
  } catch (error) {
    if (error.name === "ValidationError") {
      const errors = {};
      for (const field in error.errors) {
        errors[field] = error.errors[field].message;
      }
      return res
        .status(400)
        .json({ errors: errors, message: "Validation Error during update" });
    } else if (error.code === 11000) {
      return res
        .status(409)
        .json({ message: "Username already exists.", field: "username" });
    }
    console.error("Error updating employee:", error);
    res
      .status(500)
      .json({ message: "Failed to update employee", error: error });
  }
});

router.post("/leave", authenticateToken, async (req, res) => {
  try {
    const leave = new Leave(req.body);
    debugger;
    const savedLeave = await leave.save();
    res.status(201).json(savedLeave);
  } catch (error) {
    if (error.name === "ValidationError") {
      const errors = {};
      for (const field of error.errors) {
        error[field] = error.errors[field].message;
      }
      res.status(400).json(errors);
    }
  }
});

router.get("/employees/:id/leaves", authenticateToken, async (req, res) => {
  try {
    const leaves = await Leave.find({ empId: req.params.id });
    res.status(200).json(leaves);
  } catch (error) {
    console.error("Error getting employee leaves:", error);
    res
      .status(500)
      .json({ message: "Failed to fetch employee leaves", error: error });
  }
});

router.patch("/leave/:id", async (req, res) => {
  const leaveId = req.params.id;
  const updates = req.body;

  try {
    const existingLeave = await Leave.findById(leaveId);
    if (!existingLeave) {
      return res.status(404).json({ message: "Leave request not found" });
    }

    if (updates.status === "cancelled" && existingLeave.status === "ended") {
      return res
        .status(400)
        .json({ message: "Cannot cancel leave that has already ended." });
    }

    const updatedLeave = await Leave.findByIdAndUpdate(leaveId, updates, {
      new: true,
      runValidators: true,
    });
    if (!updatedLeave) {
      return res.status(404).json({ message: "Leave request not found" });
    }
    res.status(200).json(updatedLeave);
  } catch (error) {
    if (error.name === "ValidationError") {
      const errors = {};
      for (const field in error.errors) {
        errors[field] = error.errors[field].message;
      }
      return res
        .status(400)
        .json({ errors: errors, message: "Leave Validation Error" });
    }
    console.error("Error updating leave:", error);
    res.status(500).json({ message: "Failed to update leave", error: error });
  }
});

router.get("/leaves", authenticateToken, async (req, res) => {
  try {
    const userId = req.headers["user-id"];
    debugger;
    if (!userId) {
      return res.status(400).json({ error: "User ID is required in headers" });
    }

    const limit = parseInt(req.query.limit) || 10;
    const skip = parseInt(req.query.skip) || 0;
    const status = req.query.status;

    const query = {};
    if (status) query.status = status;

    const leaves = await Leave.find(query).skip(skip).limit(limit);
    //.select("userId status");

    res.json(leaves);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
