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
    public class UserLikesEpisodeDataServices
    {
        public SqlConnection connect(String conString)
        {
            string cStr = WebConfigurationManager.ConnectionStrings[conString].ConnectionString;
            SqlConnection con = new SqlConnection(cStr);
            con.Open();
            return con;
        }
        public bool Insert(int userID, int episodeID)
        {
            SqlConnection con = null;
            try
            {
                con = connect("DBConnectionString"); // create the connection
                BuildInsertCommand(userID, episodeID, con);
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
            return true;
        }
        public bool Delete(int episodeID, int userID)
        {
            SqlConnection con = null;
            try
            {
                con = connect("DBConnectionString"); // create the connection
                BuildDeleteUserEpisodeCommand(userID, episodeID, con);
            }
            catch (Exception ex)
            {
                throw (ex);
            }
            finally
            {
                if (con != null)
                    con.Close();
            }
            return true;
        }
        public bool CheckEpisodeExists(int episodeID)
        {
            SqlConnection con = null;
            try
            {
                con = connect("DBConnectionString"); // create the connection
                return BuildSelectUserEpisodeCommand(episodeID, con);
            }
            catch (Exception ex)
            {
                throw (ex);
            }

            finally
            {
                if (con != null)
                    con.Close();
            }
        }
        public List<Episode> GetLovedEpisodes(int tvshowID, int userID, int seasonNumber)
        {
            SqlConnection con = null;
            try
            {
                con = connect("DBConnectionString"); // create the connection
                return BuildLovedEpisodesCommand(tvshowID, userID, seasonNumber, con);
            }
            catch (Exception ex)
            {
                throw (ex);
            }

            finally
            {
                if (con != null)
                    con.Close();
            }
        }
        private List<Episode> BuildLovedEpisodesCommand(int tvshowID, int userID, int seasonNumber, SqlConnection con)
        {
            List<Episode> episodesList = new List<Episode>();
            string query = "Select E.episode_id " +
                "From User_Likes_Episode_2021 ULE inner join Episodes_2021 E " +
                "on ULE.episode_id = E.episode_id " +
                "Where ULE.user_id=" + userID + "and E.tvshow_id=" + tvshowID + " and E.season_number=" + seasonNumber;
            SqlCommand command = new SqlCommand(query, con);
            SqlDataReader dr = command.ExecuteReader(CommandBehavior.CloseConnection); // CommandBehavior.CloseConnection: the connection will be closed after reading has reached the end
            while (dr.Read())
            {
                episodesList.Add(new Episode((Int32)dr["episode_id"]));
            }
            con.Close();
            return episodesList;
        }
        private void BuildInsertCommand(int userID, int episodeID, SqlConnection con)
        {
            String query = "INSERT INTO User_Likes_Episode_2021 (episode_id,user_id) VALUES (@episode_id,@user_id)";
            SqlCommand command = new SqlCommand(query, con);
            command.Parameters.AddWithValue("@episode_id", episodeID);
            command.Parameters.AddWithValue("@user_id", userID);
            command.ExecuteNonQuery();
        }
        private void BuildDeleteUserEpisodeCommand(int userID, int episodeID, SqlConnection con)
        {
            String query = "DELETE FROM User_Likes_Episode_2021 WHERE episode_id=" + episodeID + " and user_id=" + userID;
            SqlCommand command = new SqlCommand(query, con);
            command.ExecuteNonQuery();
        }
        private bool BuildSelectUserEpisodeCommand(int episodeID, SqlConnection con)
        {
            String query = "select distinct episode_id from User_Likes_Episode_2021 where episode_id=" + episodeID;
            SqlCommand command = new SqlCommand(query, con);
            SqlDataReader dr = command.ExecuteReader(CommandBehavior.CloseConnection); // CommandBehavior.CloseConnection: the connection will be closed after reading has reached the end
            if (dr.Read())
                return true;
            return false;
        }
    }
}