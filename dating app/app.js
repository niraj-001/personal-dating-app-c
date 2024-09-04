document.addEventListener('DOMContentLoaded', () => {
    const profileForm = document.getElementById('profile-form');
    const profilesList = document.getElementById('profiles-list');
    const matchesList = document.getElementById('matches-list');
    const happyUsersList = document.getElementById('happy-users-list');

    loadProfiles();
    loadMatches();
    loadHappyUsers();

    profileForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const name = document.getElementById('name').value;
        const age = document.getElementById('age').value;
        const gender = document.getElementById('gender').value;

        const interests = Array.from(document.querySelectorAll('input[name="interest"]:checked'))
            .map(input => input.value);

        const newProfile = { name, age, gender, interests };

        saveProfile(newProfile);
        checkForMatches(newProfile);
        displayProfiles();
        
        profileForm.reset();
    });

    function saveProfile(profile) {
        let profiles = JSON.parse(localStorage.getItem('profiles')) || [];
        profiles.push(profile);
        localStorage.setItem('profiles', JSON.stringify(profiles));
    }

    function loadProfiles() {
        const profiles = JSON.parse(localStorage.getItem('profiles')) || [];
        profilesList.innerHTML = '';
        profiles.forEach(profile => {
            const card = createProfileCard(profile);
            profilesList.appendChild(card);
        });
    }

    function checkForMatches(newProfile) {
        let profiles = JSON.parse(localStorage.getItem('profiles')) || [];
        profiles = profiles.filter(profile => profile.name !== newProfile.name && profile.gender !== newProfile.gender);

        profiles.forEach(profile => {
            const commonInterests = newProfile.interests.filter(interest => profile.interests.includes(interest));
            if (commonInterests.length > 0) {
                addMatch(newProfile, profile);
            }
        });
    }

    function addMatch(profile1, profile2) {
        let matches = JSON.parse(localStorage.getItem('matches')) || [];
        if (!matches.some(match => (match.profile1.name === profile1.name && match.profile2.name === profile2.name) ||
                                   (match.profile1.name === profile2.name && match.profile2.name === profile1.name))) {
            matches.push({ profile1, profile2 });
            localStorage.setItem('matches', JSON.stringify(matches));
            displayMatches();
        }
    }

    window.handleLike = function(profileName) {
        const matches = JSON.parse(localStorage.getItem('matches')) || [];
        const match = matches.find(match => match.profile1.name === profileName || match.profile2.name === profileName);

        if (match) {
            addHappyUser(match.profile1, match.profile2);
            // Remove from matches
            const updatedMatches = matches.filter(m => m !== match);
            localStorage.setItem('matches', JSON.stringify(updatedMatches));
            displayMatches();
        }
    };

    window.handleDislike = function(profileName) {
        let profiles = JSON.parse(localStorage.getItem('profiles')) || [];
        let matches = JSON.parse(localStorage.getItem('matches')) || [];
        const profile = profiles.find(p => p.name === profileName);

        if (profile) {
            // Remove from matches if disliked
            matches = matches.filter(match => match.profile1.name !== profileName && match.profile2.name !== profileName);
            localStorage.setItem('matches', JSON.stringify(matches));
            displayMatches();

            // Re-add to profiles
            profiles.push(profile);
            localStorage.setItem('profiles', JSON.stringify(profiles));
            displayProfiles();
        }
    };

    window.handleDelete = function(profileName) {
        let profiles = JSON.parse(localStorage.getItem('profiles')) || [];
        let matches = JSON.parse(localStorage.getItem('matches')) || [];

        // Remove from profiles and matches
        profiles = profiles.filter(profile => profile.name !== profileName);
        matches = matches.filter(match => match.profile1.name !== profileName && match.profile2.name !== profileName);

        localStorage.setItem('profiles', JSON.stringify(profiles));
        localStorage.setItem('matches', JSON.stringify(matches));

        displayProfiles();
        displayMatches();
    };

    function addHappyUser(profile1, profile2) {
        let happyUsers = JSON.parse(localStorage.getItem('happyUsers')) || [];
        happyUsers.push({ profile1, profile2 });
        localStorage.setItem('happyUsers', JSON.stringify(happyUsers));
        displayHappyUsers();
        alert(`Congratulations ${profile1.name} and ${profile2.name}! You are a match!`);
    }

    function displayProfiles() {
        profilesList.innerHTML = '';
        const profiles = JSON.parse(localStorage.getItem('profiles')) || [];
        profiles.forEach(profile => {
            const card = createProfileCard(profile);
            profilesList.appendChild(card);
        });
    }

    function createProfileCard(profile) {
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
            <h3>${profile.name} (Age: ${profile.age})</h3>
            <p>Gender: ${profile.gender}</p>
            <div class="interests-list">
                ${profile.interests.map(interest => `<li>${interest}</li>`).join('')}
            </div>
            <div class="button-group">
                <button class="heart" onclick="handleLike('${profile.name}')">❤️</button>
                <button class="broken-heart" onclick="handleDislike('${profile.name}')">💔</button>
                <button class="delete" onclick="handleDelete('${profile.name}')">🗑️</button>
            </div>
        `;
        return card;
    }

    function loadMatches() {
        const matches = JSON.parse(localStorage.getItem('matches')) || [];
        displayMatches();
    }

    function displayMatches() {
        matchesList.innerHTML = '';
        const matches = JSON.parse(localStorage.getItem('matches')) || [];
        matches.forEach(match => {
            const card = document.createElement('div');
            card.className = 'card';
            card.innerHTML = `
                <h3>${match.profile1.name} & ${match.profile2.name}</h3>
                <p>Interests in common: ${match.profile1.interests.filter(interest => match.profile2.interests.includes(interest)).join(', ')}</p>
                <div class="button-group">
                    <button class="heart" onclick="handleLike('${match.profile1.name}')">❤️</button>
                    <button class="broken-heart" onclick="handleDislike('${match.profile1.name}')">💔</button>
                </div>
            `;
            matchesList.appendChild(card);
        });
    }

    function loadHappyUsers() {
        const happyUsers = JSON.parse(localStorage.getItem('happyUsers')) || [];
        displayHappyUsers();
    }

    function displayHappyUsers() {
        happyUsersList.innerHTML = '';
        const happyUsers = JSON.parse(localStorage.getItem('happyUsers')) || [];
        happyUsers.forEach(happyUser => {
            const card = document.createElement('div');
            card.className = 'card';
            card.innerHTML = `
                <h3>Happy Couple:</h3>
                <p>${happyUser.profile1.name} (Age: ${happyUser.profile1.age}) & ${happyUser.profile2.name} (Age: ${happyUser.profile2.age})</p>
            `;
            happyUsersList.appendChild(card);
        });
    }
});
