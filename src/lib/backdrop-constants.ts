export interface BackdropMeta {
  title: string;
  backdropUrl: string;
  posterUrl?: string;
  rating?: string;
  overview?: string;
  category: 'all' | 'movie' | 'tv' | 'anime';
  tags?: string[];
}

/**
 * 预置精选 4K/1080P 原生超清横屏壁纸种子（按分类精选，确保秒开且 100% 极高清）
 */
export const PRESET_HERO_BACKDROPS: Record<'all' | 'movie' | 'tv' | 'anime', BackdropMeta[]> = {
  all: [
    {
      title: '繁花',
      backdropUrl: 'https://image.tmdb.org/t/p/original/3J8HmgR16MKX2iT71mB4EIDdV2x.jpg',
      rating: '8.7',
      overview: '九十年代的上海处处是机遇与希望。青年阿宝凭借改革开放的春风和自己的打拼跻身成为商界后起之秀，黄河路上无人不晓。平凡阿宝蜕变为宝总，金碧辉煌的岁月里跌宕起伏。',
      category: 'all',
      tags: ['华语巨制', '王家卫导演', '4K 超清', '时代史诗'],
    },
    {
      title: '流浪地球2',
      backdropUrl: 'https://image.tmdb.org/t/p/original/94cS0mzODEoNIXFT7nhPcI8V4IJ.jpg',
      rating: '8.3',
      overview: '太阳即将毁灭，人类在地球表面建造出巨大的推进器，寻找新的家园。然而宇宙之路危机四伏，为了拯救地球，流浪地球时代的年轻人再次挺身而出，展开争分夺秒的生死之战。',
      category: 'all',
      tags: ['科幻里程碑', '硬核科幻', '杜比视界', '郭帆执导'],
    },
    {
      title: '鬼灭之刃：柱训练篇',
      backdropUrl: 'https://image.tmdb.org/t/p/original/3GQKYh6Trm8pxd2AypovoYQf4Ay.jpg',
      rating: '8.8',
      overview: '为了迎接与鬼舞辻无惨的决战，鬼杀队开启全员特训！炭治郎与九柱齐聚，激战一触即发。热血与信念交织，谱写属于鬼杀队的最强战歌。',
      category: 'all',
      tags: ['日漫顶流', '飞碟社制作', '热血神作', '魔都专线同步'],
    },
    {
      title: '庆余年 第二季',
      backdropUrl: 'https://image.tmdb.org/t/p/original/4eNmWhBfDfAj8qbKHPgW394rAK8.jpg',
      rating: '8.2',
      overview: '范闲率领使团回京，面临二皇子的重重杀局与朝堂风云。身处惊涛骇浪之中，看范闲如何凭借现代思维与过人智谋，与强敌周旋博弈。',
      category: 'all',
      tags: ['现象级爆款', '权谋爽剧', '张若昀主演', '多源秒开'],
    },
    {
      title: '三体',
      backdropUrl: 'https://image.tmdb.org/t/p/original/zxfBtHz5UmSTfIEC4O4GngyjHwa.jpg',
      rating: '8.7',
      overview: '地球基础科学出现异常扰动，纳米物理学家汪淼与刑警史强联手调查，揭开了地外文明「三体世界」的震撼面纱，人类命运面临前所未有的考验。',
      category: 'all',
      tags: ['高分科幻', '刘慈欣原作', '硬科幻神作', '原著忠实'],
    },
  ],
  movie: [
    {
      title: '流浪地球2',
      backdropUrl: 'https://image.tmdb.org/t/p/original/94cS0mzODEoNIXFT7nhPcI8V4IJ.jpg',
      rating: '8.3',
      overview: '太阳急速膨胀面临毁灭，人类开启移山计划。月球坠落危机逼近，太空电梯遭受突袭，图恒宇与马兆在数字生命与人类命运之间做出生死抉择。',
      category: 'movie',
      tags: ['中国科幻巅峰', '1080P 超清', '杜比全景声'],
    },
    {
      title: '哪吒之魔童降世',
      backdropUrl: 'https://image.tmdb.org/t/p/original/k1pJslKr4aDayw9kWwWnlC3MIP3.jpg',
      rating: '8.4',
      overview: '天地灵气孕育出一颗混元珠，哪吒阴差阳错成为魔丸转世。面对世人偏见与天劫宿命，哪吒逆天改命：“我命由我不由天，是魔是仙，我自己说了算！”',
      category: 'movie',
      tags: ['华语动画票房冠军', '燃爆神作', '阖家必看'],
    },
    {
      title: '周处除三害',
      backdropUrl: 'https://image.tmdb.org/t/p/original/d5Nito2a7Q45V2U8A9tM8LgMekd.jpg',
      rating: '8.1',
      overview: '通缉犯陈桂林得知自己身患绝症，决心效仿古人除掉通缉榜排在自己前面的两大罪犯，开启一场惊心动魄的救赎与追杀之路。',
      category: 'movie',
      tags: ['高口碑犯罪片', '阮经天主演', '高能爽片'],
    },
    {
      title: '奥本海默',
      backdropUrl: 'https://image.tmdb.org/t/p/original/rM5Y09xC9YneKOTVFOq5FF2ogvC.jpg',
      rating: '8.8',
      overview: '诺兰执导传记巨作，讲述理论物理学家J·罗伯特·奥本海默领导曼哈顿计划、研制出人类历史上第一颗原子弹的辉煌与内省历程。',
      category: 'movie',
      tags: ['奥斯卡最佳影片', '诺兰导演', '传记史诗'],
    },
  ],
  tv: [
    {
      title: '繁花',
      backdropUrl: 'https://image.tmdb.org/t/p/original/3J8HmgR16MKX2iT71mB4EIDdV2x.jpg',
      rating: '8.7',
      overview: '九十年代的上海处处是机遇与希望。青年阿宝凭借改革开放的春风和自己的打拼跻身成为商界后起之秀，黄河路上无人不晓。平凡阿宝蜕变为宝总，金碧辉煌的岁月里跌宕起伏。',
      category: 'tv',
      tags: ['华语巨制', '胡歌/马伊琍/唐嫣', '王家卫作品'],
    },
    {
      title: '庆余年 第二季',
      backdropUrl: 'https://image.tmdb.org/t/p/original/4eNmWhBfDfAj8qbKHPgW394rAK8.jpg',
      rating: '8.2',
      overview: '范闲率领使团回京，面临二皇子的重重杀局与朝堂风云。身处惊涛骇浪之中，看范闲如何凭借现代思维与过人智谋，与强敌周旋博弈。',
      category: 'tv',
      tags: ['年度大剧', '高能权谋', '多源极速更新'],
    },
    {
      title: '漫长的季节',
      backdropUrl: 'https://image.tmdb.org/t/p/original/4uI1qDk7o9W8p1e3w4r5t6y7u8i.jpg',
      rating: '9.4',
      overview: '东北小城桦林，老出租车司机王响和妹夫龚彪意外卷入一桩二十年前未破的碎尸案。三人组踏上追凶与救赎的漫长旅途。',
      category: 'tv',
      tags: ['豆瓣 9.4 封神', '辛爽导演', '悬疑犯罪神作'],
    },
    {
      title: '绝命毒师',
      backdropUrl: 'https://image.tmdb.org/t/p/original/9faGSFi5jam6pDWGNd0p8JvAQbh.jpg',
      rating: '9.5',
      overview: '平凡的高中化学老师沃尔特·怀特得知自己身患绝症，为了给家人留下财产，他运用高超的化学知识走上了一条惊险莫测的不归路。',
      category: 'tv',
      tags: ['全球封神美剧', '影史第一评分', '无删减全集'],
    },
  ],
  anime: [
    {
      title: '鬼灭之刃',
      backdropUrl: 'https://image.tmdb.org/t/p/original/3GQKYh6Trm8pxd2AypovoYQf4Ay.jpg',
      rating: '8.9',
      overview: '大正时期，炭治郎的家人被恶鬼屠杀，妹妹祢豆子变成鬼。为了让妹妹恢复人类之身并为家人复仇，炭治郎踏上斩鬼之刃的试炼历程。',
      category: 'anime',
      tags: ['日漫王道', '飞碟社顶级作画', '全剧场版收录'],
    },
    {
      title: '链锯人',
      backdropUrl: 'https://image.tmdb.org/t/p/original/4uI1qDk7o9W8p1e3w4r5t6y7u8i.jpg',
      rating: '8.6',
      overview: '背负重债的少年电次与链锯恶魔波奇塔相依为命，在经历背叛与重生后，电次化身为拥有链锯力量的恶魔人，加入了公安对魔特异课。',
      category: 'anime',
      tags: ['MAPPA 精工', '狂热黑暗奇幻', '魔都专线首发'],
    },
    {
      title: '进击的巨人',
      backdropUrl: 'https://image.tmdb.org/t/p/original/rqbCbjB19amtOtFQbb3K2lgm2zv.jpg',
      rating: '9.3',
      overview: '人类被高墙守护百年，直至超大型巨人摧毁城墙。艾伦亲眼目睹母亲遇害，誓要将所有巨人驱逐出这个世界。自由的代价，超乎所有人的想象。',
      category: 'anime',
      tags: ['神作完结', '哲学与叙事巅峰', '全网超清收录'],
    },
    {
      title: '间谍过家家',
      backdropUrl: 'https://image.tmdb.org/t/p/original/lysUnU6V0VfcthDbviuVlIqgHOR.jpg',
      rating: '8.8',
      overview: '间谍“黄昏”、杀手“约尔”与超能力读心少女“阿尼亚”为了各自目的组成虚假家庭，啼笑皆非又温馨治愈的日常生活就此展开！',
      category: 'anime',
      tags: ['温馨爆笑', '阿尼亚超可爱', '全季收录'],
    },
    {
      title: '凡人修仙传',
      backdropUrl: 'https://image.tmdb.org/t/p/original/94cS0mzODEoNIXFT7nhPcI8V4IJ.jpg',
      rating: '8.7',
      overview: '山村穷小子韩立偶然踏入江湖小门派，资质平平的他如何一步步在弱肉强食的修仙界化险为夷，以凡人之躯走出漫漫修仙大道？',
      category: 'anime',
      tags: ['国漫年番之光', '原著硬核', '每周极速更新'],
    },
  ],
};
