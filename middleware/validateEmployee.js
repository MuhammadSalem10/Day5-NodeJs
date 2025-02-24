const validateEmployee = (req, res, next) => {
    const { name, email, salary } = req.body;
    
    if (!name || !email || !salary) {
      return res.status(400).json({
        error: "Name, email, and salary are required fields"
      });
    }
  
    if (typeof name !== 'string' || name.length < 2) {
      return res.status(400).json({
        error: "Name must be at least 2 characters long"
      });
    }
  
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      return res.status(400).json({
        error: "Please provide a valid email address"
      });
    }
  
    next();
  };
  
  module.exports = validateEmployee;