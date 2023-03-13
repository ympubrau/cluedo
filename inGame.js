console.log('ingame')
let positions = [];
let game_won = false;
let myCell = document.getElementsByClassName('cell-94')[0];
let allCells = [];
let dices_thrown = false;
let move_done = false;
let assumption_making = false;
let assumption_made = false;
let previous_cells = [];
let accusation_making = false;
const cell_names = ['Бильярдная','Библиотека','Кабинет','Кухня','Зимний сад','Гостинная','Бальный зал','Холл','Столовая']
for (let i = 1; i <= 94; i++){
    allCells.push(document.getElementsByClassName('cell-' + i)[0])
    allCells[i-1].addEventListener("click", function(){
        moveHere(i);
    },false);
}

window.onload = function (){
    const url = "https://sql.lavro.ru/call.php?";
    let fd = new FormData();
    fd.append('pname', 'game_state');
    fd.append('db', '283909');
    fd.append('p1', getCookie('token'));
    fd.append('p2', getCookie('gameID'));
    fd.append('format', 'columns_compact');

    const interval = setInterval(function() {
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
                show_game(responseJSON)
            });
    }, 5000);

    if (game_won){
        clearInterval(interval);
    }
}

function show_game(e) {
    document.querySelector(".status").innerText = ' ';
    if (checkSqlErrors(e)) {
        if (e.RESULTS[0].e){
            if (e.RESULTS[0].e[0] === 'Game_ended'){
                show_error(e.RESULTS[2].winner[0] + ' Раскрыл преступление!' +"\n" + e.RESULTS[1].description[0] + " убил с помощью " + e.RESULTS[1].description[1] + " в " + e.RESULTS[1].description[2] + " ")
                return;
            }
        }
        console.log(e);
        let logins = e.RESULTS[1].login;
        let cells = e.RESULTS[1].cell_id;

        for (let i = 1; i < 10; i++){
            document.querySelector('.cell-' + i).innerHTML = cell_names[i-1] + ' (' + i + ')' + '<br>';
        }
        for (let i = 10; i < 95; i++){
            document.querySelector('.cell-' + i).innerHTML = i + '<br>';
        }


        for (let i = 0; i < cells.length; i++) {
            document.querySelector('.cell-' + cells[i]).innerHTML += "<b style='color: #333cff'> " + (logins[i] + "</b>");
        }


        positions = [...cells];

        let notes_id = e.RESULTS[0].card_type_id;
        for (let q of notes_id) {
            let o = document.getElementById(q);
            o.classList.remove('minus');
            o.classList.add('plus');
            o.innerText = '+';
        }

        document.getElementsByClassName('current')[0].innerText = e.RESULTS[2].login;
        document.getElementsByClassName('time')[0].innerText = e.RESULTS[2].end[0].split(' ')[1];

        if (e.RESULTS[2].login[0] === getCookie('login')){

            if (e.RESULTS[2].dice_number[0] < 7 && e.RESULTS[2].dice_number[0] > 0&& !assumption_making && !accusation_making){
                showAvailableCells(e.RESULTS[3].avaliable_cells);
                document.getElementsByClassName('dices')[0].innerText = e.RESULTS[2].dice_number[0];
            }

            document.getElementById('diceThrow').hidden = false;
            document.getElementById('openAssumption').hidden = false;
            document.getElementById('openAccusation').hidden = false;
            document.getElementById('endTurn').hidden = false;

            if (move_done || e.RESULTS[2].dice_number[0] === 7){
                document.getElementById('diceThrow').hidden = true;
                document.getElementById('divDices').hidden = true;
            }

            if (((dices_thrown && e.RESULTS[2].dice_number[0] !== 7) || (e.RESULTS[2].dice_number[0] < 7 && e.RESULTS[2].dice_number[0] > 0)) && !assumption_making && !accusation_making) {
                document.getElementById('diceThrow').hidden = true;
                document.getElementById('divDices').hidden = e.RESULTS[2].dice_number[0] === 0;
            }

            if (assumption_making){
                document.getElementById('diceThrow').hidden = true;
                document.getElementById('openAssumption').hidden = true;
                document.getElementById('openAccusation').hidden = true;
                document.getElementById('endTurn').hidden = true;
            }

            if (accusation_making){
                document.getElementById('diceThrow').hidden = true;
                document.getElementById('openAssumption').hidden = true;
                document.getElementById('openAccusation').hidden = true;
                document.getElementById('endTurn').hidden = true;
            }
        }

        if (e.RESULTS[5].assuming_player[0] != null && e.RESULTS[5].assuming_player[0] !== undefined){
            document.getElementById('openAssumption').hidden = true;
            document.getElementById('assumption').innerText = '';
            document.getElementById('assumption').hidden = false;
            document.getElementById('assumption_commentary').hidden = false;
            if (e.RESULTS[5].assuming_player[0] === getCookie('login')){
                document.getElementById('assumption').innerText =
                    'Вы предположили, что ' +
                    e.RESULTS[5].supposed_persona[0] + ' убил жертву в ' +
                    e.RESULTS[5].room[0] + ' c помощью ' +
                    e.RESULTS[5].weapon[0] + '.'
            }
            else if(e.RESULTS[5].supposed_persona[0] === getCookie('login')){
                document.getElementById('assumption').innerText =
                    e.RESULTS[5].assuming_player[0] + ' предположил, что Вы убили жертву в ' +
                    e.RESULTS[5].room[0] + ' c помощью ' +
                    e.RESULTS[5].weapon[0] + '.'
            }
            else {
                document.getElementById('assumption').innerText =
                    e.RESULTS[5].assuming_player[0] + ' предположил, что ' +
                    e.RESULTS[5].supposed_persona[0] + ' убил жертву в ' +
                    e.RESULTS[5].room[0] + ' c помощью ' +
                    e.RESULTS[5].weapon[0] + '.'
            }
        } else document.getElementById('assumption').innerText = '';
    }
}

