-- USERS TABLE
CREATE TABLE [Users_2021] (
	[user_id] int IDENTITY (1, 1) PRIMARY KEY,
    [firstName] nvarchar (30) NOT NULL,
    [LastName] nvarchar (30) NOT NULL,
	[email] varchar(50) UNIQUE,
	[gender] varchar(20) NOT NULL,
	[password] varchar(20) NOT NULL,
	[tel] varchar(11) NOT NULL,
	[dateOfBirth] varchar(15) NOT NULL,
	[address] varchar(100) NOT NULL,
	[genre] varchar(15)
)

-- TV SHOWS TABLE
CREATE TABLE [TVShow_2021] (
	[tvshow_id] int PRIMARY KEY,
    [first_air_date] DATE NOT NULL,
    [name] nvarchar (30) NOT NULL,
	[origin_country] varchar(50) NOT NULL,
	[original_language] varchar(10) NOT NULL,
	[overview] varchar(100) NOT NULL,
	[popularity] int NOT NULL,
	[poster_path] varchar(200) NOT NULL,
)

-- EPISODES TABLE
CREATE TABLE [Episodes_2021] (
	[episode_id] int PRIMARY KEY,
	[season_number] smallint NOT NULL,
    [episode_name] nvarchar (30) NOT NULL,
	[episode_desc] varchar(200) NOT NULL,
	[air_date] DATE NOT NULL,
	tvshow_id int FOREIGN KEY REFERENCES TVShow_2021(tvshow_id)
)

-- USERLIKESEPISODE TABLE
CREATE TABLE [User_Likes_Episode_2021](
	episode_id int FOREIGN KEY REFERENCES Episodes_2021(episode_id),
	user_id int FOREIGN KEY REFERENCES Users_2021(user_id),
	PRIMARY KEY (episode_id, user_id)
)


--INSERT INTO [Students_2021] ([name],[age])
     --VALUES ('dani', 25	)

Select *
From Users_2021

DELETE FROM Users_2021
WHERE user_id  = 2;