# Rehome Me
Rehome me - Module 2 Project - Ironhack

## Developers
Alba Gustems – Juli Ramon

## Link to APP
[Link to Rehome Me](#)

## Description
An app where users can rehome or adopt pets permanently or temporarily. 


## User Stories
- **404**: As a user I want to know when a page no longer exists.
- **500**: As a user I want to know when something went wrong with the page so that I know it’s not my fault. 
- **homepage**: As a user I want to be able to access the homepage to see how the app works, check the list of pets and login and sign up to my account
- **sign up**: As a user I want to sign up to the webpage to create my personal account and see all the listed pets for rehoming
- **login**: As a user I want to log in to the webpage to access and manage my personal account
- **logout**: As a user I want to be able to log out from the webpage so that no one else access my account
- **user profile: As a user I want to be able to access my user profile to manage my animals
animals list**: As a user I want to see all pets available for rehoming so that I can choose which ones I want to accommodate
- **animals create**: As a user I want to create new pets so that other users can rehome them
- **animal details**: As a user I want to know the details of the animal so I can decide if I’m a good fit for it.
- **animal rehoming**: As a user I want to offer myself as a new permanent or temporary home for a listed pet


## Backlog
List of extra features not included in the MVP:

- App stylesheets
- Search filters
- User picture profile
- List of voluntary adopters
- User rating 

### Geo Location
- Add geolocaion to the pets that are available for rehoming
- Show animals in need for adoption in the map


## Routes
| Method  | URL  | Description                                       |
|---------|------|---------------------------------------------------|
| GET     | /    | Homepage with description of the adoption process |


## Models

### User model
- username: String
- password: String
- email address: String
- avatar: String
- pets: [String]
