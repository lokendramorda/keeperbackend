const express = require('express')
const User = require('../models/User')
const router = express.Router()
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs')
var jwt = require('jsonwebtoken');
const axios = require('axios')
const fetch = require('../middleware/fetchdetails');
const jwtSecret = "HaHa"
const MainData = require('../models/MainData');


router.post('/createuser', [
    body('email').isEmail(),
    body('password').isLength({ min: 5 }),
    body('name').isLength({ min: 3 })
], async (req, res) => {
    let success = false
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success, errors: errors.array() })
    }
    const salt = await bcrypt.genSalt(10)
    let securePass = await bcrypt.hash(req.body.password, salt);
    try {
        await User.create({
            name: req.body.name,
            password: securePass,
            email: req.body.email,
        }).then(user => {
            const data = {
                user: {
                    id: user.id
                }
            }
            const authToken = jwt.sign(data, jwtSecret);
            success = true
            res.json({ success, authToken })
        })
            .catch(err => {
                console.log(err);
                res.json({ error: "Please enter a unique value." })
            })
    } catch (error) {
        console.error(error.message)
    }
})


router.post('/login', [
    body('email', "Enter a Valid Email").isEmail(),
    body('password', "Password cannot be blank").exists(),
], async (req, res) => {
    let success = false
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }

    const { email, password } = req.body;
    try {
        let user = await User.findOne({ email });  
        if (!user) {
            return res.status(400).json({ success, error: "Try Logging in with correct credentials" });
        }

        const pwdCompare = await bcrypt.compare(password, user.password); 
        if (!pwdCompare) {
            return res.status(400).json({ success, error: "Try Logging in with correct credentials" });
        }
        const data = {
            user: {
                id: user.id
            }
        }
        success = true;
        const authToken = jwt.sign(data, jwtSecret);
        res.json({ success, authToken })


    } catch (error) {
        console.error(error.message)
        res.send("Server Error")
    }
})

router.post('/getuser', fetch, async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId).select("-password") 
        res.send(user)
    } catch (error) {
        console.error(error.message)
        res.send("Server Error")

    }
})



router.post('/upload', async (req, res) => {
  try {
    const { mainDataSet } = req.body;
    const { userEmail, simpleQuizData, comprehensionData } = mainDataSet;
    const formName = simpleQuizData.formName;
    const formImageBase64 = simpleQuizData.formImage; 
    const referenceBase64 = comprehensionData.referenceImage

    

    const existingMainData = await MainData.findOne({
      userEmail,
      'simpleQuizData.formName': formName,
    });

    if (existingMainData) {
      
      existingMainData.set(mainDataSet);
      const updatedMainData = await existingMainData.save();
      return res.status(200).json(updatedMainData);
    } else {
      
      const newMainData = new MainData(mainDataSet);
      const savedMainData = await newMainData.save();
      return res.status(201).json(savedMainData);
    }
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Error uploading main dataset' });
  }
});

  router.get('/preview', async (req, res) => {
    try {
      const { userEmail, formmName } = req.query;
  
     
      if (!userEmail || !formmName) {
        return res.status(400).json({ error: 'userEmail and formName are required query parameters' });
      }
  
      const mainData = await MainData.findOne({
        userEmail,
        'simpleQuizData.formName': formmName,
      });
  
      if (!mainData) {
        return res.status(404).json({ error: 'Form not found' });
      }
  
      res.json(mainData);
    } catch (error) {
      res.status(500).json({ error: 'Error fetching form data' });
    }
  });

  router.get("/formlist", async (req, res) => {
    try {
      const { userEmail } = req.query;
  
      const formDataList = await MainData.find({ "userEmail": userEmail });
  
      res.status(200).json(formDataList);
    } catch (error) {
      console.error("Error fetching form data:", error);
      console.log(error)
      res.status(500).json({ error: "Error fetching form data" });
    }
  });
  

  router.get("/user", async (req, res) => {
    try {
      const { email } = req.query;
  
      const userEmail = await User.find({ "email": email });
  
      res.status(200).json(userEmail);
    } catch (error) {
      console.error("Error fetching form data:", error);
      console.log(error)
      res.status(500).json({ error: "Error fetching form data" });
    }
  });

  router.post('/account', async (req, res) => {
    try {
      const { email, profileImgBase64 } = req.body;
  
     
      const user = await User.findOne({ email });
  
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
  
     
      if (profileImgBase64) {
        user.profileImg = profileImgBase64;
        await user.save();
      }
  
      return res.status(200).json({ message: 'Profile image updated successfully' });
    } catch (error) {
      console.error('Error updating profile image:', error);
      res.status(500).json({ error: 'Error updating profile image' });
    }
  });



  router.get("/account", async (req, res) => {
    const { email } = req.query;
  
    try {
      
      const user = await User.findOne({ email });
  
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
  
      res.json(user);
    } catch (error) {
      console.error("Error fetching user account:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

module.exports = router
