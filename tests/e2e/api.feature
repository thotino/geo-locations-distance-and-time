Feature: We test the distance and time API feature

    Scenario: The request should not be valid
        Given a "starting" location with latitude of 33.58 and longitude of -7.6
        When we check the distance and time difference
        Then we should get an error


    Scenario: The request should return a distance in kilometers
        Given a "starting" location with latitude of 33.58 and longitude of -7.6
        And a "ending" location with latitude of 35.68 and longitude of 139.69
        When we check the distance and time difference
        Then we should get 11593 kilometers

    Scenario: The request should return a time difference in hours
        Given a "starting" location with latitude of 33.58 and longitude of -7.6
        And a "ending" location with latitude of 35.68 and longitude of 139.69
        When we check the distance and time difference
        Then we should get 8 hours