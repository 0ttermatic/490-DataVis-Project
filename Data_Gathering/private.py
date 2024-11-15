
api_url = "https://na1.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/3cD00aNW2xyXrHPcHiOOn0wWlp8fT1l6mSTgpcZBs3WaM69E_zXlxWuP7cwHF2KCt7vdMXLvSTUNYA?api_key=RGAPI-8c0c1833-36a1-4282-8cf9-208b0aeb7fa7"
api_key = "RGAPI-8c0c1833-36a1-4282-8cf9-208b0aeb7fa7"
puuid = "3cD00aNW2xyXrHPcHiOOn0wWlp8fT1l6mSTgpcZBs3WaM69E_zXlxWuP7cwHF2KCt7vdMXLvSTUNYA"  #actual PUUID
region = "americas"  #region code (e.g., 'americas' for NA, etc.)

resp = requests.get(api_url)

player_info = resp.json()
