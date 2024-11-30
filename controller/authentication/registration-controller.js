const { default: mongoose } = require("mongoose");
const { generate } = require("otp-generator");
const Razorpay = (module.exports = require("razorpay"));
// var sharedData = null;
const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_ID_KEY,
  key_secret: process.env.RAZORPAY_SECRET_KEY,
});
module.exports = {
  registerUser: async (req, res) => {
    // sharedData = req.body;
    // console.log("1");
    
    await checkAlresdyUserExsist(req, res);
    // console.log("2");
  },
  registerCompany: async (req, res) => {
    await saveCompany(req, res);
  },
  registerBranch: async (req, res) => {
    // console.log("Branch: " , req.body);
    console.log("USer session:", req.session.userID);
    console.log("Company session:", req.session.companyID);
    if (
      !(
        _.isUndefined(req.session.companyID) ||
        _.isUndefined(req.session.userID)
      )
    ) {
      const userTableInstance = {
        name: req.body.name,
        email_id: req.body.email_id,
        mobile_no: req.body.mobile_no,
        image: req.body.image,
        password: req.body.password,
      };
      userTableInstance.role_name = "B";
      const branchTableInstance = {
        branch_name: req.body.branch_name,
        street_address: req.body.street_address,
        country: req.body.country,
        state: req.body.state,
        city: req.body.city,
        gst_no: req.body.gst_no,
        pin_code: req.body.pin_code,
      };
      req.body = userTableInstance;
      console.log("sdsdsssdsd: ", branchTableInstance);
      const result = await saveUser(req, res);
      if (result) {
        console.log("Branch user: ", result);

        req.body = branchTableInstance;
        req.body.company_id = req.session.companyID;
        req.body.user_id = req.session.userID;
        console.log("Branch data: ", req.body);
        await saveBranch(req, res);
      }
    } else {
      console.log("Filed to register");
    }
  },
  resendOTP: async (req, res) => {
    console.log("Session userData: ", req.session.userData);
    req.body = req.session.userData;
    console.log("req.body: ", req.body);
    const getOTP = await sendMail(req, res);
    await setOTPSession(req, res, getOTP);
    res.redirect("/home/otp");
  },
  userOtpVerification: async (req, res) => {
    if (
      !(
        _.isNull(req.session.userData) ||
        _.isUndefined(req.session.userData) ||
        _.isEmpty(req.session.userData)
      )
    ) {
      const result = await otpVerification(req, res);
      if (result) {
        // console.log("Yesssssssssss", enteredOTP);
        console.log("session data :", req.session.otp);
        console.log("User Session data is: ", req.session.userData);
        req.body = req.session.userData;
        const result = await saveUser(req, res);
        if (result) {
          req.session.subscriptionID = req.session.userData.id;
          console.log("subscription ID: ", req.session.subscriptionID);

          res.status(200).send({
            success: true,
          });
        } else {
          res.status(400).send({
            success: false,
          });
        }
      } else {
        console.log("OTP is Not matched");
      }
    }
  },
  registerPurchasedSubscription: async (req, res) => {
    console.log("registerPurchasedSubscription: ", req.session.subscriptionID);
    console.log("registerPurchasedSubscription", req.session.branchID);
    if (
      !(
        _.isUndefined(req.session.subscriptionID) ||
        _.isUndefined(req.session.branchID)
      )
    ) {
      const findSubscriptionData = await subscriptionSchema.find(
        { _id: req.session.subscriptionID },
        { duration: 1, price: 1, _id: 0 }
      );
      console.log(findSubscriptionData);
      const startDate = new Date();
      const endDate = new Date();

      // console.log(endDate.getMonth());
      // console.log(findSubscriptionData[0].duration);
      endDate.setMonth(endDate.getMonth() + findSubscriptionData[0].duration);
      // console.log(endDate);

      // console.log(startDate);
      const purchasedData = {
        plan_id: req.session.subscriptionID,
        branch_id: req.session.branchID,
        duration: findSubscriptionData[0].duration,
        price: findSubscriptionData[0].price,
        start_date: startDate,
        end_date: endDate,
      };
      console.log(purchasedData);
      const data = new purchaseSubscriptionSchema(purchasedData);
      const result = await data.save();
      if (!(_.isUndefined(result) || _.isNull(result) || _.isEmpty(result))) {
        console.log("User ID:", req.session.userID);
        console.log("User ID:", req.session.branchID);
        console.log("User ID:", req.session.subscriptionID);
        const activeBranchUser = await usersSchema.updateOne(
          { _id: req.session.userID },
          { $set: { is_active: true } }
        );
        if (
          activeBranchUser.acknowledged &&
          activeBranchUser.modifiedCount == 1
        ) {
          console.log(activeBranchUser);
          console.log("branch ID:", req.session.branchID);
          var getUserId = await branchSchema.aggregate([
            {
              $match: {
                _id: new mongoose.Types.ObjectId(req.session.branchID),
              },
            },
            {
              $lookup: {
                from: "company", // Replace with the actual name of your company collection
                localField: "company_id",
                foreignField: "_id",
                as: "company",
              },
            },
            {
              $unwind: "$company",
            },
            {
              $project: {
                user_id: "$company.user_id",
                _id: 0, // Include only the user_id from the company collection
              },
            },
          ]);

          if (
            !(
              _.isUndefined(getUserId) ||
              _.isNull(getUserId) ||
              _.isEmpty(getUserId)
            )
          ) {
            const activeCompanyUser = await usersSchema.updateOne(
              { _id: getUserId[0].user_id.toString() },
              { $set: { is_active: true } }
            );
            if (
              activeCompanyUser.acknowledged &&
              activeCompanyUser.modifiedCount == 1
            ) {
              console.log(activeCompanyUser);
              console.log("You are totally activated");
              res.redirect("/home/auth-login");
            } else {
              console.log(
                "You Company login is not activated, Branch is activated"
              );
            }
          }
        }
      }
    } else {
      console.log(
        "Subscription and branch id is undefined: Now Please register from login page"
      );
    }
  },
};