function throwDices(){
    const url = "https://sql.lavro.ru/call.php?";

    let fd = new FormData();
    fd.append('pname', 'Throw_dices');
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
        if (responseJSON.RESULTS[0].e){
            console.log(responseJSON.RESULTS[0].e[0]);
            show_error(responseJSON.RESULTS[0].e[0]);
            showAvailableCells([])
        }
        else {
            dices_thrown = true;
            console.log(responseJSON)
            document.getElementById('diceThrow').hidden = true;
            document.getElementById('divDices').hidden = false;
            document.getElementsByClassName('dices')[0].innerText = responseJSON.RESULTS[0].dices[0]
            showAvailableCells(responseJSON.RESULTS[1].avaliable_cells);
        }
    });
}

function endTurn(){
    move_done = true;
    showAvailableCells();
    document.getElementById('divDices').hidden = true;

    dices_thrown = false;
    move_done = false;

    document.getElementById('diceThrow').hidden = true;
    document.getElementById('divDices').hidden = true;
    document.getElementById('openAssumption').hidden = true;
    document.getElementById('assumption_commentary').hidden = true;
    document.getElementById('openAccusation').hidden = true;
    document.getElementById('endTurn').hidden = true;

    const url = "https://sql.lavro.ru/call.php?";
    let fd = new FormData();
    fd.append('pname', 'end_turn');
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
        console.log(responseJSON)
        if (responseJSON.RESULTS[0].e){
            console.log('Not your turn');
            show_error('Сейчас не ваш ход');
        }
        else {
            document.getElementById('assumption').hidden = true;
            showAvailableCells([]);
        }
    });

}

function showAvailableCells(e){
    for (let q of allCells)
        if (q.classList.contains('canChoose'))
            q.classList.remove('canChoose');

    if (move_done || e === null || e === undefined) return;

    for (let q of e){
        let o = document.getElementsByClassName('cell-' + q)[0];
        o.classList.add('canChoose');
    }
}

function moveHere(e) {
    if (!document.getElementsByClassName('cell-' + e)[0].classList.contains('canChoose') || move_done){
        return
    }

    const url = "https://sql.lavro.ru/call.php?";

    let fd = new FormData();
    fd.append('pname', 'make_move');
    fd.append('db', '283909');
    fd.append('p1', getCookie('token'));
    fd.append('p2', getCookie('gameID'));
    fd.append('p3',e);
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
        console.log(responseJSON)
        if (responseJSON.RESULTS[0].e){
            console.log('Not your turn');
            show_error('Сейчас не ваш ход');
        }
        else {
            if (responseJSON.RESULTS[2].dice_number[0] === 7){
                move_done = true;
                showAvailableCells();
                document.getElementById('divDices').hidden = true;
            }
            document.getElementsByClassName('dices')[0].innerText = responseJSON.RESULTS[2].dice_number[0];
            showAvailableCells(responseJSON.RESULTS[1].avaliable_cells);
            if (myCell.classList.contains('currentCell')) myCell.classList.remove('currentCell');
            myCell.innerHTML = e;
            myCell = document.getElementsByClassName('cell-' + e)[0];
            myCell.classList.add('currentCell');
        }
    });
}

