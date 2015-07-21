# sentimentAnalysis
[see this app in action!](https://gelp-plus.herokuapp.com/)

This app (Gelp) allows users to compare both scores from Yelp and Google+ for a restaurant at the same time. It uses the Yelp and Google Maps api's. 

BUT the most exciting part of the project and part into which I've invested the most time isn't yet visible (though soon to come) is a third score of each location based on sentiment analysis of the text content of its reviews.

The third score is generated by feeding text of reviews that users have written on Yelp and Google+ to Alchemy Lab's Sentiment Analysis api to score each review, then the sum of those scores are scaled out of 5 to be easily compared with those of Yelp and Google+. I have created a scale out of 5 for my third score by calculating the sentiment of thousands of reviews and using a quantile method to find which sentiment scores correlate with each rating out of 5. 

This methodology is significant and different, because normally on Yelp and Google+, USERS give the score for a location, and the same score could have different meanings for different users. So, by using the same rubric or criteria of a computer program to assign scores based on the words for all users reviews, hopefully the new, calculated scores can provide a more objective or accurate rating for a restaurant.

Also, I plan to conduct some more interesting analysis like what is the correlation between the three kinds of scores (e.g,. does the computer agree more often with users' ratings when they are bad, good or somewhere in the middle? or perhaps only on certain kinds of food? or a certain price category of food? or when there are a certain number of reviews? which of the first two ratings, Yelp or Google+, tends to be closer to my calculated score (and so tends on average to be arguably more accurate) Some small insights I've already noticed: of the categories I've examined, sushi, ice cream and bars all have about the same average for their scores and their average is much higher than the other categories (e.g., pizza, sandwiches, tacos, Chinese). Thus far, I'm basing my model for the third, calculated rating based on restaurant reviews in SF, will this be effective for other cities too?

Additionally, users have access to full CRUD (the main purpose of the assignment) and can create accounts to add and save locations and write their own reviews of a location. These pages of the website aren't styled yet, but they all work. I need to add some additional features like a 'save' button in the search results that will automatically create and save that restaurant so that it's info doesn't need to be typed in, a map for each restaurant's individual page, etc.

