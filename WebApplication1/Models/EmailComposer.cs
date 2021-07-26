using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Web;
using Assignment1.Models;
using MailKit.Net.Smtp;
using MimeKit;

namespace WebApplication1.Models
{
    public class EmailComposer
    {
        // EmailComposer class has been created to send confimation links to user email.
        // IMPORTANT -> if something went wrong with sending the email to the users mailbox -> it automatically confims it.
        public void SendEmail(string userEmail, string fullName)
        {
            try
            {

                string activationLink = "https://proj.ruppin.ac.il/bgroup67/test2/tar6/Pages/activate.html?userEmail=" + userEmail;
                var mailMessage = new MimeMessage();
                mailMessage.From.Add(new MailboxAddress("TvShowProject", "BackendMoviesProject@gmail.com"));
                mailMessage.To.Add(new MailboxAddress("to name", userEmail));
                mailMessage.Subject = "Account Confirmation";
                var builder = new BodyBuilder();
                builder.HtmlBody = string.Format(@"<p>Hey {0},<br>
                    <p>Please click on the link down below to fully activate your new account! (please wait until the link closes automatically)
                    <br>
                    <a href='{1}'>Click Here!</a>", fullName, activationLink);
                mailMessage.Body = builder.ToMessageBody();
                using (var smtpClient = new SmtpClient())
                {
                    System.Net.ServicePointManager.SecurityProtocol = SecurityProtocolType.Tls12;
                    smtpClient.Connect("smtp.gmail.com", 465, true);
                    smtpClient.Authenticate("BackendMoviesProject@gmail.com", "PZiBFHngrsaEhvMB");
                    smtpClient.Send(mailMessage);
                    smtpClient.Disconnect(true);
                }
            }

            catch (Exception e)
            {
                ExceptionLogging.SendErrorToText(e);
                User ue = new User();
                ue.Activate(userEmail);
            }
        }
    }
}