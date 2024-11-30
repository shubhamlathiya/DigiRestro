const tokenController = require("../../token-controller");

module.exports = {
  profileDetails: async (req, res) => {
    try {
      const userId = await tokenController.getUserID(req, res);
      const usersData = await usersSchema
        .find({ _id: userId })
        .select("name email_id mobile_no");
      // res.send(usersData);
      console.log(usersData);
      res.render(`${appPath}/admin/profile.ejs`, { usersData });
    } catch (error) {
      // res.send("viewProfile error:" , error);
      console.log("viewProfile error: ", error);
    }
  },
  fetchUserName: async (req, res) => {
    try {
      const userId = await tokenController.getUserID(req, res);
      const userName = await usersSchema.find({ _id: userId }).select("name");
      console.log(userName[0].name);
      res.status(200).send({
        success: true,
        userName: userName[0].name.toString(),
      });
    } catch (error) {
      console.log("fetchUserName error: ", error);
    }
  },
  updateProfileDetails: async (req, res) => {
    const userId = await tokenController.getUserID(req, res);
    const updateUsersData = await usersSchema.updateOne(
      { _id: userId },
      {
        $set: {
          name: req.body.name,
          email_id: req.body.email_id,
          mobile_no: req.body.mobile_no
        },
      }
    );
    // res.send(usersData);
    if(updateUsersData.acknowledged){
      res.redirect("/admin/profile");
    }else{
      console.log("Data is ont update");
    }
    // console.log(req.body);
  },
};