const otpVerification = function (req, res) {
  const enteredOTP =
    req.body.first +
    req.body.second +
    req.body.third +
    req.body.fourth +
    req.body.fifth +
    req.body.sixth;
  if (_.isEqual(enteredOTP, req.session.otp)) {
    return true;
    // res.redirect("/home/company")
    // delete req.session.otp;
    // console.log("destroyed session data :", req.session.otp);

    // console.log("shared:", sharedData.id);

    // const subscriptionDetails = await subscriptionSchema.find(
    //   { _id: sharedData.id },
    //   { price: 1, _id: 0 }
    // );

    // const amount = subscriptionDetails[0].price * 100;
    // const options = {
    //   amount: amount,
    //   currency: "INR",
    // };

    // razorpayInstance.orders.create(options, (err, order) => {
    //   if (!err) {
    //     res.status(200).send({
    //       success: true,
    //       msg: "Subscriptions Created",
    //       order_id: order.id,
    //       amount: amount,
    //       key_id: process.env.RAZORPAY_ID_KEY,
    //     });
    //   } else {
    //     res
    //       .status(400)
    //       .send({ success: false, msg: "Something went wrong!" });
    //   }
    // });
  } else {
    return false;
  }
};
const saveBranch = async function (req, res) {
  console.log("save: ", req.body);
  const data = new branchSchema(req.body);
  const result = await data.save();
  if (!(_.isEmpty(result) || _.isNull(result) || _.isUndefined(result))) {
    req.session.branchID = result._id.toString();
    console.log("Subscription ID in saveBranch: ", req.session.subscriptionID);
    const subscriptionDetails = await subscriptionSchema.find(
      { _id: req.session.subscriptionID },
      { price: 1, _id: 0 }
    );

    const amount = subscriptionDetails[0].price * 100;
    const options = {
      amount: amount,
      currency: "INR",
    };

    razorpayInstance.orders.create(options, (err, order) => {
      if (!err) {
        res.status(200).send({
          success: true,
          msg: "Subscriptions Created",
          order_id: order.id,
          amount: amount,
          key_id: process.env.RAZORPAY_ID_KEY,
        });
      } else {
        res.status(400).send({ success: false, msg: "Something went wrong!" });
      }
    });
    // res.redirect("/home/auth-login");
  } else {
    console.log("Branch is not registered. Please do it from login");
  }
};

