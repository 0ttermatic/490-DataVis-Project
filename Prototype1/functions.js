
const ChampionRoles = {
    "Janna": ["Enchanter"],
    "Karma": ["Enchanter"],
    "Lulu": ["Enchanter"],
    "Milio": ["Enchanter"],
    "Nami": ["Enchanter"],
    "Senna": ["Enchanter"],
    "Seraphine": ["Enchanter"],
    "Sona": ["Enchanter"],
    "Soraka": ["Enchanter"],
    "Taric": ["Enchanter", "Warden"],
    "Yuumi": ["Enchanter"],

    "Bard": ["Catcher"],
    "Blitzcrank": ["Catcher", "Vanguard"],  
    "Lux": ["Catcher"],
    "Jhin": ["Catcher"],
    "Morgana": ["Catcher"],
    "Neeko": ["Catcher"],
    "Pyke": ["Catcher"],
    "Rakan": ["Catcher", "Vanguard"], 
    "Thresh": ["Catcher", "Warden"],  
    "Zyra": ["Catcher"],

    "Alistar": ["Vanguard", "Warden"],  
    "Amumu": ["Vanguard"],
    "Leona": ["Vanguard"],
    "Maokai": ["Vanguard"],
    "Nautilus": ["Vanguard"],
    "Rell": ["Vanguard"],

    "Braum": ["Warden"],
    "Poppy": ["Warden"],
    "Renata": ["Warden"],
    "TahmKench": ["Warden"],
  
};

//Create variable to be passed around to other functions
// * PathToFile:    the path to the .json file
// - data:          processed data
async function JsonToVariable(PathToFile) {
    try {
        const data = await d3.json(PathToFile); // Load the JSON file
        return data;
    } catch (error) {
        console.error('Error loading JSON file:', error);
        return null;  // Return null if an error occurs
    }
}




//Create the map of Champions from the processed .json file
// * data:  the processed .json file
// - ChampionCounts: the map for number of each champion in the data
function CreateChampionMap(data)
{
    var ChampionCounts = {};

    data.forEach(entry => 
    {
        const name = entry.championName;
        if (ChampionCounts[name])
        {
            ChampionCounts[name] += 1;
        }
        else
        {
            ChampionCounts[name] = 1;
        }
    });


    // Filter out champions with counts of 2 or less
    ChampionCounts = Object.entries(ChampionCounts)
        .filter(([champion, count]) => count > 2) // Keep only champions with count > 2
        .sort((a, b) => b[1] - a[1]); // Sort by count in descending order

    // Return the sorted array of champions and their counts
    return ChampionCounts;
}


function SortChampsToRoles(CountOfChampions) {
    const sortedRoles = {
        "Enchanters": [],
        "Catchers": [],
        "Engage": [],
        "Peel": []
    };

    // Loop through each champion and their count
    for (const [champion, count] of Object.entries(CountOfChampions)) {
        if (ChampionRoles[champion]) {  // Check if the champion has roles
            // Log the champion and their roles for debugging
            console.log(`Champion: ${champion}, Roles: ${ChampionRoles[champion]}`);
            
            // For each champion, iterate over all their roles
            ChampionRoles[champion].forEach(role => {
                switch (role) {
                    case "Enchanter":
                        sortedRoles["Enchanters"].push({ champion, count });
                        break;

                    case "Catcher":
                        sortedRoles["Catchers"].push({ champion, count });
                        break;

                    case "Vanguard":
                        sortedRoles["Engage"].push({ champion, count });
                        break;

                    case "Warden":
                        sortedRoles["Peel"].push({ champion, count });
                        break;

                    default:
                        break;
                }
            });
        }
    }

    // Sort each role by count in descending order
    for (let role in sortedRoles) {
        sortedRoles[role].sort((a, b) => b.count - a.count);
    }

    return sortedRoles;
}