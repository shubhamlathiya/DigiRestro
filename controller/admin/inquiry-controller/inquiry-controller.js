const contactUs = require("../../../modules/contact-us-model");

module.exports = {
  viewInquiry: async (req, res) => {
    try {
      // const viewInqData = await contactUsSchema.find();
      const viewInqData = await contactUsSchema.find().sort({ created_at: -1 });
      res.render(`${appPath}/admin/view-query.ejs`, { viewInqData });
    } catch (error) {
      console.log("viewInquiry Error:", error);
    }
  },
  sendEnquiryReply: async (req, res) => {
    // console.log(     req.body.email_id,
    //     req.body.subject,
    //     req.body.text);
    const sendEmailBool = await emailController.sendEmail(
      req.body.email_id,
      req.body.subject,
      req.body.text
    );
    if (sendEmailBool) {
      module.exports.viewInquiry(req, res);
      // console.log("Mail send to " , req.body.email_id);
    } else {
      console.log("Failed to send mail to");
    }
  },
};