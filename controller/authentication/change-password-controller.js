module.exports = {
  changePassword: async (req, res) => {
    try {
      console.log(req.body);
      const userId = await tokenController.getUserID(req, res);
      const usersData = await usersSchema
        .find({ _id: userId })
        .select("password");
      console.log(usersData[0].password);

      if (req.body.new_password == req.body.confirm_password) {
        if (usersData) {
          const salt = await bcrypt.genSalt(10);
          const userEnteredOldPasword = await bcrypt.hash(req.body.password, salt);
          bcrypt.compare(
            req.body.password,
            usersData[0].password,
            async (err, isMatch) => {
              if (isMatch) {
                const userEnteredNewPasword = await bcrypt.hash(req.body.new_password, salt);
                const upadtePassword = await usersSchema.updateOne(
                    {_id: userId},
                    {
                        $set:{
                            password:userEnteredNewPasword
                        }
                    }
                );
                if(upadtePassword.acknowledged){
                    res.redirect("/home/auth-login");
                }
              } else {
                console.log("Password is not matched");
              }
            }
          );
        }
      }else{
        console.log("New password and confirm password is not same");
      }
    } catch (error) {
      console.log("changePassword error: ", error);
    }
  },
};