function openAssumption() {
    showAvailableCells();
    assumption_making = true;
    document.getElementById('makeAssumption').hidden = false;
    document.getElementById('assumptionText').hidden = false;
    document.getElementById('makeAssumptionButt').hidden = false;
    document.getElementById('cancelAssumption').hidden = false;

    document.getElementById('openAccusation').hidden = true;
    document.getElementById('accusationText').hidden = true;
    document.getElementById('makeAccusationButt').hidden = true;
    document.getElementById('cancelAccusation').hidden = true;
    document.getElementById('roomChoosing').hidden = true;
    document.getElementById('divDices').hidden = true;
    document.getElementById('openAssumption').hidden = true;
    document.getElementById('divDices').hidden = true;
    document.getElementById('diceThrow').hidden = true;
    document.getElementById('endTurn').hidden = true;
}

function closeAssumption(){
    assumption_making = false;
    document.getElementById('makeAssumption').hidden = true;
    document.getElementById('assumptionText').hidden = true;
}

function openAccusation() {
    showAvailableCells();
    accusation_making = true;
    document.getElementById('makeAssumption').hidden = false;
    document.getElementById('accusationText').hidden = false;
    document.getElementById('makeAccusationButt').hidden = false;
    document.getElementById('cancelAccusation').hidden = false;
    document.getElementById('roomChoosing').hidden = false;

    document.getElementById('assumptionText').hidden = true;
    document.getElementById('makeAssumptionButt').hidden = true;
    document.getElementById('cancelAssumption').hidden = true;
    document.getElementById('divDices').hidden = true;
    document.getElementById('openAssumption').hidden = true;
    document.getElementById('divDices').hidden = true;
    document.getElementById('diceThrow').hidden = true;
    document.getElementById('openAccusation').hidden = true;
    document.getElementById('endTurn').hidden = true;
}


function closeAccusation(){
    accusation_making = false;
    document.getElementById('makeAssumption').hidden = true;
    document.getElementById('assumptionText').hidden = true;
}

function makeAssumption() {
    const url = "https://sql.lavro.ru/call.php?";
    let fd = new FormData();
    fd.append('pname', 'make_assumption');
    fd.append('db', '283909');
    fd.append('p1', getCookie('token'));
    fd.append('p2', getCookie('gameID'));
    fd.append('p3', document.getElementById('chPersona').value);
    fd.append('p4', document.getElementById('chWeapon').value);
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
        console.log(responseJSON)
        if (responseJSON.RESULTS[0].e){
            show_error(responseJSON.RESULTS[0].e[0]);
        }
        else if (responseJSON.RESULTS[0].res){
            show_error(responseJSON.RESULTS[0].res[0])
            closeAssumption();
        }
        else {
            alert(`Вы получили новую карту: ${responseJSON.RESULTS[1].description[0]}`);
            assumption_made = true;
            closeAssumption();
        }
    });
}

function makeAccusation() {
    const url = "https://sql.lavro.ru/call.php?";
    let fd = new FormData();
    fd.append('pname', 'make_accusation');
    fd.append('db', '283909');
    fd.append('p1', getCookie('token'));
    fd.append('p2', getCookie('gameID'));
    fd.append('p3', document.getElementById('chPersona').value);
    fd.append('p4', document.getElementById('chWeapon').value);
    fd.append('p5', document.getElementById('chRoom').value);
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
        console.log(responseJSON)
        if (responseJSON.RESULTS[0].e){
            show_error(responseJSON.RESULTS[0].e[0]);
        }
        else {
            if (responseJSON.RESULTS[0].res[0] === 'YOU WON'){
                alert('Вы победили');
            }
            else {
                alert('Вы проиграли. Однако вы можете понаблюдать за игрой :)')
            }
            closeAccusation();
        }
    });
}

function show_error(s) {
    document.querySelector(".status").innerText = s;
}

function checkSqlErrors(e) {
    console.log(e)
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