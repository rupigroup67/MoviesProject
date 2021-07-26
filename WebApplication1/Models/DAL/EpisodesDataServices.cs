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
    public class EpisodesDataServices
    {
        public SqlConnection connect(string conString)
        {
            // read the connection string from the configuration file
            string cStr = WebConfigurationManager.ConnectionStrings[conString].ConnectionString;
            SqlConnection con = new SqlConnection(cStr);
            con.Open();
            return con;
        }
        public void Insert(Episode e, int tvShowID)
        {
            SqlConnection con = null;
            try
            {
                con = connect("DBConnectionString"); 
                BuildInsertCommand(e, tvShowID, con);     
            }
            catch (SqlException sqlEx)
            {
                if (sqlEx.Number != 2627)
                    throw sqlEx;
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
        public void Update(Episode e)
        {
            SqlConnection con = null;
            try
            {
                con = connect("DBConnectionString"); // create the connection
                BuildUpdateCommand(e, con);      // helper method to build the insert string
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
        public List<Episode> getAllEpisodes()
        {
            SqlConnection con = null;
            try
            {
                con = connect("DBConnectionString"); // create the connection
                return BuildGetAllEpisodesCommand(con);      // helper method to build the insert string
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
        public List<Episode> GetLikedEpisodes(int tvShowID, int userID)
        {
            SqlConnection con = null;
            try
            {
                con = connect("DBConnectionString"); // create the connection
                return BuildEpisodesListCommand(tvShowID, userID, con);      // helper method to build the insert string
            }
            catch (SqlException sqlEx)
            {
                if (sqlEx.Number != 2627)
                    throw sqlEx;
                return null;
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
        public void DeleteEpisode(int id)
        {
        
            SqlConnection con = null;
            try
            {
                con = connect("DBConnectionString"); // create the connection
                BuildDeleteEpisodeCommand(id, con);      // helper method to build the insert string
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
        private List<Episode> BuildGetAllEpisodesCommand(SqlConnection con)
        {
            List<Episode> episodesList = new List<Episode>();
            string query = "Select * From Episodes_2021";

            SqlCommand command = new SqlCommand(query, con);
            SqlDataReader dr = command.ExecuteReader(CommandBehavior.CloseConnection); // CommandBehavior.CloseConnection: the connection will be closed after reading has reached the end
            while (dr.Read())
            {
                episodesList.Add(new Episode(
                                    (Int16)dr["season_number"],
                                    (string)dr["episode_name"],
                                    (string)dr["episode_img"],
                                    ((DateTime)dr["air_date"]).ToString(),
                                    (string)dr["episode_desc"],
                                    (Int32)dr["episode_id"],
                                    (Int32)dr["tvshow_id"]
                                    ));
            }
            con.Close();
            return episodesList;
        }
        private void BuildInsertCommand(Episode ep, int tvShowID, SqlConnection con)
        {
            string query = "INSERT INTO Episodes_2021 (episode_id,season_number,episode_name,episode_desc,air_date,tvshow_id, episode_img) VALUES (@episode_id,@season_number,@episode_name,@episode_desc,@air_date,@tvshow_id, @episode_img)";
            SqlCommand command = new SqlCommand(query, con);
            command.Parameters.AddWithValue("@episode_id", ep.Id);
            command.Parameters.AddWithValue("@season_number", ep.SeasonNumber);
            command.Parameters.AddWithValue("@episode_name", ep.EpisodeName);
            command.Parameters.AddWithValue("@episode_desc", ep.EpisodeDesc);
            command.Parameters.AddWithValue("@air_date", ep.EpisodeAirDate);
            command.Parameters.AddWithValue("@tvshow_id", tvShowID);
            command.Parameters.AddWithValue("@episode_img", ep.EpisodeImg);
            command.ExecuteNonQuery();
        }
        private List<Episode> BuildEpisodesListCommand(int tvShowID, int userID, SqlConnection con)
        {
            List<Episode> episodesList = new List<Episode>();
            string query = "Select E.episode_id, E.episode_name, E.episode_desc, E.air_date, E.season_number, E.episode_img " +
                "From Episodes_2021 E inner join TVShow_2021 TVS " +
                "on E.tvshow_id = TVS.tvshow_id inner join User_Likes_Episode_2021 ULE " +
                "on ULE.episode_id = E.episode_id " +
                "Where ULE.user_id =" + userID + " and TVS.tvshow_id = '" + tvShowID + "'";

            SqlCommand command = new SqlCommand(query, con);
            SqlDataReader dr = command.ExecuteReader(CommandBehavior.CloseConnection); // CommandBehavior.CloseConnection: the connection will be closed after reading has reached the end
            while (dr.Read())
            {
                episodesList.Add(new Episode(
                                    (Int16)dr["season_number"],
                                    (string)dr["episode_name"],
                                    (string)dr["episode_img"],
                                    ((DateTime)dr["air_date"]).ToString(),
                                    (string)dr["episode_desc"],
                                    (Int32)dr["episode_id"]
                                ));
            }
            con.Close();
            return episodesList;
        }
        private void BuildDeleteEpisodeCommand(int id, SqlConnection con)
        {
            string query = " DELETE FROM Episodes_2021 WHERE episode_id=" + id;
            SqlCommand command = new SqlCommand(query, con);
            command.ExecuteNonQuery();
        }
        private void BuildUpdateCommand(Episode ep, SqlConnection con)
        {
            String query = "UPDATE Episodes_2021 SET season_number = @seasonnumber, episode_name = @episodename, episode_desc = @episodedesc, air_date = @airdate, episode_img = @episodeimg WHERE episode_id = @episodeid";
            SqlCommand command = new SqlCommand(query, con);
            command.Parameters.AddWithValue("@seasonnumber", ep.SeasonNumber);
            command.Parameters.AddWithValue("@episodename", ep.EpisodeName);
            command.Parameters.AddWithValue("@episodedesc", ep.EpisodeDesc);
            command.Parameters.AddWithValue("@airdate", ep.EpisodeAirDate);
            command.Parameters.AddWithValue("@episodeimg ", ep.EpisodeImg);
            command.Parameters.AddWithValue("@episodeid", ep.Id);
            command.ExecuteNonQuery();
        }
    }
}