const saveCompany = async function (req, res) {
  // req.body = {
  //   company_name: req.body.company_name,
  // legal_name: req.body.legal_name,
  // user_id: req.session.userID,
  // company_logo: req.body.company_logo
  // }
  req.body.user_id = req.session.userID;
  const data = new companySchema(req.body);
  const result = await data.save();
  if (!(_.isNull(result) || _.isUndefined(result) || _.isEmpty(result))) {
    // console.log("Company result is: " , result._id.toString());
    req.session.companyID = result._id.toString();
    res.redirect("/home/branch");
  }
  // console.log("Company details is: ", req.body);
};

const checkAlresdyUserExsist = async function (req, res) {
  req.body.email_id = req.body.email_id.trim().toLowerCase();
  req.body.mobile_no = req.body.mobile_no.trim();
  req.body.role_name = "O";

  //Find same User exist or not
  var data = await usersSchema.find(
    {
      $or: [{ email_id: req.body.email_id }, { mobile_no: req.body.mobile_no }],
    },
    { email_id: 1, mobile_no: 1, _id: 0 }
  );

  // Lodash is used for check _.isUndefined()
  if (_.isUndefined(data) || _.isEmpty(data) || _.isNull(data)) {
    //Same User not found
    // console.log("3");
    const getOTP = await sendMail(req, res);
    // console.log("4");
    if (!_.isNull(getOTP)) {
      // console.log("Touy jhbsjdbc: " + getOTP);
      // req.session.otp = getOTP;
      console.log("settttttt:", getOTP);
      await setOTPSession(req, res, getOTP);
      req.session.userData = req.body;
      console.log("Pruthil: ", req.body);
      res.redirect("/home/otp");
    }

    //save User
    // await saveUser(req, res, data);
    // console.log("5");
  } else {
    // Same User found
    await sameUserFound(req, res, data);
  }
};

