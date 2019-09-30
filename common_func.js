const Role = {
    WEREWOLF: 0,
    TOWNSFOLK: 1,
    SEER: 2,
    WITCH: 3,
    HUNTER: 4,
    IDIOT: 5
}
Object.freeze(Role);

const RolePriority = {
    WEREWOLF: 10,
    WITCH: 11,
    SEER: 12,
    HUNTER: 13,
    TOWNSFOLK: 99,
    IDIOT: 99,
    BLIND: 99
}
Object.freeze(RolePriority);

const Victory = {
    NOTEND: 0,
    GOOD: 1,
    WEREWOLF: 2,
    THIRDPARTY: 3
}
Object.freeze(Victory);

const GamePattern = {
    YUNVLIEBAI: 0
}
Object.freeze(GamePattern);

const SheriffHuntStatus = {
  CANCEL: 0,
  HUNT: 1,
  QUIT: 2
}
Object.freeze(SheriffHuntStatus);

function getRoleName(role){
    switch(role){
        case Role.WEREWOLF:
            return "狼人";
        case Role.TOWNSFOLK:
            return "村民";
        case Role.SEER:
            return "预言";
        case Role.WITCH:
            return "女巫";
        case Role.HUNTER:
            return "猎人";
        case Role.IDIOT:
            return "白痴";
        default:
            return "";
    }
}

function getRolePriority(role){
    switch(role){
        case Role.WEREWOLF:
            return RolePriority.WEREWOLF;
        case Role.TOWNSFOLK:
            return RolePriority.TOWNSFOLK;
        case Role.SEER:
            return RolePriority.SEER;
        case Role.WITCH:
            return RolePriority.WITCH;
        case Role.HUNTER:
            return RolePriority.HUNTER;
        case Role.IDIOT:
            return RolePriority.IDIOT;
        default:
            return 99;
    }
}

function convertGamePattern(str){
    switch(str.toLowerCase()){
        case 'yunvliebai':
            return GamePattern.YUNVLIEBAI;
        default:
            return -1;
    }
}

function numberPlus1($str){
    return parseInt($str) + 1;
}

function numberMinus1($str){
    return parseInt($str) - 1;
}

function clearSheriffHuntIcon(){
    $('.sheriff-hunt-icon').each(function(){
        $(this).html('');
    });
}

function sheriffHuntVoteResult($votes, $isFirstRound){
    let $winner = listVoteResult(sheriffHuntVotes);
    let $text = '';
    // outer global variable
    validCandidates = [];
    if (!$winner) {
        $text =  '警徽流失';
        clearSheriffHuntIcon();
    } else if (1 == $winner.length) {
        clearSheriffHuntIcon();
        $text =  $winner[0] + '号玩家当选警长';
        let html = '<img src="badge.jpeg">';
        let $obj = $('.nth-user[value="' + numberMinus1($winner[0]) + '"]').parent().children('.sheriff-hunt-icon');
        $obj.html(html);
    } else {
        if ($isFirstRound) {
            $text =  $winner.join(',') + '号玩家平票PK';
        } else {
            $text =  $winner.join(',') + '号玩家平票，警徽流失';
            clearSheriffHuntIcon();
        }
        for (let i = 0; i < $winner.length; i++) {
            validCandidates.push(numberMinus1($winner[i]));
        }
    }
    setStatusBar($text);
}

function listVoteResult($votes){
    let $result = [];
    let $displays = [];
    for(let i = 0; i < $votes.length; i++) {
        $candidate = $votes[i];
        if (-1 != $candidate) {
            if ($displays[$candidate]){
                $displays[$candidate].push(numberPlus1(i));
            } else {
                $displays[$candidate] = [numberPlus1(i)];
            }
        }
    }
    let $html = '<div class="vote-result-display-title">投票结果</div>';
    if (0 == $displays.length) {
        $html += '无人投票';
        $('.vote-result-display').html($html);
        return;
    }
    let $max = 0;
    for(let i = 0; i < $displays.length; i++) {
        if ($displays[i]) {
            let $candidate = numberPlus1(i);
            $html += '<div class="vote-result-display-record">';
            $html += '  <div class="vote-result-display-candidate">' + $candidate + '</div>';
            $html += '  <div class="vote-result-display-voters">';
            $html += $displays[i].join(',');
            $html += '  </div>';
            $html += '</div>';
            $html += '<div class="clear-float"></div>';
            if ($displays[i].length > $max) {
                $max = $displays[i].length;
                $result = [numberPlus1(i)];
            } else if ($displays[i].length == $max) {
                $result.push(numberPlus1(i));
            }
        } 
    }
    $('.vote-result-display').html($html);
    return $result;
}

function setSheriffHuntStatus($sheriffHuntStatus){
    let html = '';
    let $obj;
    for(let i = 0; i < $sheriffHuntStatus.length; i++) {
        if (SheriffHuntStatus.HUNT == $sheriffHuntStatus[i]) {
            $obj = $('.nth-user[value="' + i + '"]').parent().children('.sheriff-hunt-icon');
            html = '<img src="sheriff_hunt.jpeg">';
            $obj.html(html);
        } else if (SheriffHuntStatus.QUIT == $sheriffHuntStatus[i]) {
            $obj = $('.nth-user[value="' + i + '"]').parent().children('.sheriff-hunt-icon');
            html = '<img src="sheriff_hunt_quit.jpeg">';
            $obj.html(html);
        }
    }
}

function setSeat($socket, $obj, $username, $avatar_path){
    let user_circle = $obj.children('.user-circle');
    let html = '<img src="' + $avatar_path + '">';
    user_circle.html(html);
    user_circle.removeClass('unseated');
    user_circle.addClass('seated');
    $obj.children('.user-name').html($username);
    let tmpSeatNumber = $obj.children('.nth-user').val();
    $socket.emit('set seat', { seatNumber: tmpSeatNumber, username: $username, avatar_path: $avatar_path });

    return tmpSeatNumber;
}

function setOtherSeat($seatNumber, $username, $avatar_path){
    let $obj = $('.nth-user[value="' + $seatNumber + '"]').parent();
    let user_circle = $obj.children('.user-circle');
    let html = '<img src="' + $avatar_path + '">';
    user_circle.html(html);
    user_circle.removeClass('unseated');
    user_circle.addClass('seated');
    $obj.children('.user-name').html($username);
}

function unSeatOther($seatNumber){
    let $obj = $('.nth-user[value="' + $seatNumber + '"]').parent();
    let user_circle = $obj.children('.user-circle');
    user_circle.html('入座');
    user_circle.removeClass('seated');
    user_circle.addClass('unseated');
    $obj.children('.user-name').html('');
}

function setStatusBar($str){
    $('.game-status').html($str);
}