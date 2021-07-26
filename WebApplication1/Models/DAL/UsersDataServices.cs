using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using System.Text;
using System.Web;
using System.Web.Configuration;

namespace Assignment1.Models.DAL
{
    public class UsersDataServices
    {
        public SqlConnection connect(string conString)
        {
            // read the connection string from the configuration file
            string cStr = WebConfigurationManager.ConnectionStrings[conString].ConnectionString;
            SqlConnection con = new SqlConnection(cStr);
            con.Open();
            return con;
        }
        public void Activate(string userEmail)
        {
            SqlConnection con = null;
            try
            {
                con = connect("DBConnectionString"); // create the connection
                BulidActivateUser(userEmail, con);      // helper method to build the insert string
            }
            catch (Exception ex)
            {
                throw (ex);
            }
            finally
            {
                if (con != null)
                {
                    // close the db connection
                    con.Close();
                }
            }
        }
        public void DeleteUser(int userId)
        {
            SqlConnection con = null;
            try
            {
                con = connect("DBConnectionString"); // create the connection
                BuildDeleteUser(userId, con);      // helper method to build the insert string
            }
            catch (Exception ex)
            {
                throw (ex);
            }
            finally
            {
                if (con != null)
                {
                    // close the db connection
                    con.Close();
                }
            }
        }
        public void RetriveUser(int userId)
        {
            SqlConnection con = null;
            try
            {
                con = connect("DBConnectionString"); // create the connection
                BuildRetriveUser(userId, con);      // helper method to build the insert string
            }
            catch (Exception ex)
            {
                throw (ex);
            }
            finally
            {
                if (con != null)
                {
                    // close the db connection
                    con.Close();
                }
            }
        }
        public void BulidActivateUser(string userEmail, SqlConnection con)
        {
            String query;
            query = "UPDATE Users_2021 SET emailActivated = 1 WHERE email = @userEmail";
            SqlCommand command = new SqlCommand(query, con);
            command.Parameters.AddWithValue("@userEmail", userEmail);
            command.ExecuteNonQuery();
        }
        public void BuildDeleteUser(int userId, SqlConnection con)
        {
            String query;
            query = "UPDATE Users_2021 SET active = 0 WHERE user_id = @userId";
            SqlCommand command = new SqlCommand(query, con);
            command.Parameters.AddWithValue("@userId", userId);
            command.ExecuteNonQuery();
        }
        public void BuildRetriveUser(int userId, SqlConnection con)
        {
            String query;
            query = "UPDATE Users_2021 SET active = 1 WHERE user_id = @userId";
            SqlCommand command = new SqlCommand(query, con);
            command.Parameters.AddWithValue("@userId", userId);
            command.ExecuteNonQuery();
        }
        public bool EmailExists(string email)
        {
            SqlConnection con = null;
            try
            {
                con = connect("DBConnectionString"); // create the connection
                string query = "SELECT * FROM Users_2021 WHERE email = '" + email + "'";
                SqlCommand command = new SqlCommand(query, con);
                SqlDataReader dr = command.ExecuteReader(CommandBehavior.CloseConnection);
                return dr.Read() ? true : false;
            }
            catch (Exception ex)
            {
                throw ex;
            }
            finally
            {
                if (con != null)
                {
                    // close the db connection
                    con.Close();
                }
            }
        }
        public List<User> getAllUsers()
        {
            SqlConnection con = null;
            try
            {
                List<User> ul = new List<User>();
                con = connect("DBConnectionString"); // create the connection
                String query = "SELECT * FROM Users_2021";
                SqlCommand command = new SqlCommand(query, con);
                SqlDataReader dr = command.ExecuteReader(CommandBehavior.CloseConnection); // CommandBehavior.CloseConnection: the connection will be closed after reading has reached the end
                while (dr.Read())
                {
                    ul.Add(new User(
                                    (Int32)dr["user_id"],
                                    (string)dr["firstName"],
                                    (string)dr["LastName"],
                                    (string)dr["email"],
                                    (string)dr["password"],
                                    (string)dr["tel"],
                                    (string)dr["gender"],
                                    (string)dr["dateOfBirth"],
                                    (string)dr["genre"],
                                    (string)dr["address"],
                                    (Int16)dr["type"],
                                    (bool)dr["active"],
                                    (bool)dr["emailActivated"]
                                   ));
                }
                return ul;
            }
            catch (Exception ex)
            {
                throw (ex);
            }
            finally
            {
                if (con != null)
                {
                    con.Close();
                }
            }
        }
        public User LogIn(string email, string password)
        {
            SqlConnection con = null;
            try
            {
                con = connect("DBConnectionString");
                String query = "SELECT * FROM Users_2021 WHERE email = '" + email + "' and password = '" + password + "' and active = 1";
                SqlCommand command = new SqlCommand(query, con);
                SqlDataReader dr = command.ExecuteReader(CommandBehavior.CloseConnection);
                if (dr.Read())
                    return new User(
                                (Int32)dr["user_id"],
                                (string)dr["firstName"],
                                (string)dr["LastName"],
                                (string)dr["email"],
                                "",
                                (string)dr["tel"],
                                (string)dr["gender"],
                                (string)dr["dateOfBirth"],
                                (string)dr["genre"],
                                (string)dr["address"],
                                (Int16)dr["type"],
                                (bool)dr["active"],
                                (bool)dr["emailActivated"]
                                 );
            }
            catch (Exception ex)
            {
                // write to log
                throw (ex);
            }
            finally
            {
                if (con != null)
                {
                    // close the db connection
                    con.Close();
                }
            }
            return null;
        }
        public int Insert(User user)
        {
            SqlConnection con = null;
            try
            {
                con = connect("DBConnectionString"); // create the connection
                return BuildInsertCommand(user, con);      // helper method to build the insert string
            }
            catch (Exception ex)
            {
                throw (ex);
            }
            finally
            {
                if (con != null)
                {
                    // close the db connection
                    con.Close();
                }
            }
        }
        public void Update(User user)
        {
            SqlConnection con = null;
            try
            {
                con = connect("DBConnectionString"); // create the connection
                BuildUpdateCommand(user, con);      // helper method to build the insert string
            }
            catch (Exception ex)
            {
                throw (ex);
            }
            finally
            {
                if (con != null)
                {
                    // close the db connection
                    con.Close();
                }
            }
        }
        private int BuildInsertCommand(User user, SqlConnection con)
        {
            String query;
            query = "INSERT INTO Users_2021 (firstName,LastName,email,gender,password,tel,dateOfBirth,address,genre) OUTPUT INSERTED.[user_id] VALUES (@firstName,@LastName,@email,@gender,@password,@tel,@dateOfBirth,@address,@genre)";
            SqlCommand command = new SqlCommand(query, con);
            command.Parameters.AddWithValue("@firstName", user.Name);
            command.Parameters.AddWithValue("@LastName", user.Surname);
            command.Parameters.AddWithValue("@email", user.Email);
            command.Parameters.AddWithValue("@gender", user.Gender);
            command.Parameters.AddWithValue("@password", user.Password);
            command.Parameters.AddWithValue("@tel", user.PhoneNumber);
            command.Parameters.AddWithValue("@dateOfBirth", user.DateOfBirth);
            command.Parameters.AddWithValue("@address", user.Address);
            command.Parameters.AddWithValue("@genre", user.Genre);
            return Convert.ToInt32(command.ExecuteScalar());
        }
        private void BuildUpdateCommand(User user, SqlConnection con)
        {
            String query;
            if (user.Password != null)
                query = "UPDATE Users_2021 SET firstName = @firstname, LastName = @lastname, email = @email, gender = @gender, password = @password, tel = @phonenumber, dateOfBirth = @dateofbirth, address = @address, type = @type, genre = @genre, active = @active, emailActivated = @emailActivated WHERE user_id = @userid";
            else
                query = "UPDATE Users_2021 SET firstName = @firstname, LastName = @lastname, email = @email, gender = @gender, tel = @phonenumber, dateOfBirth = @dateofbirth, address = @address, type = @type, genre = @genre, active = @active WHERE user_id = @userid";
            SqlCommand command = new SqlCommand(query, con);
            command.Parameters.AddWithValue("@firstname", user.Name);
            command.Parameters.AddWithValue("@lastname", user.Surname);
            command.Parameters.AddWithValue("@email", user.Email);
            command.Parameters.AddWithValue("@gender", user.Gender);
            if (user.Password != null)
                command.Parameters.AddWithValue("@password", user.Password);
            command.Parameters.AddWithValue("@phonenumber", user.PhoneNumber);
            command.Parameters.AddWithValue("@dateofbirth", user.DateOfBirth);
            command.Parameters.AddWithValue("@address", user.Address);
            command.Parameters.AddWithValue("@genre", user.Genre == null ? "none" : user.Genre);
            command.Parameters.AddWithValue("@userid", user.Id);
            command.Parameters.AddWithValue("@type", user.Type);
            command.Parameters.AddWithValue("@active", user.Active ? "1" : "0");
            command.Parameters.AddWithValue("@emailActivated", user.EmailActivated ? "1" : "0");
            command.ExecuteNonQuery();
        }
    }
}