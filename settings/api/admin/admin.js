const viewCompany = require("../../../controller/admin/company-controller/view-company");
const profileController = require("../../../controller/admin/profile-controller/profile-controller");
const subscriptionController = require("../../../controller/admin/subscription-controller/subscription-controller");
const tokenController = require("../../../controller/token-controller");

module.exports = {
  bind_Url: function () {
    app.get("/admin/dashboard", async (req, res) => {
      try {
        //Check logged-in user
        const callback = await tokenController.auth(req, res);

        if (callback.callback && _.isEqual(callback.role_name, "A")) {
          req.session.alert = false;
          res.render(`${appPath}/admin/index.ejs`);
        } else {
          res.redirect("/home/auth-login");
        }
      } catch (error) {
        res.send("/admin/dashboard error: ", error);
      }
    });

    app.get("/admin/view-subscription", async (req, res) => {
      try {
        //Check logged-in user
        const callback = await tokenController.auth(req, res);

        if (callback.callback && _.isEqual(callback.role_name, "A")) {
          subscriptionController.viewSubscription(req, res);
        } else {
          res.redirect("/home/auth-login");
        }
      } catch (error) {
        res.send("/admin/view-subscription error: ", error);
      }
    });

    app.get("/admin/add-subscription", async (req, res) => {
      try {
        //Check logged-in user
        const callback = await tokenController.auth(req, res);

        if (callback.callback && _.isEqual(callback.role_name, "A")) {
          res.render(`${appPath}/admin/add-subscription.ejs`);
        } else {
          res.redirect("/home/auth-login");
        }
      } catch (error) {
        res.send("/admin/add-subscription error: ", error);
      }
    });

    app.post("/admin/add-subscription", async (req, res) => {
      try {
        //Check logged-in user
        const callback = await tokenController.auth(req, res);

        if (callback.callback && _.isEqual(callback.role_name, "A")) {
          subscriptionController.addSubscription(req, res);
        } else {
          res.redirect("/home/auth-login");
        }
      } catch (error) {
        res.send("/admin/add-subscription error:" + error);
      }
    });
    app.get("/admin/subscription-plan", async (req, res) => {
      try {
        //Check logged-in user
        const callback = await tokenController.auth(req, res);

        if (callback.callback && _.isEqual(callback.role_name, "A")) {
          // res.render(`${appPath}/admin/master-subscription.ejs`);
          subscriptionController.viewSubscription(req, res);
        } else {
          res.redirect("/home/auth-login");
        }
      } catch (error) {
        res.send("/admin/add-subscription error:" + error);
      }
    });

    app.get("/admin/edit-subscription", async (req, res) => {
      try {
        //Check logged-in user
        const callback = await tokenController.auth(req, res);

        if (callback.callback && _.isEqual(callback.role_name, "A")) {
          subscriptionController.editSubsciption(req, res);
        } else {
          res.redirect("/home/auth-login");
        }
      } catch (error) {
        res.send("/admin/edit-subscription error: ", error);
      }
    });

    app.post("/admin/edit-subscription", async (req, res) => {
      try {
        //Check logged-in user
        const callback = await tokenController.auth(req, res);

        if (callback.callback && _.isEqual(callback.role_name, "A")) {
          subscriptionController.updateSubscription(req, res);
        } else {
          res.redirect("/home/auth-login");
        }
      } catch (error) {
        res.send("/admin/edit-subscription error: ", error);
      }
    });

    app.get("/admin/subscription-activeAndDeactive", async (req, res) => {
      const callback = await tokenController.auth(req, res);
      if (callback.callback && _.isEqual(callback.role_name, "A")) {
        console.log(req.query);
        subscriptionController.activeAndDeactive(req, res);
      } else {
        res.redirect("/home/auth-login");
      }
    });

    app.post("/admin/delete-subscription", async (req, res) => {
      try {
        //Check logged-in user
        const callback = await tokenController.auth(req, res);

        if (callback.callback && _.isEqual(callback.role_name, "A")) {
          subscriptionController.deleteSubsciption(req, res);
        } else {
          res.redirect("/home/auth-login");
        }
      } catch (error) {
        res.send("/admin/delete-subscription error: ", error);
      }
    });
    
    app.post("/admin/profile", async (req, res) => {
      try {
        const callback = await tokenController.auth(req, res);
        if (callback.callback && _.isEqual(callback.role_name, "A")) {
          profileController.profileDetails(req, res);
        } else {
          res.redirect("/home/auth-login");
        }
      } catch (error) {
        res.send("/admin/profile error: ", error);
      }
    });

    app.get("/admin/view-client", async (req, res) => {
      try {
        //Check logged-in user
        const callback = await tokenController.auth(req, res);

        if (callback.callback && _.isEqual(callback.role_name, "A")) {
          ownerController.viewClient(req, res);
        } else {
          res.redirect("/home/auth-login");
        }
      } catch (error) {
        res.send("/admin/view-client error: ", error);
      }
    });

    app.post("/admin/view-specific-company", async (req, res) => {
      try {
        const callback = await tokenController.auth(req, res);
        if (callback.callback && _.isEqual(callback.role_name, "A")) {
          companyControllerAdmin.viewSpecificCompany(req, res);
        } else {
          res.redirect("/home/auth-login");
        }
      } catch (error) {
        res.send("/admin/view-specific-company error: ", error);
      }
    });

    app.post("/admin/view-specific-branch", async (req, res) => {
      try {
        const callback = await tokenController.auth(req, res);
        if (callback.callback && _.isEqual(callback.role_name, "A")) {
          companyControllerAdmin.viewSpecificBranch(req, res);
        } else {
          res.redirect("/home/auth-login");
        }
      } catch (error) {
        res.send("/admin/view-specific-branch error: ", error);
      }
    });

    app.get("/admin/view-company", async (req, res) => {
      try {
        //Check logged-in user

        const callback = await tokenController.auth(req, res);

        if (callback.callback && _.isEqual(callback.role_name, "A")) {
          companyControllerAdmin.viewCompany(req, res);
          // res.render(`${appPath}/admin/view-company.ejs`);
        } else {
          res.redirect("/home/auth-login");
        }
      } catch (error) {
        res.send("/admin/view-company error: ", error);
      }
    });

    app.get("/admin/view-branch", async (req, res) => {
      try {
        //Check logged-in user
        const callback = await tokenController.auth(req, res);

        if (callback.callback && _.isEqual(callback.role_name, "A")) {
          res.render(`${appPath}/admin/view-branch.ejs`);
        } else {
          res.redirect("/home/auth-login");
        }
      } catch (error) {
        res.send("/admin/view-branch error: ", error);
      }
    });

    app.get("/admin/view-query", async (req, res) => {
      try {
        //Check logged-in user
        const callback = await tokenController.auth(req, res);

        if (callback.callback && _.isEqual(callback.role_name, "A")) {
          inquiryController.viewInquiry(req, res);

          // res.render(`${appPath}/admin/view-query.ejs`);
        } else {
          res.redirect("/home/auth-login");
        }
      } catch (error) {
        res.send("/admin/view-query error: ", error);
      }
    });

    app.get("/admin/profile", async (req, res) => {
      const callback = await tokenController.auth(req, res);
      if (callback.callback && _.isEqual(callback.role_name, "A")) {
        profileController.profileDetails(req, res);
      } else {
        res.redirect("/home/auth-login");
      }
    });

    app.get("/admin/fetchUserName", async (req, res) => {
      const callback = await tokenController.auth(req, res);
      if (callback.callback && _.isEqual(callback.role_name, "A")) {
        profileController.fetchUserName(req, res);
      } else {
        res.redirect("/home/auth-login");
      }
    });

    app.post("/admin/update-profile", async (req, res) => {
      const callback = await tokenController.auth(req, res);
      if (callback.callback && _.isEqual(callback.role_name, "A")) {
        profileController.updateProfileDetails(req, res);
      } else {
        res.redirect("/home/auth-login");
      }
    });

    app.get("/admin/tps-reports", async (req, res) => {
      const callback = await tokenController.auth(req, res);
      if (callback.callback && _.isEqual(callback.role_name, "A")) {
        tpsReportsController.thisMonthCompany(req, res);
      } else {
        res.redirect("/home/auth-login");
      }
    });

    app.get("/admin/email-inbox", async (req, res) => {
      const callback = await tokenController.auth(req, res);
      if (callback.callback && _.isEqual(callback.role_name, "A")) {
        res.render(`${appPath}/admin/email-inbox.ejs`);
      } else {
        res.redirect("/home/auth-login");
      }
    });

    app.get("/admin/email-compose", async (req, res) => {
      const callback = await tokenController.auth(req, res);
      if (callback.callback && _.isEqual(callback.role_name, "A")) {
        res.render(`${appPath}/admin/email-compose.ejs`);
      } else {
        res.redirect("/home/auth-login");
      }
    });

    app.get("/admin/email-read", async (req, res) => {
      const callback = await tokenController.auth(req, res);
      if (callback.callback && _.isEqual(callback.role_name, "A")) {
        res.render(`${appPath}/admin/email-read.ejs`);
      } else {
        res.redirect("/home/auth-login");
      }
    });

    app.get("/admin/purchased-subscription", async (req, res) => {
      const callback = await tokenController.auth(req, res);
      if (callback.callback && _.isEqual(callback.role_name, "A")) {
        subscriptionController.viewPurchasedSubscriptionPlan(req, res);
        // res.render(`${appPath}/admin/email-read.ejs`)
      } else {
        res.redirect("/home/auth-login");
      }
    });

    app.get("/admin/compose-email", async (req, res) => {
      try {
        const callback = await tokenController.auth(req, res);
        if (callback.callback && _.isEqual(callback.role_name, "A")) {
          const to = req.query.to;
          console.log(to);
          res.render(`${appPath}/admin/email-compose.ejs`, {to});
        } else {
          res.redirect("/home/auth-login");
        }
      } catch (error) {
        console.log("/admin/compose-email Error: " + error);
      }
    });

    app.post("/admin/send-enquiry-reply" , async(req,res)=>{
      try {
        const callback = await tokenController.auth(req,res);
        if(callback.callback && _.isEqual(callback.role_name,"A")){
          inquiryController.sendEnquiryReply(req,res);
          // console.log(req.body);
        }else{  
          res.redirect("/home/auth-login")
        }
      } catch (error) {
        console.log("/admin/send-enquiry-reply error: " , error);
      }
    })

    app.post("/admin/change-password", async (req, res) => {
      const callback = await tokenController.auth(req, res);
      if (callback.callback && _.isEqual(callback.role_name, "A")) {
        changePasswordController.changePassword(req, res);
      } else {
        res.redirect("/home/auth-login");
      }
    });
  },
};
