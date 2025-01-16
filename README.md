# Take Home Coding
This project is a take home assessment for NodeJS Coding.

## Requirements
- Use Node v21 or higher
- Use Typescript
- Do not use a framework like Nest JS
- Welcome to use any other dependencies (Express, Axios, Got, etc)
- Include unit tests

## Take Home Assessment
Create an API that takes in a year (YYYY format) and returns the one page of movies for that year sorted by descending popularity. 

Your service should not fail if the movie credit API fails for one request. 
The list of editors (retrieved by credits API) is optional in your reponse.

Page is a parameter the API you will be integrating with.

The response will be an array of movies containing
- Title
- Release Date
- Vote Average
- A list of Editors

Following APIs will be used to get data
- Discover Movie API: https://developer.themoviedb.org/reference/discover-movie
- Movie Credit API: https://developer.themoviedb.org/reference/movie-credits

Discover Movie API Request: 
Year will be set by the user of your API
https://api.themoviedb.org/3/discover/movie?language=en-US&page=1&primary_release_year=<YEAR>&sort_by=popularity.desc

Movie Credit API: 
https://developer.themoviedb.org/reference/movie-credits 

To find editors filter for known_for_department and use name property

Do not commit your API Key to the repo; use an ignored .env file. Your code should get a bearer token using your API key.

Results
![image](https://github.com/user-attachments/assets/cb48f039-def2-417a-bd79-8ecc671c0085)
Unit Test Case
![image](https://github.com/user-attachments/assets/1d83ee83-923f-4e27-aa19-b2bee93e2755)

