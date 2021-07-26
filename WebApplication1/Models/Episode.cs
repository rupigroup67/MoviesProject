using Assignment1.Models.DAL;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Assignment1.Models
{
    public class Episode
    {
        // Variables
        private int seasonNumber;
        private string episodeName;
        private string episodeImg;
        private string episodeDesc;
        private string episodeAirDate;
        private int id;
        private int tvshowId;

        // Constructors
        public Episode()
        {
        }
        public Episode(int id)
        {
            Id = id;
        }
        public Episode(int seasonNumber, string episodeName, string episodeImg, string episodeDesc, string episodeAirDate, int id)
        {
            SeasonNumber = seasonNumber;
            EpisodeName = episodeName;
            EpisodeImg = episodeImg;
            EpisodeDesc = episodeDesc;
            EpisodeAirDate = episodeAirDate;
            Id = id;
        }
        public Episode(int seasonNumber, string episodeName, string episodeImg, string episodeAirDate,string episodedesc, int id, int tvshowId)
        {
            SeasonNumber = seasonNumber;
            EpisodeName = episodeName;
            EpisodeImg = episodeImg;
            EpisodeAirDate = episodeAirDate;
            EpisodeDesc = episodedesc;
            Id = id;
            TvshowId = tvshowId;
        }
        
        // Properties
        public int SeasonNumber { get => seasonNumber; set => seasonNumber = value; }
        public string EpisodeName { get => episodeName; set => episodeName = value; }
        public string EpisodeImg { get => episodeImg; set => episodeImg = value; }
        public string EpisodeDesc { get => episodeDesc; set => episodeDesc = value; }
        public string EpisodeAirDate { get => episodeAirDate; set => episodeAirDate = value; }
        public int Id { get => id; set => id = value; }
        public int TvshowId { get => tvshowId; set => tvshowId = value; }

        // Functions
        public List<Episode> GetLikedEpisodes(int tvshowID, int userID)
        {
            EpisodesDataServices eds = new EpisodesDataServices();
            return eds.GetLikedEpisodes(tvshowID, userID);
        }
        public void Insert(int tvShowID)
        {
            EpisodesDataServices ds = new EpisodesDataServices();
            ds.Insert(this, tvShowID);
        }
        public void Update()
        {
            EpisodesDataServices ds = new EpisodesDataServices();
            ds.Update(this);
        }
        public List<Episode> getAllEpisodes()
        {
            EpisodesDataServices ds = new EpisodesDataServices();
            return ds.getAllEpisodes();
        }
    }
}
       