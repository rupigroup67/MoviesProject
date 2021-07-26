using Assignment1.Models;
using System;
using System.Collections.Generic;
using System.Data.SqlClient;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using WebApplication1.Models;

namespace Assignment1.Controllers
{
    public class UserEpisodesController : ApiController
    {
        // GET function returns all TV shows liked by userID
        public HttpResponseMessage Get(int userID)
        {
            try
            {
                TVShow tvs = new TVShow();
                return Request.CreateResponse(HttpStatusCode.OK, tvs.GetTVShowNames(userID));
            }
            catch (Exception e)
            {
                ExceptionLogging.SendErrorToText(e);
                return Request.CreateResponse(HttpStatusCode.Conflict, e);
            }
        }

        // GET function returns all episodes from TV shows (tvshowID) liked by userID
        public HttpResponseMessage Get(int tvshowID, int userID)
        {
            try
            {
                Episode e = new Episode();
                return Request.CreateResponse(HttpStatusCode.OK, e.GetLikedEpisodes(tvshowID, userID));
            }
            catch (Exception e)
            {
                ExceptionLogging.SendErrorToText(e);
                return Request.CreateResponse(HttpStatusCode.Conflict, e);
            }
        }

        // getLovedEpisode been called when user enters into tvshowpage, the page  asks for the episodes
        // liked by the userID, from the tvshowID in the specific seasonNumber
        public HttpResponseMessage GetLovedEpisodes(int tvshowID, int userID, int seasonNumber)
        {
            try
            {
                UserEpisode ue = new UserEpisode();
                List<Episode> lovedEpisodesList = ue.GetLovedEpisodes(tvshowID, userID, seasonNumber);
                return Request.CreateResponse(HttpStatusCode.OK, ue.GetLovedEpisodes(tvshowID, userID, seasonNumber));

            }
            catch (Exception e)
            {
                ExceptionLogging.SendErrorToText(e);
                return Request.CreateResponse(HttpStatusCode.Conflict, e);
            }
        }

        // POST function been called when user likes episode, then the function adds it to the mssql db
        public HttpResponseMessage Post([FromBody] UserEpisode ue)
        {
            try
            {
                ue.Insert();
                return Request.CreateResponse(HttpStatusCode.OK, "Episode Inserted");
            }
            
            catch (Exception e)
            {
                ExceptionLogging.SendErrorToText(e);
                return Request.CreateResponse(HttpStatusCode.Conflict, e);
            }
        }

        // DELETE function deletes desired episodes from the exact userID
        public HttpResponseMessage Delete(int episodeID, int userID, int tvShowID)
        {
            UserEpisode ue = new UserEpisode();
            try
            {
                ue.Delete(episodeID, userID, tvShowID);
                return Request.CreateResponse(HttpStatusCode.OK, "Episode has been deleted successfully");
            }
            catch(Exception e)
            {
                ExceptionLogging.SendErrorToText(e);
                return Request.CreateResponse(HttpStatusCode.NotFound, e);
            }
        }

        // UPDATE function which update episode information inside our MSSQL DB
        [HttpPut]
        [Route("api/UserEpisodes/UpdateEpisode")]
        public HttpResponseMessage Put([FromBody] Episode e)
        {
            try
            {
                e.Update();
                return Request.CreateResponse(HttpStatusCode.OK, "Episodes_2021");
            }
            catch (Exception ex)
            {
                ExceptionLogging.SendErrorToText(ex);
                return Request.CreateResponse(HttpStatusCode.NotFound, "Error updating Episode fields");
            }
        }

        // UPDATE function which update TV show information inside our MSSQL DB
        [HttpPut]
        [Route("api/UserEpisodes/UpdateTVShow")]
        public HttpResponseMessage Put([FromBody] TVShow tvs)
        {
            try
            {
                tvs.Update();
                return Request.CreateResponse(HttpStatusCode.OK, "TVShow_2021");
            }
            catch (Exception e)
            {
                ExceptionLogging.SendErrorToText(e);
                return Request.CreateResponse(HttpStatusCode.NotFound, "Error updating TVShow fields");
            }
        }

        // GET function which returns users most viewed TV shows (based on his likes)
        [HttpGet]
        [Route("api/UserEpisodes/getMostViewedTVShows")]
        public HttpResponseMessage getMostViewedTVShows(int userId, int amount)
        {
            try
            {
                TVShow tvs = new TVShow();
                return Request.CreateResponse(HttpStatusCode.OK, tvs.getMostViewedTVShows(userId, amount));
            }
            catch (Exception e)
            {
                ExceptionLogging.SendErrorToText(e);
                return Request.CreateResponse(HttpStatusCode.Conflict, e);
            }
        }

        // GET function which return all episodes data from our MSSQL DB
        [HttpGet]
        [Route("api/UserEpisodes/getAllEpisodes")]
        public HttpResponseMessage getAllEpisodes()
        {
            try
            {
                Episode e = new Episode();
                return Request.CreateResponse(HttpStatusCode.OK, e.getAllEpisodes());
            }
            catch (Exception e)
            {
                ExceptionLogging.SendErrorToText(e);
                return Request.CreateResponse(HttpStatusCode.Conflict, e);
            }
        }

        // GET function which return all TV shows data from our MSSQL DB
        [HttpGet]
        [Route("api/UserEpisodes/getAllTvShows")]
        public HttpResponseMessage getAllTvShows()
        {
            try
            {
                TVShow tvs = new TVShow();
                return Request.CreateResponse(HttpStatusCode.OK, tvs.getAllTvShows());
            }
            catch (Exception e)
            {
                ExceptionLogging.SendErrorToText(e);
                return Request.CreateResponse(HttpStatusCode.Conflict, e);
            }
        }
    }
}