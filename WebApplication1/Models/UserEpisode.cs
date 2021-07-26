using Assignment1.Models.DAL;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Assignment1.Models
{
    public class UserEpisode
    {
        // Variables
        User u;
        TVShow tvs;
        Episode e;

        // Constructors
        public UserEpisode() { }
        public UserEpisode(User u, TVShow tvs, Episode e)
        {
            U = u;
            Tvs = tvs;
            E = e;
        }

        // Properties
        public User U { get => u; set => u = value; }
        public TVShow Tvs { get => tvs; set => tvs = value; }
        public Episode E { get => e; set => e = value; }

        // Functions
        public void Insert()
        {
            Tvs.Insert();
            E.Insert(Tvs.Id);
            UserLikesEpisodeDataServices uleds = new UserLikesEpisodeDataServices();
            uleds.Insert(U.Id, E.Id);
        }
        public List<Episode> GetLovedEpisodes(int tvshowID, int userID, int seasonNumber)
        {
            UserLikesEpisodeDataServices uledb = new UserLikesEpisodeDataServices();
            return uledb.GetLovedEpisodes(tvshowID, userID, seasonNumber);
        }
        public void Delete(int episodeID, int userID, int tvShowID)
        {
            UserLikesEpisodeDataServices uleds = new UserLikesEpisodeDataServices();
            // remove relation between specific user and episode:
            uleds.Delete(episodeID, userID);

            // check if another user has the same episode:
            if (!uleds.CheckEpisodeExists(episodeID))
            {
                // if not, delete it from the episode table:
                EpisodesDataServices eds = new EpisodesDataServices();
                eds.DeleteEpisode(episodeID);
                TVShowDataServices tvsds = new TVShowDataServices();
                // if deleted, check if this was the last episode from the same tv-show:
                if (!tvsds.CheckTVShowExists(tvShowID)){
                    tvsds.DeleteTVShow(tvShowID);
                }
            }
        }
    }
}
