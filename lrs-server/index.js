const Role = {
  WEREWOLF: 0,
  TOWNSFOLK: 1,
  SEER: 2,
  WITCH: 3,
  HUNTER: 4,
  IDIOT: 5
}
Object.freeze(Role);

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

var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var mysql = require('mysql');

var game_pattern = -1;
var isInGame = false;
var roleAssignment = [];
var deadSeats = [];
var sheriffHuntStatus = [];
var maxNumber = 12;
var seatInfos = [];
var sheriffHuntVotes = [];
for(let i = 0; i < maxNumber; i++){
  seatInfos[i] = "";
  sheriffHuntStatus[i] = SheriffHuntStatus.CANCEL;
  sheriffHuntVotes[i] = -1;
}

// to hold status for judge
var nightCount = 1;
var nextRoleIndex = 0;
var witchHasCure = true;
var witchHasPoison = true;
var seerSurvive = true;
var hunterStatusCapable = true;
var activeTarget = -1;
var nightActionsHtml = '';
var deads = {};
var statusBarText = '';

app.get('/', function(req, res){
});

io.on('connection', function(socket){
  socket.on('disconnect', function(){
  });
  socket.on('data nightCount', function($nightCount){
    nightCount = $nightCount;
  });
  socket.on('data nextRoleIndex', function($nextRoleIndex){
    nextRoleIndex = $nextRoleIndex;
  });
  socket.on('data witchHasCure', function($witchHasCure){
    witchHasCure = $witchHasCure;
  });
  socket.on('data witchHasPoison', function($witchHasPoison){
    witchHasPoison = $witchHasPoison;
  });
  socket.on('data seerSurvive', function($seerSurvive){
    seerSurvive = $seerSurvive;
  });
  socket.on('data hunterStatusCapable', function($hunterStatusCapable){
    hunterStatusCapable = $hunterStatusCapable;
  });
  socket.on('data activeTarget', function($activeTarget){
    activeTarget = $activeTarget;
  });
  socket.on('data nightActionsHtml', function($nightActionsHtml){
    nightActionsHtml = $nightActionsHtml;
  });
  socket.on('data deads', function($deads){
    deads = $deads;
  });
  socket.on('data statusBarText', function($statusBarText){
    statusBarText = $statusBarText;
  });
  socket.on('get judge data', function(){
    socket.emit('get judge data', { nightCount: nightCount, nextRoleIndex: nextRoleIndex, witchHasCure: witchHasCure, witchHasPoison: witchHasPoison, seerSurvive: seerSurvive, hunterStatusCapable: hunterStatusCapable, activeTarget: activeTarget, nightActionsHtml: nightActionsHtml, deads: deads, statusBarText: statusBarText });
  });
  socket.on('get user info', function($token){
    getUserInfo(socket, mysql, $token);
  });
  socket.on('get role', function($seatNumber){
    socket.emit('get role', roleAssignment[$seatNumber]);
  });
  socket.on('get seat infos', function(){
    socket.emit('get seat infos', { seatInfos: seatInfos, isInGame: isInGame });
  });
  socket.on('get game infos', function(){
    socket.emit('get game infos', { game_pattern: game_pattern, roleAssignment: roleAssignment, deadSeats: deadSeats, sheriffHuntStatus: sheriffHuntStatus });
  });
  socket.on('get death infos', function(){
    socket.emit('get death infos', deadSeats);
  });
  socket.on('sheriff hunt status', function(){
    socket.emit('sheriff hunt status', sheriffHuntStatus);
  });
  socket.on('announce sheriff hunt', function(){
    io.emit('announce sheriff hunt');
    setTimeout(function(){
      io.emit('sheriff hunt status', sheriffHuntStatus);
    }, 10000);
  });
  socket.on('announce sheriff hunt vote', function(){
    socket.broadcast.emit('announce sheriff hunt vote');
    setTimeout(function(){
      io.emit('sheriff hunt vote result', sheriffHuntVotes);
    }, 20000);
  });
  socket.on('announce sheriff hunt vote again', function(){
    socket.broadcast.emit('announce sheriff hunt vote again');
    setTimeout(function(){
      io.emit('sheriff hunt vote result again', sheriffHuntVotes);
    }, 20000);
  });
  socket.on('sheriff hunt vote', function(data){
    let $seatNumber = data.seatNumber;
    let $voteNumber = data.voteNumber;
    sheriffHuntVotes[$seatNumber] = $voteNumber;
  });
  socket.on('sheriff hunt ready', function($seatNumber){
    sheriffHuntStatus[$seatNumber] = SheriffHuntStatus.HUNT;
  });
  socket.on('sheriff hunt quit', function($seatNumber){
    sheriffHuntStatus[$seatNumber] = SheriffHuntStatus.QUIT;
    io.emit('sheriff hunt status', sheriffHuntStatus);
  });
  socket.on('set seat', function(data){
    seatInfos[data.seatNumber] = { username: data.username, avatar_path: data.avatar_path };
    socket.broadcast.emit('set other seat', { seatNumber: data.seatNumber, username: data.username, avatar_path: data.avatar_path });
  });
  socket.on('unseat', function(data){
    seatInfos[data.seatNumber] = "";
    socket.broadcast.emit('unseat other', { seatNumber: data.seatNumber });
  });
  socket.on('set status bar', function($statusText){
    socket.broadcast.emit('set status bar', $statusText);
  });
  socket.on('reset game', function(){
    resetGame();
    socket.broadcast.emit('reset game');
  });
  socket.on('kill one', function(data){
    deadSeats = data.deadSeats;
    socket.broadcast.emit('kill one', data);
  });
  socket.on('set game pattern', function($game_pattern){
    game_pattern = $game_pattern;
    if (GamePattern.YUNVLIEBAI == game_pattern) {
      let roles = [Role.WEREWOLF, Role.WEREWOLF, Role.WEREWOLF, Role.WEREWOLF, Role.TOWNSFOLK, Role.TOWNSFOLK, Role.TOWNSFOLK, Role.TOWNSFOLK, Role.SEER, Role.WITCH, Role.HUNTER, Role.IDIOT];
      for(let i = 0; i < 12; i++){
        let newRole = roles.splice(Math.floor(Math.random()*roles.length), 1);
        roleAssignment[i] = newRole[0];
      }
    }
    isInGame = true;
    io.emit('freeze seat');
    io.emit('role assignment', roleAssignment);
  });
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});

