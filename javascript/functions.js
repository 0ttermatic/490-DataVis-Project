
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
    "Zilean": ["Enchanter"],


    "Bard": ["Catcher"],
    "Blitzcrank": ["Catcher", "Vanguard"],  
    "Lux": ["Catcher"],
    "Jhin": ["Catcher"],
    "Morgana": ["Catcher"],
    "Neeko": ["Catcher"],
    "Pantheon": ["Catcher"],
    "Pyke": ["Catcher"],
    "Rakan": ["Catcher", "Vanguard"], 
    "Thresh": ["Catcher", "Warden"],  
    "Zyra": ["Catcher"],
    "Swain": ["Catcher"],


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


    "Aphelios": ["ADC"],
    "Ashe": ["ADC"],
    "Caitlyn": ["ADC"],
    "Draven": ["ADC"],
    "Ezreal": ["ADC"],
    "jhin": ["ADC"],
    "Jinx": ["ADC"],
    "Kaisa": ["ADC"],
    "Kalista": ["ADC"],
    "KogMaw": ["ADC"],
    "MissFortune": ["ADC"],
    "Samira": ["ADC"],
    "Seraphine" : ["ADC"],
    "Smolder": ["ADC"],
    "Sivir": ["ADC"],
    "Tristana": ["ADC"],
    "Twitch": ["ADC"],
    "Varus": ["ADC"],
    "Vayne": ["ADC"],
    "Xayah": ["ADC"],
    "Zeri": ["ADC"],

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
        return null;  
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



//Extract the champion data to be used by d3 functions
// * data:                  the processed .json file
// - categoryDetails:       creates an array with category, win, and gamelength if the champion is in the ChampionRoles list at the top of the file
function extractCategoryDetails(data) {
    const categoryDetails = [];

    data.forEach(game => {
        const { gameDurationMinutes, championName } = game;
        const winLoss = game["Win/Loss"]; // Access the property with brackets

        // Convert game duration to minutes
        const gameLength = Math.floor(gameDurationMinutes);

        // Check if the champion has defined roles
        if (ChampionRoles[championName]) {
            ChampionRoles[championName].forEach(category => {
                categoryDetails.push({
                    category,
                    win: winLoss === "Win", 
                    gameLength
                });
            });
        } 
    });

    return categoryDetails;
}



//Extract the champion data to be used by d3 functions
// * categoryDetails:                  the map of champions to their roles and t
// - EnchanterWardenData:   Data on the champions in the Enchanter/Warden group at the top of this file
// - CatcherVanguardData:   Data on the champions in the Catcher/Vanguard group at the top of this file
// - ADCData:               Data on the champions in the ADC group at the top of this file
function processWinRateData(categoryDetails) {
    const categories = ["15-20 min", "21-25 min", "26-31 min", "32-37 min", "38+"];
    
    // Function to process data for specific categories
    function getCategoryWinRateData(filteredCategoryDetails) {
        return categories.map(category => {
            // Filter data for the specified category and game length
            const categoryGames = filteredCategoryDetails.filter(game => {
                const gameLength = game.gameLength;

                // Filter games based on the length category
                if (category === "15-20 min") return gameLength >= 15 && gameLength <= 20;
                if (category === "21-25 min") return gameLength >= 21 && gameLength <= 25;
                if (category === "26-31 min") return gameLength >= 26 && gameLength <= 31;
                if (category === "32-37 min") return gameLength >= 32 && gameLength <= 37;
                if (category === "38+") return gameLength >= 38;

                return false;
            });

            // Calculate the win rate for this category
            const totalGames = categoryGames.length;
            console.log(`Total games in ${category}: ${totalGames}`);

            // Count wins 
            const wins = categoryGames.filter(game => game.win === true).length;
            console.log(`Wins in ${category}: ${wins}`);

            const winRate = totalGames > 0 ? wins / totalGames : 0;

            return {
                category: category,
                winRate: winRate
            };
        });
    }

    // Filter for "Enchanter" or "Warden"
    const enchanterOrWardenGames = categoryDetails.filter(game => game.category === "Enchanter" || game.category === "Warden");
    const enchanterOrWardenData = getCategoryWinRateData(enchanterOrWardenGames);

    // Filter for "Catcher" or "Vanguard"
    const catcherOrVanguardGames = categoryDetails.filter(game => game.category === "Catcher" || game.category === "Vanguard");
    const catcherOrVanguardData = getCategoryWinRateData(catcherOrVanguardGames);

     // Filter for "ADC"
     const ADCGames = categoryDetails.filter(game => game.category === "ADC");
     const ADCData = getCategoryWinRateData(ADCGames);
     
     
    // Combine the results from both sets
    return {
        enchanterOrWardenData,
        catcherOrVanguardData,
        ADCData
    };
}





function calculateSidePercentage(data) {
    let redCount = 0;
    let blueCount = 0;

    // Loop through each game entry to count the sides
    data.forEach(game => {
        if (game.side === "Red") {
            redCount++;
        } else if (game.side === "Blue") {
            blueCount++;
        }
    });

    // Calculate total games
    const totalGames = redCount + blueCount;

    // Calculate the percentage for red and blue sides
    const redPercentage = (redCount / totalGames) * 100;
    const bluePercentage = (blueCount / totalGames) * 100;

    
    return {
        redPercentage: redPercentage.toFixed(2), 
        bluePercentage: bluePercentage.toFixed(2)
    };
}



