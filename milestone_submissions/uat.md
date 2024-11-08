Feature: Logging in/Registering
- UAT
  - A user cannot log in without the proper credentials
    - Username
    - Email
    - Password
    - Confirm Password
  - Invalid credentials give the user an unauthorized or try again later

- Data will be a set of credentials that are both in and not in the login table
- It will be on the cloud
- If it is succesful it will log them in, if failure it will tell them to try again
- The testers might be other members of the classroom!


Feature: Logging a Send!
- UAT
  - A user can log a send with the following fields
    - Climb Name
    - What the climber thought about the posted grade
    - Description of send (optional)
    - Photo (optional)
    - Video (optional)
  - If the user does not fill in the required fields, it will not let them log the send

- Data will be a set of sends that are both valid and invalid, with varying levels of specificity (e.g. number of optional fields).
- It will be on the cloud
- If it is succesful it will log the climb, if it fails it will highlight the unfilled field.
- The testers might be other members of the classroom!


Fetaure: Following/Unfollowing a User
- UAT
  - A user should be able to follow another user to be able to view the other user's sends in their own feed.
    - Needs a table to store follows and what to display
  - Unfollowing a user removes their climbs from the feed

- Data will be a set of users to follow and unfollow
- It will be on the cloud
- After following it will display a banner that expresses follows and then the followed users post will show up in the follower's feed
- The testers might be other members of the classroom!