const checkSubscriptionExpiry = async () => {
    // console.log("1")
    const currentTimestamp = new Date();

    console.log(currentTimestamp)

    const expiredSubscriptions = await purchaseSubscriptionSchema.find({
        $and: [{end_date: {$lte: currentTimestamp}}, {is_active: 'true'}]
    });

    // console.log(expiredSubscriptions)
    // console.log("2")
    for (const subscription of expiredSubscriptions) {
        if (subscription.end_date <= currentTimestamp) {
            subscription.is_active = 'false';
            await subscription.save();

            const branchData = await branchSchema.findOne({_id: subscription.branch_id});

            const userData = await usersSchema.findOne({_id: branchData.user_id})
            // user_id
            console.log(`Subscription for this one Branch ${userData.name} has expired.`);
            const reminderSubject = "Subscription expired"
            const reminderText = `<html lang="en">
            <head>
                <meta charset="UTF-8"/>
                <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
                <title>Subscription Expired</title>
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
                        <img src="../Home/assets/img/logo.png" style="width: 100px;" alt="DigiRestro">
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
                            <div style="text-align: center; font-size: 14px; font-weight: normal;">THANKS FOR SUBSCRIPTION!</div>
                            <div style="font-size: 24px; font-weight: bold; text-transform: capitalize; text-align :center">
                                Your Subscription is Expired.
                            </div>
                        </div>
                    </div>
                    <main style="margin-top: 2rem; padding-left: 1.25rem; padding-right: 1.25rem;">
                        <h4 style="color: #374151;">${userData.name},</h4>
                        <p style="line-height: 1.5; color: #4b5563;">
                            Please Resubscribe use the following link
                            <a href="#" style="font-weight: bold;">Purchase Subscription</a>. If the link
                            does not work, you can login to Purchase Subscription.
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

            const emailSent = await emailController.sendEmail(userData.email_id, reminderSubject, reminderText);
            // console.log("hy")
            console.log(emailSent)
        } else {
            // subscription.status = 'active';
            // await subscription.save();
            console.log(`Subscription for customer ${subscription.customerId} is still active, but the end date has passed.`);
        }
        // console.log("3")
    }
    // console.log("4")
};


module.exports = checkSubscriptionExpiry;