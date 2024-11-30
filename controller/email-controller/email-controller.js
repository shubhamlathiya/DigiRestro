const emailTransporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "shubhamlathiya2021@gmail.com",
    pass: "hzhjhzfoapwleyha",
  },
});

// Function to send email
module.exports = {
  sendEmail: async (to, subject, text) => {
    try {
      // console.log("7777");
      const mailOptions = {
        from: '"shubhamlathiya2021@gmail.com"',
        to: to,
        subject: subject,
        text: `Hello `,
        html: `<b>${text} </p>`,
      };

      await emailTransporter.sendMail(mailOptions);
      // console.log("87878787");
      console.log(`Email sent to ${to}`);
      return true;

    } catch (error) {
      return false;
      console.error("Error sending email:", error);
    }
  },
};
