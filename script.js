let token;
let gameStarted = false;
let inMainMenu = true;
let chosenPersona = 0;
const personas = ['',"orchid","peacock",'scarlet','mustard','plum','green']

function sign_in() {
    const url = "https://sql.lavro.ru/call.php?";
    let form = new FormData(document.getElementById('logForm'));
    let fd = new FormData();
    fd.append('pname', 'sign_in');
    fd.append('db', '283909');
    fd.append('p1', form.get('user_name'));
    fd.append('p2', form.get('user_password'));
    fd.append('format', 'columns_compact');

    fetch(url, {
        method: "POST",
        body: fd
    }).then((response) => {
        if (response.ok){
            return response.json()
        }
        else {
            return show_error('ошибка сети)');
        }
    }).then((responseJSON) => {
            signInRes(responseJSON, form.get('user_name'))
        });
}

function register() {
    const url = "https://sql.lavro.ru/call.php?";
    let form = new FormData(document.getElementById('regForm'));
    let fd = new FormData();
    fd.append('pname', 'register');
    fd.append('db', '283909');
    fd.append('p1', form.get('user_name'));
    fd.append('p2', form.get('user_password'));
    fd.append('format', 'columns_compact');

    fetch(url, {
        method: "POST",
        body: fd
    }).then((response) => {
        if (response.ok){
            return response.json()
        }
        else {
            return show_error('ошибка сети)');
        }
    }).then((responseJSON) => {
        signInRes(responseJSON, form.get('user_name'))
    });
}

function signInRes(e, qwe){
    console.log(e)
    if (checkSqlErrors(e)){
        token = e.RESULTS[0].token[0];
        deleteCookies();
        if (qwe !== undefined){
            setCookie('login', qwe)
        }
        setCookie('token',token)
        console.log(getCookie('token'))
        window.location.href = ("roomState.html");
        const q = setInterval(null,5000);
        clearInterval(q)
    }
}

window.onload = function () {
    if (window.location.href.match(/([^/]*)$/)[0] === 'roomState.html') {

        if (inMainMenu){
            const url = "https://sql.lavro.ru/call.php?";
            let fd = new FormData();
            fd.append('pname', 'free_rooms');
            fd.append('db', '283909');
            fd.append('p1', getCookie('token'));
            fd.append('format', 'columns_compact');

            const interval = setInterval(function() {
                 if (inMainMenu){
                    fetch(url, {
                        method: "POST",
                        body: fd
                    }).then((response) => {
                        if (response.ok){
                            return response.json()
                        }
                        else {
                            return show_error('ошибка сети)');
                        }
                    }).then((responseJSON) => {
                        displayFreeGames(responseJSON.RESULTS[0])
                    });
                }
                else {
                    console.log('finished')
                    clearInterval(interval);
                }
            }, 5000);
        }


    }
}

function displayFreeGames(gameList){
    let destDiv = document.getElementById('freeGames')
    console.log(gameList)
    if (gameList.available_games === undefined){
        destDiv.innerHTML = ' '
        destDiv.innerHTML += "<p>No free rooms available</p>"
    }
    else{
        destDiv.innerHTML = ' '
        for (let e of gameList.available_games){
            destDiv.innerHTML += '<div>' + e + '</div>'
        }
    }
}

function newGame() {
    inMainMenu = false;
    const url = "https://sql.lavro.ru/call.php?";
    let fd = new FormData();
    fd.append('pname', 'new_game');
    fd.append('db', '283909');
    fd.append('p1', getCookie('token'));
    fd.append('p2', document.getElementById('gamePassInput').checked ? '1' : 'null');
    fd.append('format', 'columns_compact');

    document.getElementById('game_token').disabled = true;
    document.getElementById('game_pass').disabled = true;
    document.getElementById('gamePassInput').disabled = true;
    document.getElementById('newGameButt').disabled = true;
    document.getElementById('connectGameButt').disabled = true;

    fetch(url, {
        method: "POST",
        body: fd
    }).then((response) => {
        if (response.ok){
            return response.json()
        }
        else {
            return show_error('ошибка сети)');
        }
    }).then((responseJSON) => {
        setCookie('gameID', responseJSON.RESULTS[0].Game_id[0])
        if (responseJSON.RESULTS[1].Game_password !== undefined && responseJSON.RESULTS[1].Game_password !== null){
            console.log('qwe')
            setCookie('pass',responseJSON.RESULTS[1].Game_password[0]);
        }
        else setCookie('pass',null);
        inGameNow(responseJSON)
    });
}

