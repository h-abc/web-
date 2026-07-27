const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

// 数据目录
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
const dbPath = path.join(dataDir, 'worldcup.db');

const db = new Database(dbPath);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// 建表
db.exec(`
  CREATE TABLE IF NOT EXISTS teams (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    flag TEXT,
    group_name TEXT
  );
  CREATE TABLE IF NOT EXISTS matches (
    id INTEGER PRIMARY KEY,
    home_team_id INTEGER NOT NULL,
    away_team_id INTEGER NOT NULL,
    group_name TEXT,
    match_date TEXT,
    score_home INTEGER,
    score_away INTEGER,
    stage TEXT,
    status TEXT DEFAULT 'FINISHED',
    FOREIGN KEY (home_team_id) REFERENCES teams(id),
    FOREIGN KEY (away_team_id) REFERENCES teams(id)
  );
  CREATE TABLE IF NOT EXISTS predictions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    match_id INTEGER NOT NULL,
    username TEXT NOT NULL,
    predicted_home INTEGER,
    predicted_away INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (match_id) REFERENCES matches(id)
  );
  CREATE TABLE IF NOT EXISTS comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    match_id INTEGER,
    username TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (match_id) REFERENCES matches(id)
  );
`);

// 仅在数据库为空时插入预置数据
if (db.prepare('SELECT COUNT(*) AS cnt FROM teams').get().cnt === 0) {
  // ---------- 球队数据 ----------
  const teams = [
    [1,"墨西哥","🇲🇽","A"], [2,"南非","🇿🇦","A"], [3,"韩国","🇰🇷","A"], [4,"捷克","🇨🇿","A"],
    [5,"瑞士","🇨🇭","B"], [6,"加拿大","🇨🇦","B"], [7,"波黑","🇧🇦","B"], [8,"卡塔尔","🇶🇦","B"],
    [9,"巴西","🇧🇷","C"], [10,"摩洛哥","🇲🇦","C"], [11,"苏格兰","🏴","C"], [12,"海地","🇭🇹","C"],
    [13,"美国","🇺🇸","D"], [14,"巴拉圭","🇵🇾","D"], [15,"澳大利亚","🇦🇺","D"], [16,"土耳其","🇹🇷","D"],
    [17,"德国","🇩🇪","E"], [18,"科特迪瓦","🇨🇮","E"], [19,"厄瓜多尔","🇪🇨","E"], [20,"库拉索","🇨🇼","E"],
    [21,"荷兰","🇳🇱","F"], [22,"日本","🇯🇵","F"], [23,"瑞典","🇸🇪","F"], [24,"突尼斯","🇹🇳","F"],
    [25,"比利时","🇧🇪","G"], [26,"埃及","🇪🇬","G"], [27,"伊朗","🇮🇷","G"], [28,"新西兰","🇳🇿","G"],
    [29,"西班牙","🇪🇸","H"], [30,"佛得角","🇨🇻","H"], [31,"乌拉圭","🇺🇾","H"], [32,"沙特","🇸🇦","H"],
    [33,"法国","🇫🇷","I"], [34,"挪威","🇳🇴","I"], [35,"塞内加尔","🇸🇳","I"], [36,"伊拉克","🇮🇶","I"],
    [37,"阿根廷","🇦🇷","J"], [38,"奥地利","🇦🇹","J"], [39,"阿尔及利亚","🇩🇿","J"], [40,"约旦","🇯🇴","J"],
    [41,"葡萄牙","🇵🇹","K"], [42,"哥伦比亚","🇨🇴","K"], [43,"刚果(金)","🇨🇩","K"], [44,"乌兹别克斯坦","🇺🇿","K"],
    [45,"英格兰","🏴","L"], [46,"克罗地亚","🇭🇷","L"], [47,"加纳","🇬🇭","L"], [48,"巴拿马","🇵🇦","L"]
  ];
  const insertTeam = db.prepare('INSERT INTO teams VALUES (?,?,?,?)');
  teams.forEach(t => insertTeam.run(t[0], t[1], t[2], t[3]));

  // ---------- 比赛数据（小组赛 72 场 + 淘汰赛 32 场） ----------
  const matches = [
    // A组
    [1,1,2,"A","6.12 03:00",2,0,"GROUP","FINISHED"],
    [2,3,4,"A","6.12 10:00",2,1,"GROUP","FINISHED"],
    [3,4,2,"A","6.19 00:00",1,1,"GROUP","FINISHED"],
    [4,1,3,"A","6.19 09:00",1,0,"GROUP","FINISHED"],
    [5,2,3,"A","6.25 09:00",1,0,"GROUP","FINISHED"],
    [6,4,1,"A","6.25 09:00",0,3,"GROUP","FINISHED"],
    // B组
    [7,6,7,"B","6.13 03:00",1,1,"GROUP","FINISHED"],
    [8,8,5,"B","6.14 03:00",1,1,"GROUP","FINISHED"],
    [9,5,7,"B","6.19 03:00",4,1,"GROUP","FINISHED"],
    [10,6,8,"B","6.19 06:00",6,0,"GROUP","FINISHED"],
    [11,5,6,"B","6.25 03:00",2,1,"GROUP","FINISHED"],
    [12,7,8,"B","6.25 03:00",3,1,"GROUP","FINISHED"],
    // C组
    [13,9,10,"C","6.14 06:00",1,1,"GROUP","FINISHED"],
    [14,12,11,"C","6.14 09:00",0,1,"GROUP","FINISHED"],
    [15,11,10,"C","6.20 06:00",0,1,"GROUP","FINISHED"],
    [16,9,12,"C","6.20 08:30",3,0,"GROUP","FINISHED"],
    [17,11,9,"C","6.25 06:00",0,3,"GROUP","FINISHED"],
    [18,10,12,"C","6.25 06:00",4,2,"GROUP","FINISHED"],
    // D组
    [19,13,14,"D","6.13 09:00",4,1,"GROUP","FINISHED"],
    [20,15,16,"D","6.14 12:00",2,0,"GROUP","FINISHED"],
    [21,13,15,"D","6.20 03:00",2,0,"GROUP","FINISHED"],
    [22,16,14,"D","6.20 11:00",0,1,"GROUP","FINISHED"],
    [23,16,13,"D","6.26 10:00",3,2,"GROUP","FINISHED"],
    [24,14,15,"D","6.26 10:00",0,0,"GROUP","FINISHED"],
    // E组
    [25,17,20,"E","6.15 01:00",7,1,"GROUP","FINISHED"],
    [26,18,19,"E","6.15 07:00",1,0,"GROUP","FINISHED"],
    [27,17,18,"E","6.21 04:00",2,1,"GROUP","FINISHED"],
    [28,19,20,"E","6.21 08:00",0,0,"GROUP","FINISHED"],
    [29,20,18,"E","6.26 04:00",0,2,"GROUP","FINISHED"],
    [30,19,17,"E","6.26 04:00",2,1,"GROUP","FINISHED"],
    // F组
    [31,21,22,"F","6.15 04:00",2,2,"GROUP","FINISHED"],
    [32,23,24,"F","6.15 10:00",5,1,"GROUP","FINISHED"],
    [33,21,23,"F","6.21 01:00",5,1,"GROUP","FINISHED"],
    [34,24,22,"F","6.21 12:00",0,4,"GROUP","FINISHED"],
    [35,24,21,"F","6.26 07:00",1,3,"GROUP","FINISHED"],
    [36,22,23,"F","6.26 07:00",1,1,"GROUP","FINISHED"],
    // G组
    [37,25,26,"G","6.16 03:00",1,1,"GROUP","FINISHED"],
    [38,27,28,"G","6.16 09:00",2,2,"GROUP","FINISHED"],
    [39,25,27,"G","6.22 03:00",0,0,"GROUP","FINISHED"],
    [40,28,26,"G","6.22 09:00",1,3,"GROUP","FINISHED"],
    [41,26,27,"G","6.27 11:00",1,1,"GROUP","FINISHED"],
    [42,28,25,"G","6.27 11:00",1,5,"GROUP","FINISHED"],
    // H组
    [43,29,30,"H","6.16 00:00",0,0,"GROUP","FINISHED"],
    [44,32,31,"H","6.16 06:00",1,1,"GROUP","FINISHED"],
    [45,29,32,"H","6.22 00:00",4,0,"GROUP","FINISHED"],
    [46,31,30,"H","6.22 06:00",2,2,"GROUP","FINISHED"],
    [47,30,32,"H","6.27 08:00",0,0,"GROUP","FINISHED"],
    [48,31,29,"H","6.27 08:00",0,1,"GROUP","FINISHED"],
    // I组
    [49,33,35,"I","6.17 03:00",3,1,"GROUP","FINISHED"],
    [50,36,34,"I","6.17 06:00",1,4,"GROUP","FINISHED"],
    [51,33,36,"I","6.23 05:00",3,0,"GROUP","FINISHED"],
    [52,34,35,"I","6.23 08:00",3,2,"GROUP","FINISHED"],
    [53,34,33,"I","6.27 03:00",1,4,"GROUP","FINISHED"],
    [54,35,36,"I","6.27 03:00",5,0,"GROUP","FINISHED"],
    // J组
    [55,37,39,"J","6.17 09:00",3,0,"GROUP","FINISHED"],
    [56,38,40,"J","6.17 12:00",3,1,"GROUP","FINISHED"],
    [57,37,38,"J","6.23 01:00",2,0,"GROUP","FINISHED"],
    [58,40,39,"J","6.23 11:00",1,2,"GROUP","FINISHED"],
    [59,39,38,"J","6.28 10:00",3,3,"GROUP","FINISHED"],
    [60,40,37,"J","6.28 10:00",1,3,"GROUP","FINISHED"],
    // K组
    [61,41,43,"K","6.18 01:00",1,1,"GROUP","FINISHED"],
    [62,44,42,"K","6.18 10:00",1,3,"GROUP","FINISHED"],
    [63,41,44,"K","6.24 01:00",5,0,"GROUP","FINISHED"],
    [64,42,43,"K","6.24 10:00",1,0,"GROUP","FINISHED"],
    [65,42,41,"K","6.28 07:30",0,0,"GROUP","FINISHED"],
    [66,43,44,"K","6.28 07:30",3,1,"GROUP","FINISHED"],
    // L组
    [67,45,46,"L","6.18 04:00",4,2,"GROUP","FINISHED"],
    [68,47,48,"L","6.18 07:00",1,0,"GROUP","FINISHED"],
    [69,45,47,"L","6.24 04:00",0,0,"GROUP","FINISHED"],
    [70,48,46,"L","6.24 07:00",0,1,"GROUP","FINISHED"],
    [71,48,45,"L","6.28 05:00",0,2,"GROUP","FINISHED"],
    [72,46,47,"L","6.28 05:00",2,1,"GROUP","FINISHED"],
    // 1/16 决赛
    [73,42,47,null,"7.04 09:30",1,0,"R32","FINISHED"],
    [74,37,30,null,"7.04 06:00",3,2,"R32","FINISHED"],
    [75,15,26,null,"7.04 02:00",3,3,"R32","FINISHED"],
    [76,5,39,null,"7.03 11:00",2,0,"R32","FINISHED"],
    [77,41,46,null,"7.03 07:00",2,1,"R32","FINISHED"],
    [78,29,38,null,"7.03 03:00",3,0,"R32","FINISHED"],
    [79,13,7,null,"7.02 08:00",2,0,"R32","FINISHED"],
    [80,25,35,null,"7.02 04:00",3,2,"R32","FINISHED"],
    [81,45,43,null,"7.02 00:00",2,1,"R32","FINISHED"],
    [82,1,19,null,"7.01 10:00",2,0,"R32","FINISHED"],
    [83,33,23,null,"7.01 05:00",3,0,"R32","FINISHED"],
    [84,18,34,null,"7.01 01:00",1,2,"R32","FINISHED"],
    [85,21,10,null,"6.30 09:00",3,3,"R32","FINISHED"],
    [86,17,14,null,"6.30 04:30",4,4,"R32","FINISHED"],
    [87,9,22,null,"6.30 01:00",2,1,"R32","FINISHED"],
    [88,2,6,null,"6.29 03:00",0,1,"R32","FINISHED"],
    // 1/8 决赛
    [89,5,42,null,"7.08 04:00",4,4,"R16","FINISHED"],
    [90,37,26,null,"7.08 00:00",3,2,"R16","FINISHED"],
    [91,13,25,null,"7.07 08:00",1,4,"R16","FINISHED"],
    [92,41,29,null,"7.07 03:00",0,1,"R16","FINISHED"],
    [93,1,45,null,"7.06 09:00",2,3,"R16","FINISHED"],
    [94,9,34,null,"7.06 04:00",1,2,"R16","FINISHED"],
    [95,14,33,null,"7.05 05:00",0,1,"R16","FINISHED"],
    [96,6,10,null,"7.05 01:00",0,3,"R16","FINISHED"],
    // 1/4 决赛
    [97,37,5,null,"7.12 09:00",3,1,"QF","FINISHED"],
    [98,34,45,null,"7.12 05:00",1,2,"QF","FINISHED"],
    [99,29,25,null,"7.11 03:00",2,1,"QF","FINISHED"],
    [100,33,10,null,"7.10 04:00",2,0,"QF","FINISHED"],
    // 半决赛
    [101,45,37,null,"7.16 03:00",1,2,"SF","FINISHED"],
    [102,33,29,null,"7.15 03:00",0,2,"SF","FINISHED"],
    // 季军赛
    [103,33,45,null,"7.19 05:00",4,6,"3RD","FINISHED"],
    // 决赛
    [104,29,37,null,"7.20 03:00",1,0,"FINAL","FINISHED"]
  ];
  const insertMatch = db.prepare('INSERT INTO matches (id, home_team_id, away_team_id, group_name, match_date, score_home, score_away, stage, status) VALUES (?,?,?,?,?,?,?,?,?)');
  matches.forEach(m => insertMatch.run(m[0], m[1], m[2], m[3], m[4], m[5], m[6], m[7], m[8]));
}

module.exports = db;
