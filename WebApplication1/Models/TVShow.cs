using Assignment1.Models.DAL;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Assignment1.Models
{
    public class TVShow
    {
        // Variables
        int id;
        string first_air_date;
        string name;
        string origin_country;
        string original_language;
        string overview;
        float popularity;
        string poster_path;

        // Constructors
        public TVShow()
        {
        }
        public TVShow(int id, string name)
        {
            Id = id;
            Name = name;
        }
        public TVShow(int id, string name, string poster_path)
        {
            Id = id;
            Name = name;
            Poster_path = poster_path;
        }
        public TVShow(int id, string first_air_date, string name, string origin_country, string original_language, float popularity, string poster_path)
        {
            Id = id;
            First_air_date = first_air_date;
            Name = name;
            Origin_country = origin_country;
            Original_language = original_language;
            Overview = overview;
            Popularity = popularity;
            Poster_path = poster_path;
        }
        public TVShow(int id, string first_air_date, string name, string origin_country, string original_language, string overview, float popularity, string poster_path)
        {
            Id = id;
            First_air_date = first_air_date;
            Name = name;
            Origin_country = origin_country;
            Original_language = original_language;
            Overview = overview;
            Popularity = popularity;
            Poster_path = poster_path;
        }
       
        // Properties
        public int Id { get => id; set => id = value; }
        public string First_air_date { get => first_air_date; set => first_air_date = value; }
        public string Name { get => name; set => name = value; }
        public string Origin_country { get => origin_country; set => origin_country = value; }
        public string Original_language { get => original_language; set => original_language = value; }
        public string Overview { get => overview; set => overview = value; }
        public float Popularity { get => popularity; set => popularity = value; }
        public string Poster_path { get => poster_path; set => poster_path = value; }

        // Functions
        public void Insert()
        {
            TVShowDataServices tvsds = new TVShowDataServices();
            tvsds.Insert(this);
        }
        public List<TVShow> GetTVShowNames(int userID)
        {
            TVShowDataServices tvsds = new TVShowDataServices();
            return tvsds.GetTVShowNames(userID);
        }
        public List<TVShow> getAllTvShows()
        {
            TVShowDataServices tvsds = new TVShowDataServices();
            return tvsds.getAllTvShows();
        }
        public void Update()
        {
            TVShowDataServices tvsds = new TVShowDataServices();
            tvsds.Update(this);
        }
        public List<String> getMostViewedTVShows(int userId, int amount)
        {
            TVShowDataServices tvsds = new TVShowDataServices();
            return tvsds.getMostViewedTVShows(userId, amount);
        }
    }
}
