const mongoose = require("mongoose");

const leavesSchema = new mongoose.Schema(
  {
    empId: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" },
    type: {
      type: String,
      required: true,
      enum: ["annual", "casual", "sick"],
    },
    duration: {
      type: Number,
      required: true,
      min: 0, 
      validate: {
        validator: Number.isInteger,
        message: "{VALUE} is not an integer value for duration.",
      },
    },
    status: {
      type: String,
      enum: ["inprogress", "cancelled", "ended"],
      default: "inprogress",
    },
    empBukupId: {
      type: Number,
      ref: "Employee", 
      validate: {
        validator: async function (value) {
          if (!value) return true; 
          if (value === this.empId) {
            return false; 
          }
          const employee = await Employee.findOne({ empId: value });
          return !!employee; 
        },
        message: "empBukupId must be a different valid Employee ID.",
      },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Leave", leavesSchema);
///leaves?limit=5&skip=0&status=inprogress