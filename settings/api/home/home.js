module.exports = {
  bind_Url: function () {
    app.get("/home", async (req, res) => {
      req.session.alert = false;
      // console.log(req.cookies.jwt); 
      // console.log(req.session.otp);
      // console.log(req.session.alert);
      homeController.homeSubscription(req, res);
    });

    app.get("/home/subscription", (req, res) => {
      if (!(_.isUndefined(req.query.id) || _.isNull(req.query.id))) {
        res.render(`${appPath}/home/subscription.ejs`, {
          session: req.session,
          id: req.query.id,
        });
      } else {
        res.redirect("/home");
      }
    });
    app.get("/home/otp", (req, res) => {
      res.render(`${appPath}/home/auth-otp.ejs`);
    });

    app.get("/home/auth-login", (req, res) => {
      res.render(`${appPath}/home/auth-login.ejs`, { session: req.session });
    });

    app.get("/home/company", (req, res) => {
      res.render(`${appPath}/home/company.ejs`);   
    }); 
    app.get("/home/branch" , (req,res)=>{
      res.render(`${appPath}/home/branch.ejs`);
    })

    app.post("/home/contact-us", (req, res) => {
      homeController.contactUs(req, res);

      // res.render(`${appPath}/home/auth-login.ejs`);
    });
    
  },
};