//sendMail
const sendMail = async function (req, res) {
  try {
    //Send mail
    // console.log("6");
    //Mail subject
    const mailSubject = "OTP";

    //Generate OTP
    const otp = generate(6, {
      digits: true,
      alphabets: false,
      upperCase: false,
      specialChars: false,
    });

    console.log("Generated OTP:", otp);
    // const mailText = `${otp}`;
    const mailText = `
    <html lang="en">
<head>
    <meta charset="UTF-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    
        <title>Email Verification</title>
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Nunito&display=swap" rel="stylesheet">
        <style>
            a {
                color: #365cce;
                text-decoration: none;
            }
    
            .footertext {
                font-size: 12px;
            }
    
            @media (min-width: 640px) {
                .footertext {
                    font-size: 16px;
                }
            }
        </style>
    </head>
    <body>
    <div style="background-color:; display: flex; align-items: center; justify-content: center; flex-direction: column; margin-top: 1rem; font-family: Nunito, sans-serif">
        <section style="max-width: 42rem; background-color: #fff;">
            <div style="height: 250px; background-color: #6b55faff; width: 100%; color: #fff; display: flex; align-items: center; justify-content: center; flex-direction: column; gap: 1.25rem;">
                <img src="./logo.png" style="width: 100px;" alt="DigiRestro">
                <div style="display: flex; align-items: center; gap: 0.75rem;">
                    <div style="width: 2.5rem; height: 1px; background-color: #fff;"></div>
                    <svg stroke="currentColor"
                         fill="currentColor"
                         stroke-width="0"
                         viewBox="0 0 24 24"
                         height="20"
                         width="20"
                         xmlns="http://www.w3.org/2000/svg">
                        <path fill="none" d="M0 0h24v24H0V0z"></path>
                        <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 14H4V8l8 5 8-5v10zm-8-7L4 6h16l-8 5z"></path>
                    </svg>
                    <div style="width: 2.5rem; height: 1px; background-color: #fff;"></div>
                </div>
                <div style="display: flex; flex-direction: column; gap: 1.25rem;">
                    <div style="text-align: center; font-size: 14px; font-weight: normal;">THANKS FOR REGISTRATION!</div>
                    <div style="font-size: 24px; font-weight: bold; text-transform: capitalize; text-align :center">
                        Verify your E-mail Address
                    </div>
                </div>
            </div>
            <main style="margin-top: 2rem; padding-left: 1.25rem; padding-right: 1.25rem;">
                <h4 style="color: #374151;">Hello My dear,</h4>
                <p style="line-height: 1.5; color: #4b5563;">
                    Please use the following One Time Password(OTP)
                </p>
                <div style="display: flex; align-items: center; justify-content: center;">
                    <button style="padding-left: 1.25rem; padding-right: 1.25rem; padding-top: 0.5rem; padding-bottom: 0.5rem; font-size: 25px; font-weight: bold; text-transform: capitalize; background-color: #f97316; color: #fff; transition-property: background-color; transition-duration: 300ms; transform: none; border-radius: 0.375rem; border-width: 1px; border: none; outline: none; cursor: pointer;">
                        ${otp}
                    </button>
                </div>
                <p style="margin-top: 1rem; line-height: 1.75; color: #4b5563;">
                    This otp will only be valid for the
                    <span style="font-weight: bold;"> 3 minutes</span>. If the otp
                    does not work, you can resend otp.
                </p>
    
                <p style="margin-top: 2rem; color: #4b5563; ">
                    Thank you, <br/>
                    DigiRestro Team
                </p>
            </main>
            <footer style="margin-top: 2rem;">
                <div style="background-color: rgba(209, 213, 219, 0.6); height: 200px; display: flex; flex-direction: column; gap: 1.25rem; justify-content: center; align-items: center;">
                    <div style="text-align: center; display: flex; flex-direction: column; gap: 0.75rem;">
                        <h1 style="color: #6b55faff; font-weight: bold;  font-size: 20px; letter-spacing : 2px;">Get in
                            touch</h1>
                        <a href="tel:+91-848-883-8308" style="color: #4b5563;" alt="+91-848-883-8308">+91-884-928-8573</a>
                        <a href="mailto:sales@infynno.com" style="color: #4b5563;" alt="sales@infynno.com">infp@digirestro.com</a>
                    </div>
                    <div style="display: flex; align-items: center; justify-content: center; gap: 0.75rem;">
                        <a href="#_">
                            <svg stroke="currentColor"
                                 fill="gray"
                                 stroke-width="0"
                                 viewBox="0 0 16 16"
                                 height="18"
                                 width="18"
                                 xmlns="http://www.w3.org/2000/svg">
                                <path d="M16 8.049c0-4.446-3.582-8.05-8-8.05C3.58 0-.002 3.603-.002 8.05c0 4.017 2.926 7.347 6.75 7.951v-5.625h-2.03V8.05H6.75V6.275c0-2.017 1.195-3.131 3.022-3.131.876 0 1.791.157 1.791.157v1.98h-1.009c-.993 0-1.303.621-1.303 1.258v1.51h2.218l-.354 2.326H9.25V16c3.824-.604 6.75-3.934 6.75-7.951z"></path>
                            </svg>
                        </a>
                        <a href="#_">
                            <svg stroke="currentColor"
                                 fill="gray"
                                 stroke-width="0"
                                 viewBox="0 0 1024 1024"
                                 height="18"
                                 width="18"
                                 xmlns="http://www.w3.org/2000/svg">
                                <path d="M512 378.7c-73.4 0-133.3 59.9-133.3 133.3S438.6 645.3 512 645.3 645.3 585.4 645.3 512 585.4 378.7 512 378.7zM911.8 512c0-55.2.5-109.9-2.6-165-3.1-64-17.7-120.8-64.5-167.6-46.9-46.9-103.6-61.4-167.6-64.5-55.2-3.1-109.9-2.6-165-2.6-55.2 0-109.9-.5-165 2.6-64 3.1-120.8 17.7-167.6 64.5C132.6 226.3 118.1 283 115 347c-3.1 55.2-2.6 109.9-2.6 165s-.5 109.9 2.6 165c3.1 64 17.7 120.8 64.5 167.6 46.9 46.9 103.6 61.4 167.6 64.5 55.2 3.1 109.9 2.6 165 2.6 55.2 0 109.9.5 165-2.6 64-3.1 120.8-17.7 167.6-64.5 46.9-46.9 61.4-103.6 64.5-167.6 3.2-55.1 2.6-109.8 2.6-165zM512 717.1c-113.5 0-205.1-91.6-205.1-205.1S398.5 306.9 512 306.9 717.1 398.5 717.1 512 625.5 717.1 512 717.1zm213.5-370.7c-26.5 0-47.9-21.4-47.9-47.9s21.4-47.9 47.9-47.9 47.9 21.4 47.9 47.9a47.84 47.84 0 0 1-47.9 47.9z"></path>
                            </svg>
                        </a>
                        <a href="#_">
                            <svg stroke="currentColor"
                                 fill="gray"
                                 stroke-width="0"
                                 viewBox="0 0 16 16"
                                 height="16"
                                 width="16"
                                 xmlns="http://www.w3.org/2000/svg">
                                <path d="M0 1.146C0 .513.526 0 1.175 0h13.65C15.474 0 16 .513 16 1.146v13.708c0 .633-.526 1.146-1.175 1.146H1.175C.526 16 0 15.487 0 14.854V1.146zm4.943 12.248V6.169H2.542v7.225h2.401zm-1.2-8.212c.837 0 1.358-.554 1.358-1.248-.015-.709-.52-1.248-1.342-1.248-.822 0-1.359.54-1.359 1.248 0 .694.521 1.248 1.327 1.248h.016zm4.908 8.212V9.359c0-.216.016-.432.08-.586.173-.431.568-.878 1.232-.878.869 0 1.216.662 1.216 1.634v3.865h2.401V9.25c0-2.22-1.184-3.252-2.764-3.252-1.274 0-1.845.7-2.165 1.193v.025h-.016a5.54 5.54 0 0 1 .016-.025V6.169h-2.4c.03.678 0 7.225 0 7.225h2.4z"></path>
                            </svg>
                        </a>
                    </div>
                </div>
                <div style="background-color: #6b55faff; padding-top :10px; padding-bottom : 10px; color: #fff; text-align: center;">
                    <p class="footertext">© 2024 DigiRestro. All Rights Reserved.</p>
                </div>
            </footer>
        </section>
    </div>
    </body>
    </html>`;
    // console.log("Emaillll:",req.body.email_id);
    console.log("req.body: ", req.body);
    if (
      !(_.isUndefined(req.body) || _.isNull(req.body) || _.isEmpty(req.body))
    ) {
      const sendEmailBool = await emailController.sendEmail(
        req.body.email_id,
        mailSubject,
        mailText
      );
      console.log("sendEmailBool:", sendEmailBool);
      if (sendEmailBool) {
        return otp;
      } else {
        return null;
      }
    } else {
      console.log("Sorry, Please fill the your information again.");
    }
    //call sendEmail from controller
  } catch (error) {
    console.log("Send email: " + error);
  }
};

