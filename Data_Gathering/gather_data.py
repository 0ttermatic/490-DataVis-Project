import requests
import time
import json

#importing private file
from private import api_url, api_key, puuid, region




def GatherMatches():
   
    match_ids = []
    start = 0
    count = 100  # Fetch up to 100 matches at a time
    
    while start < 1000: #gather up to 1000
        url = f"https://{region}.api.riotgames.com/lol/match/v5/matches/by-puuid/{puuid}/ids"
        params = {
            "start": start,
            "count": count
        }
        headers = {"X-Riot-Token": api_key}
    
        response = requests.get(url, headers=headers, params=params)
        if response.status_code != 200:
            print(f"Error fetching matches: {response.status_code}")
            break
    
        batch = response.json()
        if not batch:
            # Exit loop if there are no more matches
            break
    
        match_ids.extend(batch)
        start += count  # Move to the next set of matches
    
        print(f"Retrieved {len(batch)} matches, total so far: {len(match_ids)}")
    
    print("Total matches retrieved:", len(match_ids))



def GatherDataFromMatches():        
    # List to store processed match data
    match_data_summary = []
    
    
    # Variables for calculating average deaths
    total_deaths = 0
    total_matches = 0
    
    for match_id in match_ids:  # Limit to the first 30 matches
        url = f"https://{region}.api.riotgames.com/lol/match/v5/matches/{match_id}"
        headers = {"X-Riot-Token": api_key}
        
        response = requests.get(url, headers=headers)
        
         # Pause to respect rate limits
        time.sleep(3)
       
        if response.status_code == 200:
            match_data = response.json()
            
            # Check if match is ranked solo/duo or ranked flex
            queue_id = match_data['info']['queueId']
            if queue_id not in [420, 440, 430, 400]:
                print(f"Skipping match {match_id}: Not ranked solo/duo, flex, or normal game")
                continue  # Skip to the next match if not the desired type
    
        # Find the participant data for your summoner
            participant_data = next((p for p in match_data['info']['participants'] if p['puuid'] == puuid), None)
            
            if participant_data:
                # Game length (in minutes)
                game_duration_seconds = match_data['info']['gameDuration']
                game_duration_minutes = game_duration_seconds / 60  # Convert seconds to minutes
    
                # Determine the team ID to find out if it was Blue or Red
                team_id = participant_data['teamId']
                side = "Blue" if team_id == 100 else "Red"
                
                # Total kills
                totalkills = sum(team['objectives']['champion']['kills'] for team in match_data['info']['teams'])
    
                # Total kills for your team
                team_kills = sum(p['kills'] for p in match_data['info']['participants'] if p['teamId'] == team_id)
     
                # Personal deaths and champion played
                deaths = participant_data['deaths']
                kills = participant_data['kills']
                assists = participant_data['assists']
                champion_id = participant_data['championId']
                champion_name = participant_data['championName']  # You can also get champion name if available
    
                #win/loss
                win = participant_data['win']  # Check if the game was won
                
                if win:
                    winloss = "Win"
                else:
                    winloss = "Loss"
                    
    #########################################  WHERE DEATH HAPPENED DATA  #########################################################################
                # list to store my death locations
                death_locations = []
                
                # Retrieve timeline data for death locations
                timeline_url = f"https://{region}.api.riotgames.com/lol/match/v5/matches/{match_id}/timeline"
                timeline_response = requests.get(timeline_url, headers=headers)
                
                if timeline_response.status_code == 200:
                    timeline_data = timeline_response.json()
                    
                    # Participant ID mapping
                    participant_id = next((p['participantId'] for p in timeline_data['info']['participants'] if p['puuid'] == puuid), None)
                    
                    if participant_id:
                        # Iterate through each frame to find deaths
                        for frame in timeline_data['info']['frames']:
                            for event in frame['events']:
                                if event['type'] == "CHAMPION_KILL" and event['victimId'] == participant_id:
                                    death_position = event.get('position', {})
                                    x, y = death_position.get('x'), death_position.get('y')
                                    
                                    # Store death location
                                    death_locations.append({
                                        "x": x,
                                        "y": y
                                    })
    
    # # #   # # #   # # #   # # #   # # #   # # #   # # #   # # #   # # #   # # #   # # #   # # #   # # #   # # #   # # #   # # #   # # #   # # #   
    
                
                # Append to summary list
                match_data_summary.append({
                    "matchId": match_id,
                    "Win/Loss": winloss,
                    "side": side ,
                    "gameDurationMinutes": game_duration_minutes,
                    "totalKills-Ingame": totalkills,
                    "totalMyteamKills": team_kills,
                    "championId": champion_id,
                    "championName": champion_name,
                    "Mykills": kills,
                    "MYdeaths": deaths,
                    "MYassists": assists,
                    "deathLocations": death_locations,
                })
                
                # Update total deaths and match count for average calculation
                total_deaths += deaths
                total_matches += 1
                
                print(f"Match {match_id}: {game_duration_minutes:.2f} minutes, {team_kills} total kills, {deaths} deaths, Champion: {champion_name}")
    
        else:
            print(f"Error fetching match {match_id}: Status code {response.status_code}")
        
    # Calculate average deaths if any matches were found
    average_deaths = total_deaths / total_matches if total_matches > 0 else 0
    
    # Print average deaths
    print(f"Average deaths over {total_matches} matches: {average_deaths:.2f}")





def SaveToFile:

    # Save the match data summary to JSON
    filename = 'match_data.json'

    
    with open(filename, 'w') as json_file:
        json.dump(match_data_summary, json_file, indent=4)
    
    print(f"Match data has been saved to {filename}")
    

