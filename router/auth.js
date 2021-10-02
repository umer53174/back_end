const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("../db/conn");
const ObjectID = require("mongodb").ObjectId;
const Section = require("../models/Section");
const Student = require("../models/students");
const UserRoles = require("../models/UserRoles");
const { request, response } = require("express");
const Privilege = require("../models/Privilages");

router.post("/register", async (req, res) => {
  console.log(req.body);

  const { fname, lname, email, password, role_id } = req.body;
  let roles_ids = new ObjectID(role_id);

  if (!fname || !lname || !email || !password) {
    return res.status(422).json({ error: "Please Filled the Field properly" });
  }
  try {
    const section = await Section.aggregate([
      {
        $lookup: {
          from: "privileges",
          localField: "_id",
          foreignField: "section_id",
          as: "sections",
        },
      },
    ]);

    const defaultprev = HandleObject(section);
    const userExist = await Student.findOne({ email: email });
    if (userExist) {
      return res.status(422).json({ error: "Email already Exist" });
    }
    const user = new Student({
      fname,
      lname,
      email,
      password,
      roles_ids,
      defaultprev,
    });
    await user.save();
    res.status(201).json({ message: "User register sucessfully" });
  } catch (err) {
    console.log(err);
  }
});

router.post("/signin", async (req, res) => {
  let token;
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(422)
        .json({ error: "Please Filled the Field properly" });
    }
    const userLogin = await Student.findOne({ email: email });

    if (userLogin) {
      const isMatch = await bcrypt.compare(password, userLogin.password);
      //
      token = await userLogin.generateAuthToken();
      res.cookie("jwtoken", token, {
        expires: new Date(Date.now() + 25892000000),
        httpOnly: true,
      });
      if (!isMatch) {
        res.status(400).json({ error: "invalid  Username or password" });
      } else {
        let getRole = await UserRoles.findOne({_id: userLogin.roles_ids})
        res.json({ message: "SucessFully...!", token, userLogin, role: getRole.title });
      }
    } else {
      res.status(400).json({ error: "invalid  Username or password" });
    }
  } catch (err) {}
});

router.post("/getuserinfo", async (request, response) => {
  try {
    const page = request.body.page;
    const rowsPerPage = request.body.rowsPerPage;
    const counts = await Student.find().count();
    const user = await Student.aggregate([
      {
        $lookup: {
          from: "userroles",
          localField: "roles_ids",
          foreignField: "_id",
          as: "userroles",
        },
      },
    ]);

    ////  console.log(user);
    response.send({ user, counts });
  } catch (err) {
    console.log(err);
  }
});
router.post("/delete", async (req, res) => {
  try {
    const { id } = req.body;
    console.log(id);

    const FindID = await Student.findByIdAndDelete({ _id: id });
    res.json(FindID);
  } catch (err) {
    console.log(err);
  }
});

router.post("/update", async (req, res) => {
  try {
    const { _id, fname, lname, email } = req.body;
    const FindID = await Student.findByIdAndUpdate(
      {
        _id: _id,
      },
      {
        fname: fname,
        lname: lname,
        email: email,
      }
    );
    res.json(FindID);
  } catch (err) {
    console.log(err);
  }
});

//// ADD ROLES BACKEND WORK
router.post("/addrole", async (req, res) => {
  const { title, descrip, defaultpreiv } = req.body;

  try {
    
    
    const section = await Section.aggregate([
      {
        $lookup: {
          from: "privileges",
          localField: "_id",
          foreignField: "section_id",
          as: "sections",
        },
      },
    ]);
    const defaultprev = HandleObject(section);
    const Roles = new UserRoles({ title, descrip, defaultprev });
    await Roles.save();
    res.status(201).json({ message: "Role Add Sucessfully..!" });
  } catch (err) {
    console.log(err);
  }
});

router.post("/getroles", async (req, res) => {
  try {
    const page = req.body.page;
    const rowsPerPage = req.body.rowsPerPage;
    const counts = await UserRoles.find().count();
    const user = await UserRoles.find()
      .skip(page * rowsPerPage)
      .limit(page);
    res.json({ user, counts });
  } catch (err) {
    console.log(err);
  }
});
router.post("/deleteroles", async (req, res) => {
  try {
    const { id } = req.body;

    const FindID = await UserRoles.findByIdAndDelete({ _id: id });
    res.json(FindID);
  } catch (err) {
    console.log(err);
  }
});

