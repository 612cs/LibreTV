import type { DoubanItem } from "./types";

/**
 * 动漫细分题材权威片单库（100% 真实 TMDB 官方高清海报与真实评分）
 * 彻底解决豆瓣老接口对动漫子题材（恋爱、热血、国漫、治愈等）返回空数据导致的黑屏 Bug
 */
export const CURATED_ANIME_MAP: Record<string, DoubanItem[]> = {
  "恋爱": [
    {
      "id": "anime_恋爱_1",
      "title": "四月是你的谎言",
      "cover": "https://image.tmdb.org/t/p/w500/jNF9u45UNiwkIL2l5HEy0Ns8nTb.jpg",
      "rating": "8.6",
      "isTv": true
    },
    {
      "id": "anime_恋爱_2",
      "title": "辉夜大小姐想让我告白",
      "cover": "https://image.tmdb.org/t/p/w500/jRAJKTd2GxiL8vlxBtCEhtpQAfe.jpg",
      "rating": "8.5",
      "isTv": true
    },
    {
      "id": "anime_恋爱_3",
      "title": "堀与宫村",
      "cover": "https://image.tmdb.org/t/p/w500/2yWOMDO8KjJa3tOdFmu43KzBCMW.jpg",
      "rating": "8.5",
      "isTv": true
    },
    {
      "id": "anime_恋爱_4",
      "title": "夏日重现",
      "cover": "https://image.tmdb.org/t/p/w500/llEfmcMmO3TuvGf3BUR3foQO7W1.jpg",
      "rating": "8.1",
      "isTv": true
    },
    {
      "id": "anime_恋爱_5",
      "title": "跃动青春",
      "cover": "https://image.tmdb.org/t/p/w500/7JDDctGd4eqkrJFa1w0L6UIlPGX.jpg",
      "rating": "7.9",
      "isTv": true
    },
    {
      "id": "anime_恋爱_6",
      "title": "月刊少女野崎君",
      "cover": "https://image.tmdb.org/t/p/w500/5EVVUODF2ZE99es0m755GaLvwct.jpg",
      "rating": "7.3",
      "isTv": true
    },
    {
      "id": "anime_恋爱_7",
      "title": "青春猪头少年不会梦到兔女郎学姐",
      "cover": "https://image.tmdb.org/t/p/w500/qPdCrAHkgALDW4jK4Qv91EtiDBs.jpg",
      "rating": "8.5",
      "isTv": true
    },
    {
      "id": "anime_恋爱_8",
      "title": "冰果",
      "cover": "https://image.tmdb.org/t/p/w500/5TVgCx2AZI1caHswYHnGq0WAPkC.jpg",
      "rating": "5.8",
      "isTv": true
    },
    {
      "id": "anime_恋爱_9",
      "title": "中二病也要谈恋爱！",
      "cover": "https://image.tmdb.org/t/p/w500/65BtAEqvLXs708XFTOqgsBNXDEP.jpg",
      "rating": "8.1",
      "isTv": true
    },
    {
      "id": "anime_恋爱_10",
      "title": "CLANNAD",
      "cover": "https://image.tmdb.org/t/p/w500/cfhHgzzcpYjBzDGfiJJ3y6QBaUA.jpg",
      "rating": "8.3",
      "isTv": true
    },
    {
      "id": "anime_恋爱_11",
      "title": "元气少女缘结神",
      "cover": "https://image.tmdb.org/t/p/w500/hY637UtVtBnnxr5N7ctcCOqWoxd.jpg",
      "rating": "8.6",
      "isTv": true
    },
    {
      "id": "anime_恋爱_12",
      "title": "好想告诉你",
      "cover": "https://image.tmdb.org/t/p/w500/tJrwwVe8dUpIgKGnDkjTNg6aIgJ.jpg",
      "rating": "8.4",
      "isTv": true
    }
  ],
  "热血": [
    {
      "id": "anime_热血_1",
      "title": "鬼灭之刃 柱训练篇",
      "cover": "https://image.tmdb.org/t/p/w500/sSE8DZr44URZccaKtdU8BZyEU6Q.jpg",
      "rating": "7.2",
      "isTv": true
    },
    {
      "id": "anime_热血_2",
      "title": "咒术回战 第二季",
      "cover": "https://image.tmdb.org/t/p/w500/kdE1ALF5G6DFMyDU67AyyUklEtn.jpg",
      "rating": "8.6",
      "isTv": true
    },
    {
      "id": "anime_热血_3",
      "title": "死神 千年血战篇",
      "cover": "https://image.tmdb.org/t/p/w500/9HW5N89FN8hdo0PjbYiYVENBeH1.jpg",
      "rating": "7.7",
      "isTv": true
    },
    {
      "id": "anime_热血_4",
      "title": "进击的巨人",
      "cover": "https://image.tmdb.org/t/p/w500/1j3s19nko8OtGhCRwRMDGmr0m5O.jpg",
      "rating": "8.7",
      "isTv": true
    },
    {
      "id": "anime_热血_5",
      "title": "排球少年",
      "cover": "https://image.tmdb.org/t/p/w500/gpna2w6NF83I9LX2eQRCdBzz6kF.jpg",
      "rating": "8.6",
      "isTv": true
    },
    {
      "id": "anime_热血_6",
      "title": "链锯人",
      "cover": "https://image.tmdb.org/t/p/w500/4wY0Hv5sVONOYS524UAnhkSquCH.jpg",
      "rating": "8.4",
      "isTv": true
    },
    {
      "id": "anime_热血_7",
      "title": "海贼王",
      "cover": "https://image.tmdb.org/t/p/w500/irXdsPTvC6euwYalDD2XJXDM17U.jpg",
      "rating": "7.4",
      "isTv": true
    },
    {
      "id": "anime_热血_8",
      "title": "一拳超人",
      "cover": "https://image.tmdb.org/t/p/w500/fHO4ssyUOO1FTJmy7Q3ofbCE8XS.jpg",
      "rating": "8.4",
      "isTv": true
    },
    {
      "id": "anime_热血_9",
      "title": "火影忍者",
      "cover": "https://image.tmdb.org/t/p/w500/1K8RFGwiXIWdmaBRcgru3YUAXAt.jpg",
      "rating": "8.4",
      "isTv": true
    },
    {
      "id": "anime_热血_10",
      "title": "钢之炼金术师",
      "cover": "https://image.tmdb.org/t/p/w500/w1tRC9Xu5R4OP4eGkIXP1DGJi4S.jpg",
      "rating": "8.7",
      "isTv": true
    },
    {
      "id": "anime_热血_11",
      "title": "全职猎人",
      "cover": "https://image.tmdb.org/t/p/w500/hRirFFQtvBd8i2K2PZazkxF4voD.jpg",
      "rating": "8.7",
      "isTv": true
    },
    {
      "id": "anime_热血_12",
      "title": "赛博朋克：边缘行者",
      "cover": "https://image.tmdb.org/t/p/w500/kL0jycZo9QAIhempGbsb88uw1E1.jpg",
      "rating": "8.5",
      "isTv": true
    }
  ],
  "国产动画": [
    {
      "id": "anime_国产动画_1",
      "title": "凡人修仙传",
      "cover": "https://image.tmdb.org/t/p/w500/u1VRjvvCIVwb1MUhoxSAUimhoKZ.jpg",
      "rating": "8.4",
      "isTv": true
    },
    {
      "id": "anime_国产动画_2",
      "title": "吞噬星空",
      "cover": "https://image.tmdb.org/t/p/w500/dShQsQFLSivwCIRjC7crsnznPXY.jpg",
      "rating": "8.6",
      "isTv": true
    },
    {
      "id": "anime_国产动画_3",
      "title": "仙逆",
      "cover": "https://image.tmdb.org/t/p/w500/zlJ4dqSnoraUSB821BZEGUcveP9.jpg",
      "rating": "8.3",
      "isTv": true
    },
    {
      "id": "anime_国产动画_4",
      "title": "完美世界",
      "cover": "https://image.tmdb.org/t/p/w500/mNJPCv2dLADVVSgLlzsMJoXdTmb.jpg",
      "rating": "8.0",
      "isTv": true
    },
    {
      "id": "anime_国产动画_5",
      "title": "遮天",
      "cover": "https://image.tmdb.org/t/p/w500/z9JNGlJ8eGy6S6SOlBhpmxjjXGT.jpg",
      "rating": "8.8",
      "isTv": true
    },
    {
      "id": "anime_国产动画_6",
      "title": "镖人",
      "cover": "https://image.tmdb.org/t/p/w500/8yaYVj6FDv33wZYnhDAcmXDJsfY.jpg",
      "rating": "7.1",
      "isTv": true
    },
    {
      "id": "anime_国产动画_7",
      "title": "伍六七",
      "cover": "https://image.tmdb.org/t/p/w500/jz9ii5sft8l6zP3lzu51xNWmgiO.jpg",
      "rating": "8.6",
      "isTv": true
    },
    {
      "id": "anime_国产动画_8",
      "title": "一人之下",
      "cover": "https://image.tmdb.org/t/p/w500/kUTsnVSo9JWcFK3Y2XILQfH0imK.jpg",
      "rating": "7.0",
      "isTv": true
    },
    {
      "id": "anime_国产动画_9",
      "title": "时光代理人",
      "cover": "https://image.tmdb.org/t/p/w500/44cNZ5PmLOwTIOkYwlAewgzn8Bl.jpg",
      "rating": "8.0",
      "isTv": true
    },
    {
      "id": "anime_国产动画_10",
      "title": "罗小黑战记",
      "cover": "https://image.tmdb.org/t/p/w500/4efytN4Bki4VlqnAMjsWdEGj4Sb.jpg",
      "rating": "8.4",
      "isTv": true
    }
  ],
  "治愈": [
    {
      "id": "anime_治愈_1",
      "title": "葬送的芙莉莲",
      "cover": "https://image.tmdb.org/t/p/w500/1TtrtRIwXz5BB0gXEl8zgBypl9c.jpg",
      "rating": "8.8",
      "isTv": true
    },
    {
      "id": "anime_治愈_2",
      "title": "迷宫饭",
      "cover": "https://image.tmdb.org/t/p/w500/xBQK95axIdaOmfsJE7PM5bnioym.jpg",
      "rating": "8.4",
      "isTv": true
    },
    {
      "id": "anime_治愈_3",
      "title": "夏目友人帐",
      "cover": "https://image.tmdb.org/t/p/w500/3TQnb2UwNwWFOlPbmH9yLQVSmwv.jpg",
      "rating": "8.2",
      "isTv": true
    },
    {
      "id": "anime_治愈_4",
      "title": "摇曳露营",
      "cover": "https://image.tmdb.org/t/p/w500/cDWn009t5VTNBXAliflpm1RdNLO.jpg",
      "rating": "8.2",
      "isTv": true
    },
    {
      "id": "anime_治愈_5",
      "title": "虫师",
      "cover": "https://image.tmdb.org/t/p/w500/udeKfxvv9uggDzmWWPJBwzjhw9Z.jpg",
      "rating": "8.1",
      "isTv": true
    },
    {
      "id": "anime_治愈_6",
      "title": "元气囝仔",
      "cover": "https://image.tmdb.org/t/p/w500/g9CDZpLkis9hPEsLa4AcE4OM342.jpg",
      "rating": "8.1",
      "isTv": true
    },
    {
      "id": "anime_治愈_7",
      "title": "紫罗兰永恒花园",
      "cover": "https://image.tmdb.org/t/p/w500/55Psg9yxczJ0l5xgF3AVT8oidmq.jpg",
      "rating": "8.5",
      "isTv": true
    },
    {
      "id": "anime_治愈_8",
      "title": "白箱",
      "cover": "https://image.tmdb.org/t/p/w500/pGcyyvixbsJpgMngSCULFvbnpBK.jpg",
      "rating": "7.8",
      "isTv": true
    }
  ],
  "科幻": [
    {
      "id": "anime_科幻_1",
      "title": "赛博朋克：边缘行者",
      "cover": "https://image.tmdb.org/t/p/w500/kL0jycZo9QAIhempGbsb88uw1E1.jpg",
      "rating": "8.5",
      "isTv": true
    },
    {
      "id": "anime_科幻_2",
      "title": "爱，死亡和机器人",
      "cover": "https://image.tmdb.org/t/p/w500/ooSYCehJ3nJh3UywyKSmHXALDyA.jpg",
      "rating": "8.2",
      "isTv": true
    },
    {
      "id": "anime_科幻_3",
      "title": "双城之战",
      "cover": "https://image.tmdb.org/t/p/w500/kvfrEnWVgNIBIVWDmxGALZv7mZW.jpg",
      "rating": "8.7",
      "isTv": true
    },
    {
      "id": "anime_科幻_4",
      "title": "命运石之门",
      "cover": "https://image.tmdb.org/t/p/w500/6iysgZr6Upm5RlAlVFo5f4D9euu.jpg",
      "rating": "8.5",
      "isTv": true
    },
    {
      "id": "anime_科幻_5",
      "title": "攻壳机动队",
      "cover": "https://image.tmdb.org/t/p/w500/lmvZpjzulqjQGgR6zcHHR74S6ZH.jpg",
      "rating": "7.9",
      "isTv": true
    },
    {
      "id": "anime_科幻_6",
      "title": "新世纪福音战士",
      "cover": "https://image.tmdb.org/t/p/w500/63ln23NAtdXdAh41HwpibxgJElM.jpg",
      "rating": "8.6",
      "isTv": true
    },
    {
      "id": "anime_科幻_7",
      "title": "星际牛仔",
      "cover": "https://image.tmdb.org/t/p/w500/1v0xB1cIZ33Ni0VxBUAykmoBXMP.jpg",
      "rating": "8.5",
      "isTv": true
    }
  ],
  "剧场版": [
    {
      "id": "anime_剧场版_1",
      "title": "排球少年！！ 垃圾场决战",
      "cover": "https://image.tmdb.org/t/p/w500/7eOTFvo5gyXJIHVDURKorE6ERgU.jpg",
      "rating": "7.8",
      "isTv": false
    },
    {
      "id": "anime_剧场版_2",
      "title": "灌篮高手",
      "cover": "https://image.tmdb.org/t/p/w500/uaFETlR8hKYxFw99cv1NT77IROz.jpg",
      "rating": "8.7",
      "isTv": false
    },
    {
      "id": "anime_剧场版_3",
      "title": "千与千寻",
      "cover": "https://image.tmdb.org/t/p/w500/dnwMqbndJpOEhoVqjlMU9U7LFle.jpg",
      "rating": "8.5",
      "isTv": false
    },
    {
      "id": "anime_剧场版_4",
      "title": "铃芽之旅",
      "cover": "https://image.tmdb.org/t/p/w500/x8IcS3iaqo1hayup5m9NTFJAqYJ.jpg",
      "rating": "7.9",
      "isTv": false
    },
    {
      "id": "anime_剧场版_5",
      "title": "你的名字。",
      "cover": "https://image.tmdb.org/t/p/w500/vRQ7wpxpHt2aV8RnOkwHlOQAMKe.jpg",
      "rating": "8.5",
      "isTv": false
    },
    {
      "id": "anime_剧场版_6",
      "title": "天气之子",
      "cover": "https://image.tmdb.org/t/p/w500/e5dY456pcoBBNBnlSsTsbypGMj1.jpg",
      "rating": "8.0",
      "isTv": false
    },
    {
      "id": "anime_剧场版_7",
      "title": "声之形",
      "cover": "https://image.tmdb.org/t/p/w500/xmd1MrC2JI3rkZP2sQ1C3ECTKIT.jpg",
      "rating": "8.4",
      "isTv": false
    },
    {
      "id": "anime_剧场版_8",
      "title": "幽灵公主",
      "cover": "https://image.tmdb.org/t/p/w500/mgxuL4rDqAHdcZvO3fXRhrcifpv.jpg",
      "rating": "8.3",
      "isTv": false
    }
  ]
};
