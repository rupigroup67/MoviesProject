using Assignment1.Models.DAL;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Assignment1.Models
{
    public class User : ICloneable
    {
        // Variables
        private int id;
        private string name;
        private string surname;
        private string email;
        private string password;
        private string phoneNumber;
        private string gender;
        private string dateOfBirth;
        private string genre;
        private string address;
        private Int16 type;
        private bool active;
        private bool emailActivated;
        
        // Constructors
        public User()
        {

        }
        public User(int id,string name, string surname)
        {
            Id = id;
            Name = name;
            Surname = surname;
        }
        public User(int id)
        {
            Id = id;
        }
        public User(string name, string surname, string email, string password, string phoneNumber, string gender, string dateOfBirth, string genre, string address)
        {
            Name = name;
            Surname = surname;
            PhoneNumber = phoneNumber;
            Gender = gender;
            DateOfBirth = dateOfBirth;
            Genre = genre;
            Address = address;
        }
        public User(int id, string name, string surname, string email, string password, string phoneNumber, string gender, string dateOfBirth, string genre, string address,Int16 type,bool active, bool emailActivated)
        {
            Id = id;
            Name = name;
            Surname = surname;
            Email = email.ToLower();
            Password = password;
            PhoneNumber = phoneNumber;
            Gender = gender;
            DateOfBirth = dateOfBirth;
            Genre = genre;
            Address = address;
            Type = type;
            Active = active;
            EmailActivated = emailActivated;
        }
        public User LogIn(string email, string password)
        {
            UsersDataServices uds = new UsersDataServices();
            return uds.LogIn(email, password);
        }

        // Properties
        public string Name { get => name; set => name = value; }
        public string Surname { get => surname; set => surname = value; }
        public string Email { get => email; set => email = value; }
        public string Password { get => password; set => password = value; }
        public string PhoneNumber { get => phoneNumber; set => phoneNumber = value; }
        public string Gender { get => gender; set => gender = value; }
        public string DateOfBirth { get => dateOfBirth; set => dateOfBirth = value; }
        public string Genre { get => genre; set => genre = value; }
        public string Address { get => address; set => address = value; }
        public int Id { get => id; set => id = value; }
        public short Type { get => type; set => type = value; }
        public bool Active { get => active; set => active = value; }
        public bool EmailActivated { get => emailActivated; set => emailActivated = value; }

        // Functions
        public int Insert()
        {
            UsersDataServices uds = new UsersDataServices();
            return uds.Insert(this);
        }
        public bool EmailExists(string email)
        {
            UsersDataServices uds = new UsersDataServices();
            return uds.EmailExists(email);
        }
        public object Clone()
        {
            return this.MemberwiseClone();
        }
        public List<User> getAllUsers()
        {
            UsersDataServices uds = new UsersDataServices();
            return uds.getAllUsers();
        }
        public void Update()
        {
            UsersDataServices uds = new UsersDataServices();
            uds.Update(this);
        }
        public void DeleteUser(int userId)
        {
            UsersDataServices uds = new UsersDataServices();
            uds.DeleteUser(userId);
        }
        public void RetriveUser(int userId)
        {
            UsersDataServices uds = new UsersDataServices();
            uds.RetriveUser(userId);
        }
        public void Activate(string userEmail)
        {
            UsersDataServices uds = new UsersDataServices();
            uds.Activate(userEmail);
        }
    }
}
       