function resetGame(){
  game_pattern = -1;
  isInGame = false;
  roleAssignment = [];
  sheriffHuntStatus = [];
  deadSeats = [];
  maxNumber = 12;
  seatInfos = [];
  sheriffHuntVotes = [];
  for(let i = 0; i < maxNumber; i++){
    seatInfos[i] = "";
    sheriffHuntStatus[i] = SheriffHuntStatus.CANCEL;
    sheriffHuntVotes[i] = -1;
  }

  nightCount = 1;
  nextRoleIndex = 0;
  witchHasCure = true;
  witchHasPoison = true;
  seerSurvive = true;
  hunterStatusCapable = true;
  activeTarget = -1;
  nightActionsHtml = '';
  deads = {};
  statusBarText = '';
}

async function getUserInfo(socket, mysql, token) {
  let con = await connectDB(mysql);
  let sql = "set names 'utf8'";
  await queryDB(con, sql);
  sql = "SELECT username, avatar_path FROM  `user_info` WHERE token = '" + token + "';";
  let result = await queryDB(con, sql);
  if (result.length > 0) {
      socket.emit('get user info', { username: result[0].username, avatar_path: result[0].avatar_path });
  }
  await closeDB(con);
}

function connectDB(mysql, callback) {
  return new Promise(function(resolve, reject) {
      let con = mysql.createConnection({
          host: "localhost",
          user: "lrs",
          password: "65843517",
          database: "lrs"
      });
      con.connect(function(err) {
          if (err) {
              reject(err);
          }
      });
      resolve(con);
  });
}

function queryDB(con, sql) {
  return new Promise(function(resolve, reject) {
      con.query(sql, function (err, result, fields) {
          if (err) {
              reject(err);
          }
          resolve(result);
      });
  });
}

function closeDB(con) {
  return new Promise(function(resolve, reject) {
      con.end();
      resolve();
  });
}