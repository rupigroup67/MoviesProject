using Assignment1.Models;
using MailKit.Net.Smtp;
using MimeKit;
using System;
using System.Collections.Generic;
using System.Data.SqlClient;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using WebApplication1.Models;

namespace Assignment1.Controllers
{
    public class UsersController : ApiController
    {
        // Checks if the email user typed has already exists.
        // This method been called when user trys to create new user or user trys to login.
        public HttpResponseMessage Get(string email)
        {
            try
            {
                User u = new User();
                if (u.EmailExists(email.ToLower()))
                {
                    return Request.CreateResponse(HttpStatusCode.OK, email + " was found");
                }
                return Request.CreateResponse(HttpStatusCode.NotFound, "Error, Email wasn't found in database");
            }
            catch (Exception e)
            {
                ExceptionLogging.SendErrorToText(e);
                return Request.CreateResponse(HttpStatusCode.Conflict, e);
            }
        }

        // Verifies that the correct username and password were typed.
        // if users account hasn't been fully activated -> resends confirmation link to his email.
        public HttpResponseMessage Get(string email, string password)
        {
            try
            {
                User u = new User();
                u = u.LogIn(email, password);
                if (u != null)
                {
                    if (u.EmailActivated)
                        return Request.CreateResponse(HttpStatusCode.OK, u);
                    else
                    {
                        EmailComposer ec = new EmailComposer();
                        ec.SendEmail(u.Email, u.Name + " " + u.Surname);
                        return Request.CreateResponse(HttpStatusCode.BadRequest, "Account hasn't been fully activated! Please check your email to proceed (Activation Email has been sent again!)");
                    }
                }
                else
                    return Request.CreateResponse(HttpStatusCode.NotFound, "Error, Wrong Password / Email");
            }
            catch (Exception e)
            {
                ExceptionLogging.SendErrorToText(e);
                return Request.CreateResponse(HttpStatusCode.Conflict, e);
            }

        }

        // Sends the user information to the database.
        // If users email still exists -> return a badRequest HttpStatusCode
        public HttpResponseMessage Post([FromBody] User u)
        {
            bool userCreated = true;
            int userId = -1;
            try
            {
                userId = u.Insert();
                return Request.CreateResponse(HttpStatusCode.OK, userId.ToString());
            }
            catch (SqlException sqlEx)
            {
                if (sqlEx.Number == 2627)
                {
                    userCreated = false;
                    return Request.CreateResponse(HttpStatusCode.BadRequest, "Error, user email <" + u.Email + "> already exists");
                }

                else
                    throw sqlEx;
            }
            catch (Exception e)
            {
                ExceptionLogging.SendErrorToText(e);
                return Request.CreateResponse(HttpStatusCode.Conflict, e);
            }
            finally
            {
                if (userCreated)
                {
                    EmailComposer ec = new EmailComposer();
                    ec.SendEmail(u.Email, u.Name + " " + u.Surname);
                }

            }
        }

        // Updates user account information
        public HttpResponseMessage Put([FromBody] User u)
        {
            try
            {
                u.Update();
                return Request.CreateResponse(HttpStatusCode.OK, "Users_2021");
            }
            catch (Exception e)
            {
                ExceptionLogging.SendErrorToText(e);
                return Request.CreateResponse(HttpStatusCode.BadRequest, "Error updating user fields");
            }
        }

        // deleteUser function gets userId and changes his 'active' field to false
        [HttpGet]
        [Route("api/Users/deleteUser")]
        public HttpResponseMessage deleteUser(int userId)
        {
            try
            {
                User u = new User();
                u.DeleteUser(userId);
                return Request.CreateResponse(HttpStatusCode.OK, "Users_2021");
            }
            catch (Exception e)
            {
                ExceptionLogging.SendErrorToText(e);
                return Request.CreateResponse(HttpStatusCode.BadRequest, "Error deleting user");
            }
        }

        // retriveUser function gets userId and changes his 'active' field to true
        [HttpGet]
        [Route("api/Users/retriveUser")]
        public HttpResponseMessage retriveUser(int userId)
        {
            try
            {
                User u = new User();
                u.RetriveUser(userId);
                return Request.CreateResponse(HttpStatusCode.OK, "Users_2021");
            }
            catch (Exception e)
            {
                ExceptionLogging.SendErrorToText(e);
                return Request.CreateResponse(HttpStatusCode.BadRequest, "Error retriving user");
            }
        }

        // getAllUsers funtion fetches all users from the mssql database and returns it
        [HttpGet]
        [Route("api/Users/getAllUsers")]
        public HttpResponseMessage getAllUsers()
        {
            try
            {
                User u = new User();
                List<User> us = u.getAllUsers();
                if (us.Count > 0)
                    return Request.CreateResponse(HttpStatusCode.OK, us);
                else return Request.CreateResponse(HttpStatusCode.NotFound, "Error drawing the users");
            }
            catch (Exception e)
            {
                ExceptionLogging.SendErrorToText(e);
                return Request.CreateResponse(HttpStatusCode.Conflict, e);
            }
        }

        // activateAccount simply gets userEmail and changes his related account 'emailActivated' field to true
        [HttpPut]
        [Route("api/Users/activateAccount")]
        public HttpResponseMessage activateAccount(string userEmail)
        {
            try
            {
                User u = new User();
                u.Activate(userEmail);
                return Request.CreateResponse(HttpStatusCode.OK, "email has been activated!");
            }

            catch (Exception e)
            {
                ExceptionLogging.SendErrorToText(e);
                return Request.CreateResponse(HttpStatusCode.Conflict, "Error activating user");
            }
        }
    }
}