function connectGame(){
    inMainMenu = false;
    const url = "https://sql.lavro.ru/call.php?";
    let fd = new FormData();
    fd.append('pname', 'enter_game');
    fd.append('db', '283909');
    fd.append('p1', getCookie('token'));
    fd.append('p2', document.getElementById('game_token').value);
    fd.append('p3', document.getElementById('game_pass').value);
    fd.append('format', 'columns_compact');

    document.getElementById('game_token').disabled = true;
    document.getElementById('game_pass').disabled = true;
    document.getElementById('gamePassInput').disabled = true;

    fetch(url, {
        method: "POST",
        body: fd
    }).then((response) => {
        if (response.ok){
            return response.json()
        }
        else {
            return show_error('ошибка сети)');
        }
    }).then((responseJSON) => {
        if (checkSqlErrors(responseJSON)){
            if (!responseJSON.RESULTS[0].e){
                console.log(responseJSON)
                setCookie('gameID', responseJSON.RESULTS[0].Game_id[0]);
                if (responseJSON.RESULTS[1].Game_password !== undefined && responseJSON.RESULTS[1].Game_password !== null){
                    setCookie('pass',responseJSON.RESULTS[1].Game_password[0]);
                }
            }
        }
        inGameNow(responseJSON)
    });
}

function inGameNow(e){
    console.log(e)
    if (checkSqlErrors(e)){
        document.getElementById("gameInfo").removeAttribute('hidden')

        const url = "https://sql.lavro.ru/call.php?";
        let fd = new FormData();
        fd.append('pname', 'room_state');
        fd.append('db', '283909');
        fd.append('p1', getCookie('token'));
        fd.append('p2', getCookie('gameID'));
        fd.append('format', 'columns_compact');

        const interval = setInterval(function() {
            if (!gameStarted){
                fetch(url, {
                    method: "POST",
                    body: fd
                }).then((response) => {
                    if (response.ok){
                        return response.json()
                    }
                    else {
                        return show_error('ошибка сети)');
                    }
                }).then((responseJSON) => {
                    updateRoomInfo(responseJSON)
                });
            }
            else {
                clearInterval(interval);
            }
        }, 5000);
    }
}

function updateRoomInfo(e){
    console.log(e)

    if (e.RESULTS[5].status){
        window.location.href = 'game.html';
        console.log(responseJSON);
    }
    displayFreeGames(e.RESULTS[0])
    let playersDiv = document.getElementById('listPLayers')
    let gAdmin = document.getElementById('gameAdmin')
    let gPass = document.getElementById('gamePass')
    let gId = document.getElementById('gameId')

    gId.innerHTML = ' '
    gId.innerHTML = '<div>' + getCookie('gameID') + '</div>'

    playersDiv.innerHTML = ' '
    for (let q of e.RESULTS[2].login){
        playersDiv.innerHTML += '<div>' + q + '</div>'
    }

    gAdmin.innerHTML = ' '
    gAdmin.innerHTML = '<div>'  + e.RESULTS[1].game_admin + '</div>'

    console.log(getCookie('login'))
    console.log(e.RESULTS[1].game_admin)
    if (getCookie('login') === e.RESULTS[1].game_admin[0]){
        if ( e.RESULTS[3].login.length >= 3) document.getElementById('gameStart').removeAttribute('hidden')
        getCookie('pass') == null ? gPass.innerHTML = '<div>У данной комнаты нет пароля</div>' : gPass.innerHTML = '<div>' + getCookie('pass') + '</div>'
    }


    clearPersonas();
    let counter = 0;
    for (let a of e.RESULTS[3].login){
        if (a === getCookie('login')) {
            counter++;
            continue;
        }
        if (e.RESULTS[3].description[counter] !== null){
            choosePersona(convertPersona(e.RESULTS[3].description[counter]),a)
        }
        counter++;
    }
}