const saveUser = async function (req, res) {
  try {
    const salt = await bcrypt.genSalt(10);
    req.body.password = await bcrypt.hash(req.body.password, salt);
    // console.log(req.file);
    // const imagePath = req.file;

    data = new usersSchema(req.body);

    const result = await data.save();
    // console.log("Result: " , result);
    // console.log(result);
    if (_.isNull(result) || _.isUndefined(result) || _.isEmpty(result)) {
      const alertMessage = "Sorry, Not registered. Please try again";

      await setErrorAlert(req, res, alertMessage);
      // res.redirect("/home/subscription");
      return false;
    } else {
      req.session.userID = result._id.toString();
      console.log("session userID: ", req.session.userID);
      count = 0;
      return true;
      // return result
      // res.redirect("/home/auth-login");
    }
  } catch (error) {
    console.log("saveUSer:" + error);
  }
};

const sameUserFound = async function (req, res, data) {
  try {
    data.forEach((user) => {
      if (user.email_id == req.body.email_id) {
        emailMatch = true;
      }
      if (user.mobile_no == req.body.mobile_no) {
        phoneMatch = true;
      }
    });
    if (emailMatch && phoneMatch) {
      emailMatch = false;
      phoneMatch = false;
      globalMessage =
        "My Dear, User already exist with the same Email and Phone number.";
    } else if (emailMatch) {
      emailMatch = false;
      globalMessage = "My Dear, User already exist with the same Email";
    } else if (phoneMatch) {
      phoneMatch = false;
      globalMessage = "My Dear, User already exist with the same Phone Number";
    }
    await setErrorAlert(req, res, globalMessage);
    res.redirect("/home/subscription");
  } catch (error) {
    console.log("sameUSerFound: " + error);
  }
};

const setOTPSession = async function (req, res, getOTP) {
  try {
    req.session.otp = getOTP;
  } catch (error) {
    console.log("setOTPSessionError: " + error);
  }
};

const setErrorAlert = function (req, res, alertMessage) {
  try {
    req.session.alert = true;
    req.session.alertMessage = alertMessage;
  } catch (error) {
    console.log("registration-controller: setErrorAlert: " + error);
  }
};
