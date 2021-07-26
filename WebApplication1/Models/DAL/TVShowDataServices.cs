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
    public class TVShowDataServices
    {
        public SqlConnection connect(String conString)
        {
            // read the connection string from the configuration file
            string cStr = WebConfigurationManager.ConnectionStrings[conString].ConnectionString;
            SqlConnection con = new SqlConnection(cStr);
            con.Open();
            return con;
        }

        //--------------------------------------------------------------------------------------------------
        // This method inserts a car to the cars table 
        //--------------------------------------------------------------------------------------------------
        public void Insert(TVShow tvs)
        {
            SqlConnection con = null;
            try
            {
                con = connect("DBConnectionString"); // create the connection
                BuildInsertCommand(tvs, con);      // helper method to build the insert string
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
        public void Update(TVShow tvs)
        {
            SqlConnection con = null;
            try
            {
                con = connect("DBConnectionString");
                BuildUpdateCommand(tvs, con);
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
        public List<TVShow> GetTVShowNames(int userID)
        {
            SqlConnection con = null;
            try
            {
                con = connect("DBConnectionString");
                return BuildTVShowsListCommand(userID, con);
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
        public List<TVShow> getAllTvShows()
        {
            SqlConnection con = null;
            try
            {
                con = connect("DBConnectionString"); // create the connection
                return BuildGetAllTvShowsCommand(con);      // helper method to build the insert string
            }
            catch (SqlException sqlEx)
            {
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
        public List<String> getMostViewedTVShows(int userId, int amount)
        {
            SqlConnection con = null;
            try
            {
                con = connect("DBConnectionString");
                return BuildGetMostViewedTVShows(userId, amount, con);
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
        private List<TVShow> BuildGetAllTvShowsCommand(SqlConnection con)
        {
            List<TVShow> tvsList = new List<TVShow>();
            con = connect("DBConnectionString"); // create the connection
            string query = "Select * From TVShow_2021";
            SqlCommand command = new SqlCommand(query, con);
            SqlDataReader dr = command.ExecuteReader(CommandBehavior.CloseConnection);
            while (dr.Read())
            {
                tvsList.Add(new TVShow((Int32)dr["tvshow_id"],
                    ((DateTime)dr["first_air_date"]).ToString(),
                    (string)dr["name"],
                    (string)dr["origin_country"],
                    (string)dr["original_language"],
                    (string)dr["overview"],
                    (float)Convert.ToDouble(dr["popularity"]),
                    (string)dr["poster_path"]));
            }
            con.Close();
            return tvsList;
        }
        private List<String> BuildGetMostViewedTVShows(int userId, int amount, SqlConnection con)
        {
            List<String> tvsList = new List<String>();
            string query;
            con = connect("DBConnectionString"); // create the connection
            if (userId < 0)
                query = "select top " + amount + " count(TVS.tvshow_id) likesAmount, TVS.tvshow_id, TVS.name from User_Likes_Episode_2021 ULS inner join Episodes_2021 E on E.episode_id = ULS.episode_id inner join TVShow_2021 TVS on TVS.tvshow_id = E.tvshow_id group by TVS.tvshow_id, TVS.name order by likesAmount desc";
            else
                query = "select top " + amount + " count(TVS.tvshow_id) tvId, TVS.tvshow_id from User_Likes_Episode_2021 ULS inner join Episodes_2021 E on E.episode_id = ULS.episode_id inner join TVShow_2021 TVS on TVS.tvshow_id = E.tvshow_id where ULS.user_id = " + userId + " group by TVS.tvshow_id";
            SqlCommand command = new SqlCommand(query, con);
            SqlDataReader dr = command.ExecuteReader(CommandBehavior.CloseConnection);
            if (userId < 0)
            {
                while (dr.Read())
                    tvsList.Add(((string)dr["name"]) + "|" + ((Int32)dr["likesAmount"]).ToString());
            }
            else
            {
                while (dr.Read())
                    tvsList.Add(((Int32)dr["tvshow_id"]).ToString());
            }
            con.Close();
            return tvsList;
        }
        public bool CheckTVShowExists(int tvShowID)
        {
            SqlConnection con = null;
            try
            {
                con = connect("DBConnectionString"); // create the connection
                return BuildTVShowsExistsCommand(tvShowID, con);      // helper method to build the insert string
            }
            catch (SqlException sqlEx)
            {
                if (sqlEx.Number != 2627)
                    throw sqlEx;
                return false;
            }
            catch (Exception ex)
            {
                throw ex;
            }

            finally
            {
                if (con != null)
                    con.Close();
            }
        }
        public void DeleteTVShow(int tvShowID)
        {
            SqlConnection con = null;
            try
            {
                con = connect("DBConnectionString"); // create the connection
                BuildDeleteTVShowCommand(tvShowID, con);      // helper method to build the insert string
            }
            catch (Exception ex)
            {
                throw ex;
            }
            finally
            {
                if (con != null)
                    con.Close();
            }
        }
        private void BuildDeleteTVShowCommand(int tvShowID, SqlConnection con)
        {
            con = connect("DBConnectionString"); // create the connection
            string query = " DELETE FROM TVShow_2021 WHERE tvshow_id=" + tvShowID;
            SqlCommand command = new SqlCommand(query, con);
            SqlDataReader dr = command.ExecuteReader(CommandBehavior.CloseConnection);
            con.Close();
        }
        private bool BuildTVShowsExistsCommand(int tvShowID, SqlConnection con)
        {
            con = connect("DBConnectionString"); // create the connection
            string query = " select distinct TVS.tvshow_id from TVShow_2021 tvs inner join Episodes_2021 e on tvs.tvshow_id = e.tvshow_id where tvs.tvshow_id=" + tvShowID;
            SqlCommand command = new SqlCommand(query, con);
            SqlDataReader dr = command.ExecuteReader(CommandBehavior.CloseConnection);
            if (dr.Read())
                return true;
            con.Close();
            return false;
        }
        private List<TVShow> BuildTVShowsListCommand(int userID, SqlConnection con)
        {
            List<TVShow> tvsList = new List<TVShow>();
            con = connect("DBConnectionString"); // create the connection
            string query = "Select DISTINCT TVS.tvshow_id ,TVS.name,CAST(TVS.poster_path AS VARCHAR(MAX)) as 'poster_path' " +
                "From Episodes_2021 E inner join TVShow_2021 TVS on E.tvshow_id = TVS.tvshow_id " +
                "inner join User_Likes_Episode_2021 ULE on ULE.episode_id = E.episode_id " +
                "Where ULE.user_id =" + userID;
            SqlCommand command = new SqlCommand(query, con);
            SqlDataReader dr = command.ExecuteReader(CommandBehavior.CloseConnection);
            while (dr.Read())
            {
                tvsList.Add(new TVShow((Int32)dr["tvshow_id"], (string)dr["name"], (string)dr["poster_path"]));
            }
            con.Close();
            return tvsList;
        }
        private void BuildInsertCommand(TVShow tvs, SqlConnection con)
        {
            String query = "INSERT INTO TVShow_2021 (tvshow_id,first_air_date,name,origin_country,original_language,overview,popularity,poster_path) VALUES (@tvshow_id,@first_air_date,@name,@origin_country,@original_language,@overview,@popularity,@poster_path)";
            SqlCommand command = new SqlCommand(query, con);

            command.Parameters.AddWithValue("@tvshow_id", tvs.Id);
            command.Parameters.AddWithValue("@first_air_date", tvs.First_air_date);
            command.Parameters.AddWithValue("@name", tvs.Name);
            command.Parameters.AddWithValue("@origin_country", tvs.Origin_country);
            command.Parameters.AddWithValue("@original_language", tvs.Original_language);
            command.Parameters.AddWithValue("@overview", tvs.Overview);
            command.Parameters.AddWithValue("@popularity", tvs.Popularity);
            command.Parameters.AddWithValue("@poster_path", tvs.Poster_path);
            command.ExecuteNonQuery();
        }
        private void BuildUpdateCommand(TVShow tvs, SqlConnection con)
        {
            String query = "Update TVShow_2021 SET first_air_date = @firstairdate, name = @name, origin_country = @origincountry, original_language = @originallanguage, overview = @overview, popularity = @popularity,poster_path = @posterpath Where tvshow_id = @tvshowid";
            SqlCommand command = new SqlCommand(query, con);

            command.Parameters.AddWithValue("@tvshowid", tvs.Id);
            command.Parameters.AddWithValue("@firstairdate", tvs.First_air_date);
            command.Parameters.AddWithValue("@name", tvs.Name);
            command.Parameters.AddWithValue("@origincountry", tvs.Origin_country);
            command.Parameters.AddWithValue("@originallanguage", tvs.Original_language);
            command.Parameters.AddWithValue("@overview", tvs.Overview);
            command.Parameters.AddWithValue("@popularity", tvs.Popularity);
            command.Parameters.AddWithValue("@posterpath", tvs.Poster_path);
            command.ExecuteNonQuery();
        }
    }
}