router.post("/updateroles", async (req, res) => {
  try {
    const { _id, title, descrip } = req.body;

    const FindID = await UserRoles.findByIdAndUpdate(
      {
        _id: _id,
      },
      {
        title: title,
        descrip: descrip,
      }
    );
    res.json(FindID);
  } catch (err) {
    console.log(err);
  }
});

///// Section///
router.post("/addsection", async (req, res) => {
  const { title, keys } = req.body;

  try {
    const section = new Section({ title, keys });
    await section.save();
    res.status(201).json({ message: "Role Add Sucessfully..!" });
  } catch (err) {
    console.log(err);
  }
});
router.post("/getsection", async (req, res) => {
  try {
    const page = req.body.page;
    const rowsPerPage = req.body.rowsPerPage;
    const counts = await Section.find().count();
    const section = await Section.find()
      .skip(page * rowsPerPage)
      .limit(page);
    res.json({ section, counts });
  } catch (error) {
    console.log(error);
  }
});
router.post("/deletesection", async (req, res) => {
  try {
    const { id } = req.body;
    const FindID = await Section.findByIdAndDelete({ _id: id });
    res.json(FindID);
  } catch (err) {
    console.log(err);
  }
});

router.post("/updatesection", async (req, res) => {
  try {
    const { _id, title, keys } = req.body;
    const FindID = await Section.findByIdAndUpdate(
      {
        _id: _id,
      },
      {
        title: title,
        keys: keys,
      }
    );
    res.json(FindID);
  } catch (err) {
    console.log(err);
  }
});

//// Priviledge///

router.post("/addpriveleges", async (req, res) => {
  const { title, keys, section_ids } = req.body;
  try {
    let section_id = new ObjectID(section_ids);
    const privelege = new Privilege({ title, keys, section_id });
    await privelege.save();
    res.status(201).json({ message: "Role Add Sucessfully..!" });
  } catch (err) {
    console.log(err);
  }
});
router.post("/deletepriveleges", async (req, res) => {
  try {
    const { id } = req.body;
    console.log(id);

    const FindID = await Privilege.findByIdAndDelete({ _id: id });
    res.json(FindID);
  } catch (err) {
    console.log(err);
  }
});

router.post("/getprivileges", async (request, response) => {
  try {
    const page = request.body.page;
    const rowsPerPage = request.body.rowsPerPage;
    const counts = await Privilege.find().count();
    const user = await Privilege.aggregate([
      {
        $lookup: {
          from: "sections",
          localField: "section_id",
          foreignField: "_id",
          as: "sections",
        },
      },
    ]);

    response.json({ user, counts });
  } catch (err) {
    console.log(err);
  }
});
router.post("/updateprivileges", async (req, res) => {
  try {
    const { _id, keys, title } = req.body;

    const FindID = await Privilege.findByIdAndUpdate(
      {
        _id: _id,
      },
      {
        keys: keys,
        title: title,
      }
    );
    res.json(FindID);
  } catch (err) {
    console.log(err);
  }
});

router.post("/getprivilegestypes", async (request, response) => {
  try {
    const _id = request.body.id;
    const userExist = await Student.findOne({ _id: _id });
    response.send(userExist);
  } catch (err) {
    console.log(err);
  }
});

const HandleObject = (data) => {
  let obj1 = {};
  obj1 = new Object();
  data.map((i) => {
    let obj2 = {};
    i.sections.map((item) => {
      obj2[item.keys] = false;
    });

    obj1[i.keys] = obj2;
    return obj1;
  });
  return obj1;
};

router.post("/updateprivilegestypes", async (req, res) => {
  try {
    const { _id, defaultprev } = req.body;
    const FindID = await Student.findByIdAndUpdate(
      {
        _id: _id,
      },
      {
        defaultprev: defaultprev,
      }
    );
    res.json(FindID);
  } catch (err) {
    console.log(err);
  }
});



router.post("/getrolesprivilegestypes", async (request, response) => {
  try {
    const _id = request.body.id;
    const userExist = await UserRoles.findOne({ _id: _id });
    response.send(userExist);
  } catch (err) {
    console.log(err);
  }
});

router.post("/updateroleprivilegestypes", async (req, res) => {
  try {
    const { _id, defaultprev } = req.body;
    const FindID = await UserRoles.findByIdAndUpdate(
      {
        _id: _id,
      },
      {
        defaultprev: defaultprev,
      }
    );
    res.json(FindID);
  } catch (err) {
    console.log(err);
  }
});
module.exports = router;