function clearPersonas(){
    for (let i = 1; i < personas.length; i++){
        if (personas[i] === chosenPersona) continue;

        let e = document.getElementById(personas[i] + 'IMG');
        if (e.classList.contains('chosen')){
            e.classList.remove('chosen')
            e.classList.add('choosable')
            document.getElementById(personas[i]).innerHTML = 'Свободно'
        }
    }
}

function convertPersona(e){
    switch (e){
        case('Доктор Орчид'):
            return 'orchid';
        case('Миссис Пикок'):
            return 'peacock';
        case('Мисс Скарлет'):
            return 'scarlet';
        case('Полковник Мастард'):
            return 'mustard';
        case('Профессор Плам'):
            return 'plum';
        case('Преподобный Грин'):
            return 'green';
    }
}

function choosePersonaSql(e){
    let orc = document.getElementById(e + 'IMG');
    if (orc.classList.contains('chosen')) return;

    let pers = personas.indexOf(e);
    choosePersona(e);
    const url = "https://sql.lavro.ru/call.php?";
    let fd = new FormData();
    fd.append('pname', 'choose_persona');
    fd.append('db', '283909');
    fd.append('p1', getCookie('token'));
    fd.append('p2', getCookie('gameID'));
    fd.append('p3', pers + "");
    fd.append('format', 'columns_compact');

    fetch(url, {
        method: "POST",
        body: fd
    }).then((response) => {
        if (response.ok){
            return response.json()
        }
        else {
            return show_error('ошибка сети)');
        }
    }).then((responseJSON) => {
        choosePersona(e)
    });
}

function choosePersona(pers, nickname){
    let orc;
    if (nickname === undefined){
        if (chosenPersona === pers) return;

        if (chosenPersona !== 0){
            let orc = document.getElementById(chosenPersona + 'IMG');
            orc.classList.remove('chosen')
            orc.classList.add("choosable");
            orc = document.getElementById(chosenPersona)
            orc.innerHTML = 'Свободно'
        }

        chosenPersona = pers
    }

    orc = document.getElementById(pers + 'IMG');
    orc.classList.add('chosen')
    orc.classList.remove("choosable");
    orc = document.getElementById(pers)
    nickname === undefined ? orc.innerHTML = getCookie('login') : orc.innerHTML = nickname
}

function startGame(){
    const url = "https://sql.lavro.ru/call.php?";
    let fd = new FormData();
    fd.append('pname', 'start_game');
    fd.append('db', '283909');
    fd.append('p1', getCookie('token'));
    fd.append('p2', getCookie('gameID'));
    fd.append('format', 'columns_compact');

    fetch(url, {
        method: "POST",
        body: fd
    }).then((response) => {
        if (response.ok){
            return response.json()
        }
        else {
            return show_error('ошибка сети)');
        }
    }).then((responseJSON) => {
        console.log('in start game');
        console.log(responseJSON);
        console.log('end')
        if (responseJSON.RESULTS[0].error){
            alert(responseJSON.RESULTS[0].error)
        }
        else {
            //window.location.href = 'game.html';
        }
    });

}

function show_error(s) {
    document.querySelector(".status").innerText = s;
}

function checkSqlErrors(e) {
    if(e.RESULTS[0].error){
        show_error(e.RESULTS[0].error);
    }
    else {
        return true;
    }
}

function getCookie(name) {
    let matches = document.cookie.match(new RegExp(
        "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
    ));
    return matches ? decodeURIComponent(matches[1]) : undefined;
}


function deleteCookies() {
    var allCookies = document.cookie.split(';');
    for (var i = 0; i < allCookies.length; i++)
        document.cookie = allCookies[i] + "=;expires="
            + new Date(0).toUTCString();
}

function setCookie(name, value, options = {}) {

    options = {
        path: '/',
        // при необходимости добавьте другие значения по умолчанию
        ...options
    };

    if (options.expires instanceof Date) {
        options.expires = options.expires.toUTCString();
    }

    let updatedCookie = encodeURIComponent(name) + "=" + encodeURIComponent(value);

    for (let optionKey in options) {
        updatedCookie += "; " + optionKey;
        let optionValue = options[optionKey];
        if (optionValue !== true) {
            updatedCookie += "=" + optionValue;
        }
    }

    document.cookie = updatedCookie;
}


